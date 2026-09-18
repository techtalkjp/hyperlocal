import { betterAuth } from "better-auth";
import { getAuthDb } from "./db";
import type { AdminEnv } from "./request-context";

export function createAuth(env: AdminEnv) {
  const adminEmails = (env.ADMIN_EMAILS ?? "coji@techtalk.jp")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:5175",
    secret: env.BETTER_AUTH_SECRET,
    database: {
      db: getAuthDb(env),
      type: "sqlite",
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // coji@techtalk.jp 以外は作らせない
            if (!adminEmails.includes(user.email.toLowerCase())) {
              return false;
            }
            // 最初のユーザーを管理者にする
            const existingUsers = await getAuthDb(env)
              .selectFrom("user")
              .select("id")
              .limit(1)
              .execute();

            if (existingUsers.length === 0) {
              return {
                data: {
                  ...user,
                  role: "admin",
                },
              };
            }
            return { data: user };
          },
        },
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
      },
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    session: {
      fields: {
        userId: "user_id",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    account: {
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        idToken: "id_token",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
  });
}
