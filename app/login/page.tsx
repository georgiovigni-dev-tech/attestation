"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/(auth)/login/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <h1 className="text-xl font-semibold">Connexion</h1>
        <p className="text-sm text-slate-400 mt-2">Accès réservé au tableau de bord de gestion des attestations.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-slate-300 mb-2">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {state?.error ? <p className="text-sm text-rose-400">{state.error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-60"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
