"use client";

import React, { useState } from "react";
import { Loader2, Send, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  ATTESTATION_CSS,
  buildAttestationContent,
  buildAttestationDataFromForm,
} from "@/lib/attestation-html";

export interface AttestationFormValues {
  directorTitleName: string;
  companyName: string;
  studentGender: string;
  studentFullName: string;
  birthDate: string;
  birthPlace: string;
  schoolName: string;
  filiere: string;
  startPeriod: string;
  endPeriod: string;
  poles: string;
  issuePlace: string;
  issueDate: string;
  studentEmail: string;
}

const DEFAULT_VALUES: AttestationFormValues = {
  directorTitleName: "M. SAIBOU Aziz",
  companyName: "BENIN HUB TECHNOLOGIES (BHT)",
  studentGender: "M.",
  studentFullName: "LOKOSSOU Gbenagnon Carell-Bismark",
  birthDate: "2006-04-23",
  birthPlace: "Cotonou",
  schoolName: "LES COURS SONOU (LCS)",
  filiere: "SSRI",
  startPeriod: "09 Février",
  endPeriod: "18 Avril 2026",
  poles: "Réseau et Cybersécurité",
  issuePlace: "Abomey-Calavi",
  issueDate: "2026-05-11",
  studentEmail: "lokossou.carell@example.com",
};

interface CreateAttestationViewProps {
  onCreated?: () => void;
  onChanged?: () => void;
  attestationId?: string | null;
  initialValues?: Partial<AttestationFormValues>;
}

export default function CreateAttestationView({
  onCreated,
  onChanged,
  attestationId,
  initialValues,
}: CreateAttestationViewProps) {
  const [formData, setFormData] = useState<AttestationFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const previewHtml = buildAttestationContent(buildAttestationDataFromForm(formData));

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isEdit = Boolean(attestationId);

  async function persistAttestation() {
    const url = isEdit ? `/api/attestations/${attestationId}` : "/api/attestations";
    const response = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Échec de l'enregistrement");
    }
    return result;
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await persistAttestation();
      setMessage({ type: "success", text: "Attestation enregistrée et générée avec succès." });
      if (isEdit) onChanged?.();
      else onCreated?.();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de l'enregistrement de l'attestation.";
      setMessage({ type: "error", text: message });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndSend() {
    const result = await handleSave();
    const targetId = attestationId ?? result?.id;
    if (!targetId) return;

    setSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi de l'e-mail");
      }
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de l'envoi de l'e-mail.";
      setMessage({ type: "error", text: message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Panneau de saisie */}
      <div className="w-full lg:w-1/2 p-6 bg-slate-950 border-r border-slate-800 overflow-y-auto space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100">{isEdit ? "Modifier l'Attestation" : "Créer une Attestation"}</h2>
          <p className="text-xs text-slate-400">Renseignez les données pour mettre à jour la prévisualisation en temps réel.</p>
        </div>

        <form className="space-y-4 text-xs">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Directeur & Entreprise</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nom du Directeur</label>
                <input
                  type="text"
                  name="directorTitleName"
                  value={formData.directorTitleName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nom Entreprise</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Informations Étudiant</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Genre</label>
                <select
                  name="studentGender"
                  value={formData.studentGender}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Nom et Prénoms</label>
                <input
                  type="text"
                  name="studentFullName"
                  value={formData.studentFullName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Date de Naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Lieu de Naissance</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Établissement</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Filière / Spécialité</label>
                <input
                  type="text"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Adresse E-mail de l&apos;étudiant</label>
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Stage & Attestation</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Période (Début)</label>
                <input
                  type="text"
                  name="startPeriod"
                  value={formData.startPeriod}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Période (Fin)</label>
                <input
                  type="text"
                  name="endPeriod"
                  value={formData.endPeriod}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pôles d&apos;activités</label>
              <input
                type="text"
                name="poles"
                value={formData.poles}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Fait à</label>
                <input
                  type="text"
                  name="issuePlace"
                  value={formData.issuePlace}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Date de délivrance</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || sending}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndSend}
              disabled={saving || sending}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {isEdit ? "Mettre à jour & Envoyer" : "Enregistrer & Envoyer"}
            </button>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg border ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
        </form>
      </div>

      {/* Panneau Prévisualisation Temps Réel (Feuille A4) */}
      <div className="w-full lg:w-1/2 p-8 bg-slate-900 overflow-y-auto flex flex-col items-center justify-start">
        <div className="w-full max-w-[794px] select-none">
          <style>{ATTESTATION_CSS}</style>
          <div className="shadow-2xl rounded-sm overflow-hidden" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>
    </div>
  );
}