import { uploadAttestationFile } from "@/lib/supabase";
import { generateDocxBuffer, type AttestationData } from "@/lib/docx-generator";
import { generatePdfBuffer } from "@/lib/pdf-generator";
import type { AttestationCreateInput } from "@/lib/db";

export function formatDateFr(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function buildAttestationData(input: AttestationCreateInput): AttestationData {
  return {
    director_title_name: input.directorTitleName,
    company_name: input.companyName,
    student_gender: input.studentGender,
    student_full_name: input.studentFullName,
    birth_date: formatDateFr(input.birthDate),
    birth_place: input.birthPlace,
    school_name: input.schoolName,
    filiere: input.filiere,
    start_date: input.startPeriod,
    end_date: input.endPeriod,
    poles: input.poles,
    issue_place: input.issuePlace,
    issue_date: formatDateFr(input.issueDate),
    signatory_name: "Mr Aziz SAIBOU",
    signatory_role: "Le Directeur Général",
  };
}

export async function generateAndUploadFiles(recordId: string, data: AttestationData) {
  const [docxBuffer, pdfBuffer] = await Promise.all([
    generateDocxBuffer(data),
    generatePdfBuffer(data),
  ]);

  const docx = await uploadAttestationFile(
    recordId,
    "attestation.docx",
    Buffer.from(docxBuffer),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  if (docx.error || !docx.url) {
    return { error: docx.error || "Échec de l'upload du DOCX" };
  }

  const pdf = await uploadAttestationFile(recordId, "attestation.pdf", Buffer.from(pdfBuffer), "application/pdf");
  if (pdf.error || !pdf.url) {
    return { error: pdf.error || "Échec de l'upload du PDF" };
  }

  return { docxUrl: docx.url, pdfUrl: pdf.url };
}