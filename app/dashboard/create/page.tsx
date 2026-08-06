import { requireAuth } from "@/lib/auth";

export default async function CreateAttestationPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <h2 className="text-xl font-bold">Création d&apos;attestation</h2>
      <p className="text-sm text-slate-400 mt-2">Le module de création reste disponible après authentification.</p>
    </div>
  );
}
