"use client";

import React from "react";
import { FileCheck, MailCheck, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { DashboardAttestationItem } from "@/components/DashboardShell";

const dataChart = [
  { month: "Jan", attestations: 12 },
  { month: "Fév", attestations: 19 },
  { month: "Mar", attestations: 25 },
  { month: "Avr", attestations: 18 },
  { month: "Mai", attestations: 32 },
  { month: "Juin", attestations: 28 },
];

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  stats: {
    generated: number;
    sent: number;
    pending: number;
    errors: number;
  };
  attestations: DashboardAttestationItem[];
}

export default function DashboardView({ onNavigate, stats, attestations }: DashboardViewProps) {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Tableau de Bord Général</h2>
          <p className="text-xs text-slate-400 mt-0.5">Aperçu analytique des attestations délivrées et statut des envois</p>
        </div>
        <button
          onClick={() => onNavigate("create")}
          className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          + Nouvelle Attestation
        </button>
      </div>

      {/* Cartes Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Générées</span>
            <FileCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.generated}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
            <TrendingUp className="w-3 h-3" /> +12% ce mois
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium">Envoyées</span>
            <MailCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.sent}</div>
          <div className="text-[11px] text-slate-500 mt-2">95.5% de taux de succès</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium">En Attente</span>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.pending}</div>
          <div className="text-[11px] text-amber-400/80 mt-2">Prêtes à l&apos;envoi</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-medium">Erreurs d&apos;envoi</span>
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.errors}</div>
          <div className="text-[11px] text-rose-400/80 mt-2">Action requise</div>
        </div>
      </div>

      {/* Liste récente */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 text-sm font-semibold text-slate-200">Dernières attestations</div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Étudiant</th>
              <th className="p-4">Établissement & Filière</th>
              <th className="p-4">Date Délivrance</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {attestations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-medium text-slate-200">{item.studentName}</td>
                <td className="p-4 text-slate-300">{item.school} <span className="ml-2 inline-block bg-slate-800 text-sky-400 text-[10px] px-2 py-0.5 rounded font-mono">{item.filiere}</span></td>
                <td className="p-4 text-slate-400">{item.issueDate}</td>
                <td className="p-4 text-slate-300">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Graphique de Production */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Volume d&apos;Attestations Générées (2026)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
              <Area type="monotone" dataKey="attestations" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorAtt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}