"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import DashboardView from "@/components/DashboardView";
import CreateAttestationView, { type AttestationFormValues } from "@/components/CreateAttestationView";
import HistoryView from "@/components/HistoryView";
import SendView from "@/components/SendView";

export interface DashboardAttestationItem {
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

export interface DashboardStats {
  generated: number;
  sent: number;
  pending: number;
  errors: number;
}

interface DashboardShellProps {
  initialTab?: string;
  stats: DashboardStats;
  attestations: DashboardAttestationItem[];
}

function computeStats(items: DashboardAttestationItem[]): DashboardStats {
  const generated = items.filter((item) => item.status !== "error").length;
  const sent = items.filter((item) => item.status === "sent").length;
  const pending = items.filter((item) => item.status === "generated").length;
  const errors = items.filter((item) => item.status === "error").length;
  return { generated, sent, pending, errors };
}

const DATA_TABS = ["dashboard", "history", "send"];

export default function DashboardShell({
  initialTab = "dashboard",
  stats: initialStats,
  attestations: initialAttestations,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [attestations, setAttestations] = useState(initialAttestations);
  const [stats, setStats] = useState(initialStats);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<{ id: string; values: Partial<AttestationFormValues> } | null>(null);

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!DATA_TABS.includes(activeTab)) return;
    let cancelled = false;
    fetch("/api/attestations")
      .then((res) => (res.ok ? res.json() : null))
      .then((items) => {
        if (!cancelled && items) {
          setAttestations(items);
          setStats(computeStats(items));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeTab, reloadKey]);

  function changeTab(tab: string) {
    if (tab === "create") setEditing(null);
    setActiveTab(tab);
  }

  async function handleEdit(id: string) {
    try {
      const res = await fetch(`/api/attestations/${id}`);
      if (!res.ok) return;
      const row = await res.json();
      setEditing({
        id,
        values: {
          directorTitleName: row.director_title_name,
          companyName: row.company_name,
          studentGender: row.student_gender,
          studentFullName: row.student_full_name,
          birthDate: row.birth_date || undefined,
          birthPlace: row.birth_place,
          schoolName: row.school_name,
          filiere: row.filiere,
          startPeriod: row.start_date,
          endPeriod: row.end_date,
          poles: row.poles,
          issuePlace: row.issue_place,
          issueDate: row.issue_date || undefined,
          studentEmail: row.student_email,
        },
      });
      setActiveTab("create");
    } catch {
      // ignore
    }
  }

  function handleChanged() {
    reload();
    setEditing(null);
    setActiveTab("history");
  }

  function handleDelete(ids: string[]) {
    Promise.all(
      ids.map((id) => fetch(`/api/attestations/${id}`, { method: "DELETE" }))
    ).then(() => reload());
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={changeTab}>
      {activeTab === "dashboard" && <DashboardView onNavigate={setActiveTab} stats={stats} attestations={attestations} />}
      {activeTab === "create" && (
        <CreateAttestationView
          attestationId={editing?.id ?? null}
          initialValues={editing?.values ?? undefined}
          onCreated={reload}
          onChanged={handleChanged}
        />
      )}
      {activeTab === "history" && (
        <HistoryView attestations={attestations} onEdit={handleEdit} onDeleted={handleDelete} />
      )}
      {activeTab === "send" && <SendView attestations={attestations} />}
      {activeTab === "settings" && (
        <div className="p-8 max-w-xl">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Paramètres du Système</h2>
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4 text-xs text-slate-300">
            <div>
              <label className="block text-slate-400 mb-1">Serveur SMTP</label>
              <input type="text" value="smtp.gmail.com" readOnly className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">E-mail Expéditeur</label>
              <input type="text" value="contact@beninhub-tech.net" readOnly className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}