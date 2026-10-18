export const newUserRole = (email: string, adminEmails: string[]): "admin" | "user" | null => {
  const normalized = email.trim().toLowerCase();
  if (!adminEmails.includes(normalized)) return null;
  return normalized === adminEmails[0] ? "admin" : "user";
};
