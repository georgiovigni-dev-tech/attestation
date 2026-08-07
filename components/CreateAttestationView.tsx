"use client";

import React, { useState } from "react";
import { Loader2, Send, Save, Printer, CheckCircle2, AlertTriangle } from "lucide-react";

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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  async function handlePrint() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/attestations/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: attestationId ?? null, form: formData }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Échec de l'impression");
      }

      const blob = await response.blob();

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Attestation_Stage_${formData.studentFullName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setPreviewUrl(URL.createObjectURL(blob));
      setMessage({
        type: "success",
        text: "PDF du document final généré et enregistré sur votre PC et en base. Le candidat recevra exactement ce fichier par e-mail.",
      });
      if (isEdit) onChanged?.();
      else onCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Échec de l'impression du document.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
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
              onClick={handlePrint}
              disabled={saving || sending}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} Imprimer
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
        <div className="w-full max-w-[595px] bg-white text-slate-900 shadow-2xl p-10 font-serif relative rounded-sm min-h-[842px] flex flex-col justify-between text-[13px] leading-relaxed select-none">
          {previewUrl && (
            <div className="absolute inset-0 z-20 bg-white">
              <iframe
                src={previewUrl}
                title="Aperçu du PDF généré"
                className="w-full h-full rounded-sm"
              />
            </div>
          )}
          {/* Filigrane BHT */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-[140px] font-bold text-slate-900 tracking-widest rotate-[-30deg]">BHT</span>
          </div>

          <div className="relative z-10 space-y-8">
            {/* Header Document */}
            <div className="flex items-start justify-between border-b border-slate-300 pb-4">
              <div className="w-1/3">
                <div className="text-2xl font-bold text-[#12719c] font-sans tracking-tight">BHT</div>
                <div className="text-xs font-semibold text-[#12719c] font-sans">Bénin Hub Technologies</div>
              </div>
              <div className="w-2/3 pl-4 border-l-2 border-[#12719c] text-[10px] italic text-slate-600 font-sans leading-tight">
                Pôle d&apos;innovation et de formation numérique basé à Abomey-Calavi, BHT certifie que le présent document est délivré conformément à ses standards d&apos;excellence. L&apos;entreprise accompagne les talents tech, promeut l&apos;entrepreneuriat digital et participe activement à la transformation numérique du Bénin.
              </div>
            </div>

            {/* Titre */}
            <div className="text-center py-4">
              <h1 className="text-xl font-bold text-[#12719c] underline underline-offset-4 tracking-wide font-sans">
                ATTESTATION DE STAGE
              </h1>
            </div>

            {/* Corps */}
            <div className="space-y-6 text-justify text-slate-800">
              <p>
                Je soussigné, <strong className="text-slate-950">{formData.directorTitleName}</strong>, Directeur Général de{" "}
                <strong className="text-slate-950">{formData.companyName}</strong>, certifie que{" "}
                <strong className="text-slate-950">{formData.studentGender} {formData.studentFullName}</strong> né(e) le{" "}
                <strong className="text-slate-950">{formatDateDisplay(formData.birthDate)}</strong> à{" "}
                <strong className="text-slate-950">{formData.birthPlace}</strong>, étudiant(e) à{" "}
                <strong className="text-slate-950">{formData.schoolName}</strong> en{" "}
                <strong className="text-slate-950">{formData.filiere}</strong>, a effectué un stage et formation au sein de notre entreprise du{" "}
                <strong className="text-slate-950">{formData.startPeriod} au {formData.endPeriod}</strong>.
              </p>

              <p>
                Durant cette période, le/la stagiaire a participé activement aux activités des pôles{" "}
                <strong className="text-slate-950">{formData.poles}</strong>, développé des compétences concrètes, et fait preuve de rigueur, d&apos;autonomie et d&apos;esprit collaboratif, conformément aux valeurs d&apos;excellence et d&apos;innovation de <strong className="text-slate-950">BHT</strong>.
              </p>

              <p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p>
            </div>

            {/* Lieu et Date */}
            <div className="text-right pt-4 font-semibold text-slate-900">
              Fait à {formData.issuePlace}, le {formatDateDisplay(formData.issueDate)}.
            </div>

            {/* Signature */}
            <div className="text-right pt-12 space-y-1">
              <div className="font-bold text-slate-900">Mr Aziz SAIBOU</div>
              <div className="underline text-slate-800">Le Directeur Général</div>
            </div>
          </div>

          {/* Footer Document */}
          <div className="relative z-10 border-t border-[#12719c] pt-3 flex justify-between text-[10px] text-[#12719c] font-sans">
            <span>contact@beninhub-tech.net</span>
            <span>Abomey-Calavi</span>
            <span>+229 01 97 77 06 36</span>
          </div>
        </div>
      </div>
    </div>
  );
}