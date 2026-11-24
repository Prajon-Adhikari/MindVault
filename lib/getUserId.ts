import { verifyAuth } from "@/lib/auth";

export async function getUserId() {
  const user = await verifyAuth();

  if (!user) return null;

  // Supports common JWT payload conventions.
  const id = user.userId ?? user.sub ?? user.id;

  return typeof id === "string" ? id : null;
}
