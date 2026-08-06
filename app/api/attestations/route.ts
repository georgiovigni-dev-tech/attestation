import { NextResponse } from "next/server";
import { getAttestationsFromDb, createAttestation, updateAttestation, type AttestationCreateInput } from "@/lib/db";
import { generateAndUploadFiles, buildAttestationData } from "@/lib/attestation-service";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const attestations = await getAttestationsFromDb();
  return NextResponse.json(attestations);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const input = (await req.json()) as AttestationCreateInput;

    if (!input.studentFullName || !input.studentEmail || !input.filiere) {
      return NextResponse.json(
        { error: "Champs requis manquants (nom, email, filière)" },
        { status: 400 }
      );
    }

    const { id, error: insertError } = await createAttestation(input);
    if (insertError || !id) {
      return NextResponse.json(
        { error: insertError || "Échec de la création" },
        { status: 500 }
      );
    }

    const files = await generateAndUploadFiles(id, buildAttestationData(input));
    if (files.error) {
      return NextResponse.json({ error: files.error }, { status: 500 });
    }

    await updateAttestation(id, { pdf_url: files.pdfUrl!, docx_url: files.docxUrl! });

    return NextResponse.json(
      { id, docxUrl: files.docxUrl, pdfUrl: files.pdfUrl, message: "Attestation créée avec succès" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la création de l'attestation";
    console.error("Erreur création attestation :", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}