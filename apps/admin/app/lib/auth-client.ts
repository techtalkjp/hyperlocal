import { createAuthClient } from "better-auth/react";

declare global {
  interface Window {
    ENV?: { BETTER_AUTH_URL?: string };
  }
}

function getBaseURL(): string {
  if (typeof window !== "undefined" && window.ENV?.BETTER_AUTH_URL) {
    return window.ENV.BETTER_AUTH_URL;
  }
  return import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:5175";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
