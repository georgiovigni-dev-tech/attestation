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
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
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
    issue_date: formatDateFr(form.issueDate),
    signatory_name: "Mr Aziz SAIBOU",
    signatory_role: "Le Directeur Général",
  };
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strong(value: string) {
  return `<strong>${esc(value)}</strong>`;
}

// CSS scoped à la feuille (.att-*) : aucun impact global sur l'interface.
// Valeurs alignées sur l'aperçu à l'écran (CreateAttestationView) pour garantir
// que le PDF imprimé est identique au template de départ (595x842, p-10).
export const ATTESTATION_CSS = `
  .att-paper, .att-paper *, .att-paper *::before, .att-paper *::after { box-sizing: border-box; }
  .att-paper {
    width: 794px; min-height: 1123px; padding: 40px;
    background: #fff; color: #0f172a;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 13px; line-height: 1.625;
    position: relative; display: flex; flex-direction: column; justify-content: space-between;
    overflow: hidden;
  }
  .att-watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.03; pointer-events: none; }
  .att-watermark span { font-size: 140px; font-weight: bold; letter-spacing: 0.2em; transform: rotate(-30deg); color: #0f172a; }
  .att-content { position: relative; z-index: 10; }
  .att-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 16px; }
  .att-brand { width: 33%; }
  .att-brand .att-logo { font-size: 24px; font-weight: 700; color: #12719c; font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.025em; }
  .att-brand .att-sub { font-size: 12px; font-weight: 600; color: #12719c; font-family: Arial, Helvetica, sans-serif; }
  .att-desc { width: 66%; padding-left: 16px; border-left: 2px solid #12719c; font-size: 10px; font-style: italic; color: #475569; font-family: Arial, Helvetica, sans-serif; line-height: 1.25; }
  .att-title { text-align: center; padding: 16px 0; }
  .att-title h1 { font-size: 20px; font-weight: 700; color: #12719c; text-decoration: underline; text-underline-offset: 4px; font-family: Arial, Helvetica, sans-serif; letter-spacing: 0.05em; }
  .att-body { text-align: justify; color: #1e293b; }
  .att-body p { margin: 0; }
  .att-body p + p { margin-top: 24px; }
  .att-body strong { color: #0f172a; }
  .att-content > * + * { margin-top: 32px; }
  .att-date { text-align: right; font-weight: 600; }
  .att-signature { text-align: right; padding-top: 48px; }
  .att-signature .att-name { font-weight: 700; }
  .att-signature .att-role { text-decoration: underline; }
  .att-footer { border-top: 1px solid #12719c; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #12719c; font-family: Arial, Helvetica, sans-serif; }
`;

function buildContent(data: AttestationData): string {
  const description =
    "Pôle d'innovation et de formation numérique basé à Abomey-Calavi, BHT certifie que le présent " +
    "document est délivré conformément à ses standards d'excellence. L'entreprise accompagne les talents " +
    "tech, promeut l'entrepreneuriat digital et participe activement à la transformation numérique du Bénin.";

  return `<div class="att-paper">
    <div class="att-watermark"><span>BHT</span></div>
    <div class="att-content">
      <div class="att-header">
        <div class="att-brand">
          <div class="att-logo">BHT</div>
          <div class="att-sub">Bénin Hub Technologies</div>
        </div>
        <div class="att-desc">${esc(description)}</div>
      </div>

      <div class="att-title"><h1>ATTESTATION DE STAGE</h1></div>

      <div class="att-body">
        <p>
          Je soussigné, ${strong(data.director_title_name)}, Directeur Général de ${strong(data.company_name)},
          certifie que ${strong(`${data.student_gender} ${data.student_full_name}`)} né(e) le ${strong(data.birth_date)}
          à ${strong(data.birth_place)}, étudiant(e) à ${strong(data.school_name)} en ${strong(data.filiere)},
          a effectué un stage et formation au sein de notre entreprise du ${strong(`${data.start_date} au ${data.end_date}`)}.
        </p>
        <p>
          Durant cette période, le/la stagiaire a participé activement aux activités des pôles ${strong(data.poles)},
          développé des compétences concrètes, et fait preuve de rigueur, d'autonomie et d'esprit collaboratif,
          conformément aux valeurs d'excellence et d'innovation de ${strong("BHT")}.
        </p>
        <p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p>
      </div>

      <div class="att-date">Fait à ${esc(data.issue_place)}, le ${esc(data.issue_date)}.</div>

      <div class="att-signature">
        <div class="att-name">${esc(data.signatory_name)}</div>
        <div class="att-role">${esc(data.signatory_role)}</div>
      </div>
    </div>

    <div class="att-footer">
      <span>contact@beninhub-tech.net</span>
      <span>Abomey-Calavi</span>
      <span>+229 01 97 77 06 36</span>
    </div>
  </div>`;
}

export function buildAttestationContent(data: AttestationData): string {
  return buildContent(data);
}

export function buildAttestationHtml(data: AttestationData): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${ATTESTATION_CSS}</style>
</head>
<body>${buildContent(data)}</body>
</html>`;
}