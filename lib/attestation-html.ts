import type { AttestationData } from "@/lib/docx-generator";

export interface AttestationFormLike {
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
}

export function formatDateFr(dateStr: string) {
  if (!dateStr) return "";
  if (!dateStr.includes("-")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return d + "/" + m + "/" + y;
}

export function formatDateInFrenchWords(dateStr: string) {
  if (!dateStr) return "";
  if (!dateStr.includes("-")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const monthIdx = parseInt(m, 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${parseInt(d, 10)} ${months[monthIdx]} ${y}`;
  }
  return d + "/" + m + "/" + y;
}

export function buildAttestationDataFromForm(form: AttestationFormLike): AttestationData {
  return {
    director_title_name: form.directorTitleName,
    company_name: form.companyName,
    student_gender: form.studentGender,
    student_full_name: form.studentFullName,
    birth_date: formatDateFr(form.birthDate),
    birth_place: form.birthPlace,
    school_name: form.schoolName,
    filiere: form.filiere,
    start_date: form.startPeriod,
    end_date: form.endPeriod,
    poles: form.poles,
    issue_place: form.issuePlace,
    issue_date: formatDateInFrenchWords(form.issueDate),
    signatory_name: "Mr Aziz SAIBOU",
    signatory_role: "Le Directeur Général",
  };
}

function esc(value: string) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strong(value: string) {
  return "<strong>" + esc(value) + "</strong>";
}

export const ATTESTATION_CSS = [
  "@page { size: A4; margin: 0; }",
  ".att-paper, .att-paper *, .att-paper *::before, .att-paper *::after { box-sizing: border-box; }",
  ".att-paper { width: 794px; height: 1123px; padding: 45px 60px 30px 60px; background: #ffffff; color: #000000; font-family: Arial, Helvetica, sans-serif; font-size: 14.5px; line-height: 1.8; position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; margin: 0 auto; }",
  ".att-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); font-size: 240px; font-weight: 900; font-family: Arial, Helvetica, sans-serif; color: #1c2c5b; opacity: 0.04; pointer-events: none; user-select: none; z-index: 1; }",
  ".att-content { position: relative; z-index: 10; display: flex; flex-direction: column; flex: 1; }",
  ".att-ref { font-size: 12px; font-weight: 600; color: #333333; margin-bottom: 8px; font-family: Arial, Helvetica, sans-serif; }",
  ".att-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1c2c5b; padding-bottom: 12px; margin-bottom: 35px; }",
  ".att-brand-logo { font-size: 46px; font-weight: 900; font-family: Arial, Helvetica, sans-serif; line-height: 1; letter-spacing: -1px; }",
  ".att-brand-logo .blue { color: #1c2c5b; }",
  ".att-brand-logo .red { color: #c0392b; }",
  ".att-header-right { text-align: right; }",
  ".att-company-name { font-size: 18px; font-weight: 800; color: #1c2c5b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }",
  ".att-subtitle-1 { font-size: 11.5px; font-style: italic; color: #a93226; font-weight: 600; line-height: 1.2; margin: 2px 0 0 0; }",
  ".att-subtitle-2 { font-size: 10.5px; font-style: italic; color: #a93226; font-weight: 500; line-height: 1.2; margin: 2px 0 0 0; }",
  ".att-title { text-align: center; margin: 20px 0 35px 0; }",
  ".att-title h1 { font-size: 22px; font-weight: 800; color: #1c2c5b; text-decoration: underline; text-underline-offset: 4px; font-family: Arial, Helvetica, sans-serif; letter-spacing: 1px; margin: 0; text-transform: uppercase; }",
  ".att-body { text-align: justify; color: #111111; display: flex; flex-direction: column; gap: 22px; font-size: 14.5px; line-height: 1.8; }",
  ".att-body p { margin: 0; }",
  ".att-body strong { font-weight: 700; color: #000000; }",
  ".att-date { text-align: right; font-weight: 700; margin-top: 45px; font-size: 14.5px; color: #000000; }",
  ".att-signature { text-align: right; margin-top: auto; margin-bottom: 20px; display: flex; flex-direction: column; gap: 2px; align-items: flex-end; font-family: Arial, Helvetica, sans-serif; }",
  ".att-signature .att-name { font-weight: 700; font-size: 15px; color: #000000; }",
  ".att-signature .att-role { text-decoration: underline; font-weight: 600; font-size: 15px; color: #000000; }",
  ".att-footer { border-top: 2px solid #1c2c5b; padding-top: 8px; text-align: center; font-size: 10px; color: #1c2c5b; font-family: Arial, Helvetica, sans-serif; font-weight: 600; line-height: 1.3; }",
  "@media print { body { margin: 0; background: #fff; } .att-paper { width: 100%; height: 100vh; padding: 45px 50px 30px 50px; } }"
].join("\n");

function buildContent(data: AttestationData): string {
  const directorTitle = strong(data.director_title_name);
  const companyName = strong(data.company_name);
  const studentInfo = strong(data.student_gender + " " + data.student_full_name);
  const birthDate = strong(data.birth_date);
  const birthPlace = strong(data.birth_place);
  const schoolName = strong(data.school_name);
  const filiere = strong(data.filiere);
  const period = strong(data.start_date + " au " + data.end_date);
  const poles = strong(data.poles);
  const bht = strong("BHT");

  const issuePlace = esc(data.issue_place);
  const issueDate = esc(data.issue_date);
  const signatoryName = esc(data.signatory_name);
  const signatoryRole = esc(data.signatory_role);

  return [
    '<div class="att-paper">',
    '  <div class="att-watermark"><span>BHT</span></div>',
    '  <div class="att-content">',
    '    <div class="att-ref">Ref: BHT/2026/STG-001</div>',
    '    <div class="att-header">',
    '      <div class="att-brand-logo">',
    '        <span class="blue">B</span><span class="red">H</span><span class="blue">T</span>',
    '      </div>',
    '      <div class="att-header-right">',
    '        <h2 class="att-company-name">BENIN HUB TECHNOLOGIES</h2>',
    '        <p class="att-subtitle-1">Solutions Informatiques, Réseaux et Télécoms</p>',
    '        <p class="att-subtitle-2">Formation - Maintenance - Développement - Sécurité</p>',
    '      </div>',
    '    </div>',
    '    <div class="att-title">',
    '      <h1>ATTESTATION DE STAGE</h1>',
    '    </div>',
    '    <div class="att-body">',
    '      <p>',
    "        Je soussigné, " + directorTitle + ", Directeur Général de " + companyName + ", ",
    "        certifie que " + studentInfo + " né(e) le " + birthDate,
    "        à " + birthPlace + ", étudiant(e) à " + schoolName + " en " + filiere + ", ",
    "        a effectué un stage et formation au sein de notre entreprise du " + period + ".",
    '      </p>',
    '      <p>',
    "        Durant cette période, le/la stagiaire a participé activement aux activités des ",
    "        pôles " + poles + ", développé des compétences concrètes, et fait ",
    "        preuve de rigueur, d'autonomie et d'esprit collaboratif, conformément aux ",
    "        valeurs d'excellence et d'innovation de " + bht + ".",
    '      </p>',
    '      <p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p>',
    '    </div>',
    '    <div class="att-date">',
    '      <strong>Fait à ' + issuePlace + ', le ' + issueDate + '.</strong>',
    '    </div>',
    '    <div class="att-signature">',
    '      <div class="att-name">' + signatoryName + '</div>',
    '      <div class="att-role">' + signatoryRole + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="att-footer">',
    '    <p style="margin:0; text-transform:uppercase;">RCCM N° RB/ABC/26 A 137778 — IFU N° 0202112313395 — BCDBANK N° 00101211202656401</p>',
    '    <p style="margin:2px 0 0 0;">Abomey-Calavi, Rep. du Bénin — Tél : +229 01 97 77 06 36 — Email: contact@beninhub-tech.net</p>',
    '  </div>',
    '</div>'
  ].join("\n");
}

export function buildAttestationContent(data: AttestationData): string {
  return buildContent(data);
}

export function buildAttestationHtml(data: AttestationData): string {
  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    '<meta charset="utf-8" />',
    "<style>" + ATTESTATION_CSS + "</style>",
    "</head>",
    "<body>" + buildContent(data) + "</body>",
    "</html>"
  ].join("\n");
}