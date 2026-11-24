import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}
