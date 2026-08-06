"use client";

import React from "react";
import { LayoutDashboard, FilePlus, Send, History, Settings, ShieldCheck } from "lucide-react";

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "create", label: "Nouvelle Attestation", icon: FilePlus },
    { id: "history", label: "Historique & Registre", icon: History },
    { id: "send", label: "Centre d'Envoi Mail", icon: Send },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Métier */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-slate-100">BHT CERTIFY</h1>
              <p className="text-xs text-slate-500">Gestionnaire d&apos;attestations</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400 border border-slate-700">
              AZ
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">M. SAIBOU Aziz</p>
              <p className="text-[10px] text-slate-400 truncate">Directeur Général</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}