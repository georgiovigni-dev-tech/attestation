import { NextResponse } from "next/server";
import {
  getAttestationById,
  updateAttestationFields,
  deleteAttestation,
  type AttestationCreateInput,
} from "@/lib/db";
import { generateAndUploadFiles, buildAttestationData } from "@/lib/attestation-service";
import { deleteAttestationFiles } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  const record = await getAttestationById(id);
  if (!record) {
    return NextResponse.json({ error: "Attestation introuvable" }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const id = (await params).id;
    const input = (await req.json()) as AttestationCreateInput;
    const existing = await getAttestationById(id);
    if (!existing) {
      return NextResponse.json({ error: "Attestation introuvable" }, { status: 404 });
    }

    const files = await generateAndUploadFiles(id, buildAttestationData(input));

    const result = await updateAttestationFields(id, {
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
      status: "generated",
      ...(files.error ? {} : { pdf_url: files.pdfUrl, docx_url: files.docxUrl }),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Échec de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ message: "Attestation mise à jour" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la mise à jour";
    console.error("Erreur mise à jour attestation :", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const id = (await params).id;
    await deleteAttestation(id);
    await deleteAttestationFiles(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la suppression";
    console.error("Erreur suppression attestation :", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}