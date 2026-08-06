export interface LoginInput {
  password: string;
}

export const loginSchema = {
  safeParse(input: { password: FormDataEntryValue | null | undefined }) {
    const password = typeof input.password === "string" ? input.password : "";

    if (!password.trim()) {
      return {
        success: false as const,
        error: { issues: [{ message: "Mot de passe requis." }] },
      };
    }

    return {
      success: true as const,
      data: { password } satisfies LoginInput,
    };
  },
};
