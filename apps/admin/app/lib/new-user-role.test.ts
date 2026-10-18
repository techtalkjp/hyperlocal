import { describe, expect, it } from "vite-plus/test";
import { newUserRole } from "./new-user-role";

describe("newUserRole", () => {
  const allowed = ["owner@example.test", "editor@example.test"];

  it("assigns only the designated address as admin regardless of registration order", async () => {
    const roles = await Promise.all(
      ["editor@example.test", "owner@example.test"].map(async (email) =>
        newUserRole(email, allowed),
      ),
    );
    expect(roles).toEqual(["user", "admin"]);
  });

  it("rejects unlisted accounts", () => {
    expect(newUserRole("unknown@example.test", allowed)).toBeNull();
    expect(newUserRole("OWNER@example.test", allowed)).toBe("admin");
  });
});
