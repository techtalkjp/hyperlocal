import { createAuth } from "~/lib/auth";
import { getEnv } from "~/lib/request-context";
import type { Route } from "./+types/api.auth.$";

export async function loader({ request, context }: Route.LoaderArgs) {
  return await createAuth(getEnv(context)).handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  return await createAuth(getEnv(context)).handler(request);
}
