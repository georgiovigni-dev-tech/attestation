import { requireAuth } from "@/lib/auth";
import { getDashboardStats, getAttestationsFromDb } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardPage() {
  await requireAuth();

  const stats = await getDashboardStats();
  const attestations = (await getAttestationsFromDb()).map((item) => ({
    ...item,
    studentName: item.studentName || "-",
    filiere: item.filiere || "-",
    school: item.school || "-",
    issueDate: item.issueDate || "-",
  }));

  return <DashboardShell stats={stats} attestations={attestations} />;
}
