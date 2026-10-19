import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

const GOOGLE_DEFAULT_MODEL = "gemini-2.5-flash-lite";
const LOCAL_DEFAULT_MODEL = "google/gemma-4-26b-a4b";
const LOCAL_DEFAULT_BASE_URL = "http://localhost:1234/v1";

export const isLocalTranslation = () =>
  process.env.TRANSLATE_PROVIDER === "local" || Boolean(process.env.TRANSLATE_BASE_URL);

export const translationModel = (): LanguageModel => {
  if (isLocalTranslation()) {
    const lmstudio = createOpenAICompatible({
      name: "lmstudio",
      baseURL: process.env.TRANSLATE_BASE_URL ?? LOCAL_DEFAULT_BASE_URL,
      apiKey: process.env.TRANSLATE_API_KEY ?? "lm-studio",
      supportsStructuredOutputs: true,
    });
    return lmstudio(process.env.TRANSLATE_MODEL ?? LOCAL_DEFAULT_MODEL);
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  return google(process.env.TRANSLATE_MODEL ?? GOOGLE_DEFAULT_MODEL);
};
