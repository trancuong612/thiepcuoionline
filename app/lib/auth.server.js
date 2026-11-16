import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { createHash, timingSafeEqual } from "node:crypto";

function getStore() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("Thiếu SESSION_SECRET (ít nhất 32 ký tự) trong .env");
  }
  return createCookieSessionStorage({
    cookie: {
      name: "__wedding_admin",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    },
  });
}

export async function isAdmin(request) {
  const storage = getStore();
  const session = await storage.getSession(request.headers.get("Cookie"));
  return session.get("admin") === true;
}
export async function requireAdmin(request) {
  if (!(await isAdmin(request))) throw redirect("/admin/login");
}
export async function login(request, password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 14) {
    throw new Error("Đặt ADMIN_PASSWORD dài ít nhất 14 ký tự trong .env");
  }
  const digest = (value) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(String(password)), digest(expected))) return null;
  const storage = getStore();
  const session = await storage.getSession(request.headers.get("Cookie"));
  session.set("admin", true);
  return storage.commitSession(session);
}
export async function logout(request) {
  const storage = getStore();
  return storage.destroySession(await storage.getSession(request.headers.get("Cookie")));
}
