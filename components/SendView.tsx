"use client";

import React, { useState } from "react";
import { Mail, Loader2, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { DashboardAttestationItem } from "@/components/DashboardShell";

interface SendViewProps {
  attestations: DashboardAttestationItem[];
}

export default function SendView({ attestations }: SendViewProps) {
  const [rows, setRows] = useState(attestations);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { type: "success" | "error"; text: string }>>({});

  async function sendEmail(id: string) {
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
      setFeedback((prev) => ({ ...prev, [id]: { type: "success", text: data.message } }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de l'envoi de l'e-mail";
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: "error" as const } : row)));
      setFeedback((prev) => ({ ...prev, [id]: { type: "error", text: message } }));
    } finally {
      setSendingId(null);
    }
  }

  const pending = rows.filter((item) => item.status !== "sent").length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Centre d&apos;Envoi Mail</h2>
          <p className="text-xs text-slate-400 mt-0.5">Envoi des attestations aux étudiants et réémission si nécessaire</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-xs text-slate-300 flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" />
          <span>{pending} à envoyer</span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Étudiant</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Date Délivrance</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-medium text-slate-200">
                  {row.studentName}
                  <span className="ml-2 inline-block bg-slate-800 text-sky-400 text-[10px] px-2 py-0.5 rounded font-mono">{row.filiere}</span>
                </td>
                <td className="p-4 text-slate-300">{row.email}</td>
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
                <td className="p-4 text-right">
                  {feedback[row.id] ? (
                    <span
                      className={`text-[10px] ${
                        feedback[row.id].type === "success" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {feedback[row.id].text}
                    </span>
                  ) : (
                    <button
                      onClick={() => sendEmail(row.id)}
                      disabled={sendingId === row.id}
                      className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {sendingId === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                      {row.status === "sent" ? "Renvoyer" : "Envoyer"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-sm">
            Aucune attestation à envoyer pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}