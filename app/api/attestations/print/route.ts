import { NextResponse } from "next/server";
import {
  createAttestation,
  getAttestationById,
  updateAttestationFields,
  type AttestationCreateInput,
} from "@/lib/db";
import { generateAndUploadFiles, buildAttestationData } from "@/lib/attestation-service";
import { isAuthenticated } from "@/lib/auth";

interface PrintBody {
  id?: string | null;
  form: AttestationCreateInput;
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as PrintBody;
    const input = body.form;

    if (!input.studentFullName || !input.studentEmail || !input.filiere) {
      return NextResponse.json(
        { error: "Champs requis manquants (nom, email, filière)" },
        { status: 400 }
      );
    }

    // Récupérer un identifiant existant ou créer l'attestation si nouvelle.
    let recordId = body.id ?? null;
    if (recordId) {
      const existing = await getAttestationById(recordId);
      if (!existing) {
        return NextResponse.json({ error: "Attestation introuvable" }, { status: 404 });
      }
    } else {
      const created = await createAttestation(input);
      if (created.error || !created.id) {
        return NextResponse.json({ error: created.error || "Échec de la création" }, { status: 500 });
      }
      recordId = created.id;
    }

    // Générer UN seul jeu de fichiers (PDF + DOCX) à partir des données actuelles du formulaire.
    const data = buildAttestationData(input);
    const files = await generateAndUploadFiles(recordId, data);
    if (files.error) {
      return NextResponse.json({ error: files.error }, { status: 500 });
    }

    // Enregistrer les données & fichiers mis à jour (copie en base de données).
    await updateAttestationFields(recordId, {
      director_title_name: input.directorTitleName,
      company_name: input.companyName,
      student_gender: input.studentGender,
      student_full_name: input.studentFullName,
      birth_date: input.birthDate,
      birth_place: input.birthPlace,
      school_name: input.schoolName,
      filiere: input.filiere,
      student_email: input.studentEmail,
      start_date: input.startPeriod,
      end_date: input.endPeriod,
      poles: input.poles,
      issue_place: input.issuePlace,
      issue_date: input.issueDate,
      pdf_url: files.pdfUrl,
      docx_url: files.docxUrl,
      status: "generated",
    });

    // Renvoyer le PDF généré pour sauvegarde sur le PC de l'utilisateur.
    const pdfResponse = await fetch(files.pdfUrl!);
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: "Impossible de récupérer le PDF généré" }, { status: 500 });
    }
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    const safeName = input.studentFullName.replace(/\s+/g, "_");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Attestation_Stage_${safeName}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de l'impression";
    console.error("Erreur impression attestation :", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}