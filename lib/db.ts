import { supabase } from "@/lib/supabase";

export interface AttestationRecord {
  id: string;
  studentName: string;
  filiere: string;
  school: string;
  issueDate: string;
  status: "sent" | "generated" | "error";
  email: string;
  pdfUrl?: string | null;
  docxUrl?: string | null;
}

export async function getAttestationsFromDb(): Promise<AttestationRecord[]> {
  const { data, error } = await supabase
    .from("attestations")
    .select(
      "id, student_full_name, filiere, school_name, issue_date, status, student_email, pdf_url, docx_url"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur Supabase (lecture attestations) :", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    studentName: row.student_full_name || "-",
    filiere: row.filiere || "-",
    school: row.school_name || "-",
    issueDate: row.issue_date
      ? new Date(row.issue_date).toLocaleDateString("fr-FR")
      : "-",
    status: (row.status as AttestationRecord["status"]) || "generated",
    email: row.student_email || "-",
    pdfUrl: row.pdf_url || null,
    docxUrl: row.docx_url || null,
  }));
}

export async function getDashboardStats() {
  const records = await getAttestationsFromDb();
  const generated = records.filter((item) => item.status !== "error").length;
  const sent = records.filter((item) => item.status === "sent").length;
  const pending = records.filter((item) => item.status === "generated").length;
  const errors = records.filter((item) => item.status === "error").length;

  return { generated, sent, pending, errors };
}

export interface AttestationCreateInput {
  directorTitleName: string;
  companyName: string;
  studentGender: string;
  studentFullName: string;
  birthDate: string;
  birthPlace: string;
  schoolName: string;
  filiere: string;
  studentEmail: string;
  startPeriod: string;
  endPeriod: string;
  poles: string;
  issuePlace: string;
  issueDate: string;
}

export interface AttestationRow {
  id: string;
  director_title_name: string;
  company_name: string;
  student_gender: string;
  student_full_name: string;
  birth_date: string;
  birth_place: string;
  school_name: string;
  filiere: string;
  student_email: string;
  start_date: string;
  end_date: string;
  poles: string;
  issue_place: string;
  issue_date: string;
  signatory_name: string;
  signatory_role: string;
  pdf_url: string | null;
  docx_url: string | null;
  status: string;
  last_sent_at: string | null;
  send_error_log: string | null;
}

export async function createAttestation(
  input: AttestationCreateInput
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("attestations")
    .insert({
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
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }
  return { id: data.id };
}

export async function getAttestationById(
  id: string
): Promise<AttestationRow | null> {
  const { data, error } = await supabase
    .from("attestations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erreur Supabase (lecture attestation) :", error?.message);
    return null;
  }
  return data as AttestationRow;
}

export async function updateAttestation(
  id: string,
  fields: Partial<{
    pdf_url: string;
    docx_url: string;
    status: string;
    last_sent_at: string;
    send_error_log: string | null;
  }>
) {
  const { error } = await supabase
    .from("attestations")
    .update(fields)
    .eq("id", id);

  if (error) {
    console.error("Erreur Supabase (mise à jour attestation) :", error.message);
    return { error: error.message };
  }
  return { success: true };
}

export async function updateAttestationFields(
  id: string,
  fields: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("attestations")
    .update(fields)
    .eq("id", id);

  if (error) {
    console.error("Erreur Supabase (mise à jour attestation) :", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteAttestation(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("attestations").delete().eq("id", id);
  if (error) {
    console.error("Erreur Supabase (suppression attestation) :", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}