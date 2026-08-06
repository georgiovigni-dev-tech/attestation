"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Mot de passe requis." };
  }

  const result = await login(parsed.data.password);
  if (result.error) return result;

  redirect("/dashboard");
}
