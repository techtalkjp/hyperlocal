import type { Place } from "@hyperlocal/db";
import { createHash } from "node:crypto";

// 翻訳対象の原文からハッシュを作る (原文不変なら再翻訳しない)
export const sourceHashOf = (place: Pick<Place, "displayName" | "reviews">) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        displayName: place.displayName,
        reviews: place.reviews.map((r) => ({
          rating: r.rating,
          text: r.originalText?.text ?? null,
        })),
      }),
    )
    .digest("hex");
