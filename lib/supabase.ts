import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises."
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const STORAGE_BUCKET = "attestations-files";

export async function uploadAttestationFile(
  recordId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string
) {
  const path = `${recordId}/${fileName}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { upsert: true, contentType });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function downloadAttestationFile(publicUrl: string) {
  const response = await fetch(publicUrl);
  if (!response.ok) {
    return { error: `Impossible de récupérer le fichier : ${response.status}` };
  }
  return { buffer: Buffer.from(await response.arrayBuffer()) };
}

export async function deleteAttestationFiles(recordId: string) {
  const { data, error: listError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(recordId);

  if (listError) {
    return { error: listError.message };
  }

  const paths = (data ?? []).map((file) => `${recordId}/${file.name}`);
  if (paths.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}