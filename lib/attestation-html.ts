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
    issue_date: formatDateFr(form.issueDate),
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
  ".att-paper { width: 794px; height: 1123px; padding: 50px 65px 35px 65px; background: #ffffff; color: #000000; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.8; position: relative; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; margin: 0 auto; }",
  ".att-watermark { position: absolute; top: 48%; left: 48%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 270px; font-weight: 900; font-family: Arial, Helvetica, sans-serif; color: #000000; opacity: 0.045; pointer-events: none; user-select: none; z-index: 1; letter-spacing: 0.02em; }",
  ".att-content { position: relative; z-index: 10; display: flex; flex-direction: column; flex: 1; }",
  ".att-header { display: flex; align-items: stretch; justify-content: space-between; margin-bottom: 55px; }",
  ".att-brand { display: flex; flex-direction: column; justify-content: center; width: 200px; flex-shrink: 0; }",
  ".att-brand .att-logo { font-size: 42px; font-weight: 800; font-family: Arial, Helvetica, sans-serif; line-height: 0.9; letter-spacing: -1px; }",
  ".att-brand .att-logo .blue { color: #1d7fa6; }",
  ".att-brand .att-logo .red { color: #b83232; }",
  ".att-brand .att-sub { font-size: 16px; font-weight: 700; color: #1d7fa6; font-family: Arial, Helvetica, sans-serif; line-height: 1.1; margin-top: 6px; }",
  ".att-separator { width: 2px; background-color: #000000; margin: 0 22px; flex-shrink: 0; align-self: stretch; }",
  ".att-desc { flex: 1; font-size: 12px; font-style: italic; color: #111111; font-family: Georgia, 'Times New Roman', serif; line-height: 1.35; display: flex; align-items: center; }",
  ".att-title { text-align: center; margin: 0 0 55px 0; }",
  ".att-title h1 { font-size: 23px; font-weight: 700; color: #1d7fa6; text-decoration: underline; text-underline-offset: 5px; font-family: Arial, Helvetica, sans-serif; letter-spacing: 0.5px; margin: 0; }",
  ".att-body { text-align: justify; color: #000000; display: flex; flex-direction: column; gap: 28px; font-size: 15px; line-height: 1.8; }",
  ".att-body p { margin: 0; }",
  ".att-body strong { font-weight: 700; color: #000000; }",
  ".att-date { text-align: right; font-weight: 700; margin-top: 55px; font-size: 15px; }",
  ".att-signature { text-align: right; margin-top: auto; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; font-family: Arial, Helvetica, sans-serif; }",
  ".att-signature .att-name { font-weight: 700; font-size: 16px; color: #000000; }",
  ".att-signature .att-role { text-decoration: underline; font-size: 16px; color: #000000; }",
  ".att-footer { border-top: 1.5px solid #1d7fa6; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #1d7fa6; font-family: Arial, Helvetica, sans-serif; }",
  "@media print { body { margin: 0; background: #fff; } .att-paper { width: 100%; height: 100vh; padding: 50px 55px 35px 55px; } }"
].join("\n");

function buildContent(data: AttestationData): string {
  const description =
    "Pôle d'innovation et de formation numérique basé à Abomey-Calavi, " +
    "BHT certifie que le présent document est délivré conformément à ses " +
    "standards d'excellence. L'entreprise accompagne les talents tech, " +
    "promeut l'entrepreneuriat digital et participe activement à la " +
    "transformation numérique du Bénin.";

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
    '    <div class="att-header">',
    '      <div class="att-brand">',
    '        <div class="att-logo">',
    '          <span class="blue">B</span><span class="red">H</span><span class="blue">T</span>',
    '        </div>',
    '        <div class="att-sub">Bénin Hub<br/>Technologies</div>',
    '      </div>',
    '      <div class="att-separator"></div>',
    '      <div class="att-desc">' + esc(description) + '</div>',
    '    </div>',
    '    <div class="att-title">',
    '      <h1>ATTESTATION DE STAGE</h1>',
    '    </div>',
    '    <div class="att-body">',
    '      <p>',
    "        Je soussigné, " + directorTitle + " , Directeur Général de " + companyName + " , ",
    "        certifie que " + studentInfo + " né(e) le " + birthDate,
    "        à " + birthPlace + " , étudiant(e) à " + schoolName + " en " + filiere + " , ",
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
    '    <span>contact@beninhub-tech.net</span>',
    '    <span>Abomey-Calavi</span>',
    '    <span>+229 01 97 77 06 36</span>',
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