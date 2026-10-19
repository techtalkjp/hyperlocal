import { translationModel } from "@hyperlocal/ai";
import { languages } from "@hyperlocal/consts";
import type { Place } from "@hyperlocal/db";
import { generateText } from "ai";
import consola from "consola";
import { z } from "zod";
import { validatedReviewTranslations } from "./validated-review-translations";

// 店舗×言語あたり1リクエストにまとめるためのスキーマ
const schema = z.object({
  displayName: z.string(),
  reviews: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      text: z.string(),
    }),
  ),
});

// ローカルモデル (LM Studio 等) は response_format=json_schema で崩れるため、
// 構造化出力に頼らず JSON テキストを抽出してパースする
const parseTranslation = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const json = start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
  return schema.safeParse(JSON.parse(json));
};

// ビルド時に翻訳するレビュー件数 (表示は先頭のみ使うため、残りは訳さない)
const REVIEW_LIMIT = Number(process.env.TRANSLATE_REVIEW_LIMIT ?? 2);

export const translatePlace = async (place: Place, from: string, to: string) => {
  // If source and target languages are the same, return the original object
  if (from === to) {
    return {
      originalDisplayName: place.displayName,
      displayName: place.displayName,
      reviews: place.reviews.map((review) => ({
        rating: review.rating,
        text: review.originalText?.text,
      })),
    };
  }

  const sourceLang = languages.find((l) => l.id === from);
  if (!sourceLang) {
    throw new Error("Source language not found");
  }

  const targetLang = languages.find((l) => l.id === to);
  if (!targetLang) {
    throw new Error("Target language not found");
  }

  const reviewInputs = place.reviews
    .map((review, index) => ({
      index,
      rating: review.rating,
      text: review.originalText?.text,
    }))
    .filter((r) => r.text)
    .slice(0, REVIEW_LIMIT);

  const prompt = [
    `Name: ${place.displayName}`,
    ...reviewInputs.map((r) => `Review ${r.index}: ${r.text}`),
  ].join("\n");

  try {
    const result = await generateText({
      model: translationModel(),
      maxRetries: 3,
      system: `Translate the following ${sourceLang.displayName} restaurant name and customer reviews into ${targetLang.displayName}, item by item. Keep the original meaning and tone so they sound natural in ${targetLang.displayName}. Remove personal information, promotional content, and platform-specific remarks. Do not merge items and do not invent new ones.
Respond with only a JSON object, no markdown code fences, in this shape: {"displayName": string, "reviews": [{"index": number, "text": string}]}. Include one review entry for every input review, keeping its original index.`,
      prompt,
    });

    const parsed = parseTranslation(result.text);
    if (!parsed.success) {
      throw new Error("Translation output is not valid JSON");
    }

    const textsByIndex = validatedReviewTranslations(
      reviewInputs.map((review) => review.index),
      parsed.data.reviews,
    );
    if (!textsByIndex || !parsed.data.displayName.trim()) {
      throw new Error("Translation output does not match the requested reviews");
    }

    return {
      displayName: parsed.data.displayName,
      originalDisplayName: place.displayName,
      reviews: place.reviews.map((review, index) => ({
        rating: review.rating,
        text: textsByIndex.get(index) || undefined,
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      consola.error(place.id, `${from}->${to}`, error.message);
    }
    return {
      displayName: place.displayName,
      originalDisplayName: place.displayName,
      reviews: place.reviews.map((review) => ({
        rating: review.rating,
        text: undefined,
      })),
    };
  }
};
