"use client";

import React, { useState } from "react";
import { Search, Download, Mail, Edit3, Trash2, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import type { DashboardAttestationItem } from "@/components/DashboardShell";

interface HistoryViewProps {
  attestations: DashboardAttestationItem[];
  onEdit?: (id: string) => void;
  onDeleted?: (ids: string[]) => void;
}

export default function HistoryView({ attestations, onEdit, onDeleted }: HistoryViewProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rows, setRows] = useState(attestations);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const filteredData = rows.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.filiere.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function download(url?: string | null, fileName?: string) {
    if (!url) {
      setFeedback((prev) => ({ ...prev, file: "Fichier non disponible" }));
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function resend(id: string) {
    setSendingId(id);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi de l'e-mail");
      }
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: "sent" as const } : row)));
      setFeedback((prev) => ({ ...prev, [id]: "E-mail renvoyé" }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de l'envoi";
      setFeedback((prev) => ({ ...prev, [id]: message }));
    } finally {
      setSendingId(null);
    }
  }

  function remove(id: string) {
    if (!confirm("Supprimer définitivement cette attestation et ses fichiers ?")) return;
    onDeleted?.([id]);
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Historique & Registre</h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestion complète, modification et réémission des attestations</p>
        </div>
      </div>

      {feedback.file && <div className="text-xs text-amber-400">{feedback.file}</div>}

      {/* Barre de Recherche et Filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, filière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="sent">Envoyés</option>
          <option value="generated">Générés non envoyés</option>
          <option value="error">Erreurs</option>
        </select>
      </div>

      {/* Tableau CRUD */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Étudiant</th>
              <th className="p-4">Établissement & Filière</th>
              <th className="p-4">Date Délivrance</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-medium text-slate-200">
                  {row.studentName}
                  <div className="text-[11px] text-slate-500 font-normal">{row.email}</div>
                  {feedback[row.id] && (
                    <div className="text-[10px] text-emerald-400 font-normal max-w-[220px] truncate">{feedback[row.id]}</div>
                  )}
                </td>
                <td className="p-4 text-slate-300">
                  {row.school}
                  <span className="ml-2 inline-block bg-slate-800 text-sky-400 text-[10px] px-2 py-0.5 rounded font-mono">
                    {row.filiere}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{row.issueDate}</td>
                <td className="p-4">
                  {row.status === "sent" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Envoyé
                    </span>
                  )}
                  {row.status === "generated" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3" /> En attente
                    </span>
                  )}
                  {row.status === "error" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertCircle className="w-3 h-3" /> Échec d&apos;envoi
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    title="Télécharger PDF"
                    onClick={() => download(row.pdfUrl, `Attestation_${row.studentName.replace(/\s+/g, "_")}.pdf`)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Renvoyer par mail"
                    onClick={() => resend(row.id)}
                    disabled={sendingId === row.id}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded border border-slate-700 disabled:opacity-60"
                  >
                    {sendingId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    title="Éditer"
                    onClick={() => onEdit?.(row.id)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Supprimer"
                    onClick={() => remove(row.id)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded border border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-sm">Aucune attestation trouvée.</div>
        )}
      </div>
    </div>
  );
}