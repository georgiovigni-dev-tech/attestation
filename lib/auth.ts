import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "attestation_session";
const DEFAULT_PASSWORD = process.env.ATTESTATION_PASSWORD || "admin123";

export async function login(password: string) {
  if (password !== DEFAULT_PASSWORD) {
    return { error: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === "authenticated";
}

export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }
}
