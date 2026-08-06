import type { AttestationData } from "@/lib/docx-generator";

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

export function buildAttestationHtml(data: AttestationData): string {
  const description =
    "Pôle d'innovation et de formation numérique basé à Abomey-Calavi, BHT certifie que le présent " +
    "document est délivré conformément à ses standards d'excellence. L'entreprise accompagne les talents " +
    "tech, promeut l'entrepreneuriat digital et participe activement à la transformation numérique du Bénin.";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; }
  .paper {
    width: 210mm; min-height: 296mm; padding: 12mm 10mm 8mm;
    font-family: Georgia, 'Times New Roman', serif;
    color: #0f172a; font-size: 13px; line-height: 1.6;
    position: relative; display: flex; flex-direction: column; justify-content: space-between;
  }
  .watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.04; pointer-events: none; overflow: hidden; }
  .watermark span { font-size: 130px; font-weight: bold; letter-spacing: 0.2em; transform: rotate(-30deg); color: #0f172a; }
  .content { position: relative; }
  .header { display: flex; align-items: stretch; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; }
  .brand { width: 34%; }
  .brand .logo { font-size: 26px; font-weight: 800; color: #12719c; font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.5px; }
  .brand .sub { font-size: 12px; font-weight: 600; color: #12719c; font-family: Arial, Helvetica, sans-serif; }
  .desc { width: 64%; padding-left: 10px; border-left: 2px solid #12719c; font-size: 10px; font-style: italic; color: #475569; font-family: Arial, Helvetica, sans-serif; line-height: 1.4; display: flex; align-items: center; }
  .title { text-align: center; padding: 14px 0; }
  .title h1 { font-size: 21px; color: #12719c; text-decoration: underline; text-underline-offset: 5px; font-family: Arial, Helvetica, sans-serif; letter-spacing: 0.05em; }
  .body { text-align: justify; color: #1e293b; }
  .body p { margin: 0 0 14px; }
  .date { text-align: right; font-weight: 600; margin-top: 10px; }
  .signature { text-align: right; margin-top: 44px; }
  .signature .name { font-weight: 700; }
  .signature .role { text-decoration: underline; }
  .footer { border-top: 1px solid #12719c; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #12719c; font-family: Arial, Helvetica, sans-serif; }
</style>
</head>
<body>
  <div class="paper">
    <div class="watermark"><span>BHT</span></div>
    <div class="content">
      <div class="header">
        <div class="brand">
          <div class="logo">BHT</div>
          <div class="sub">Bénin Hub Technologies</div>
        </div>
        <div class="desc">${esc(description)}</div>
      </div>

      <div class="title"><h1>ATTESTATION DE STAGE</h1></div>

      <div class="body">
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

      <div class="date">Fait à ${esc(data.issue_place)}, le ${esc(data.issue_date)}.</div>

      <div class="signature">
        <div class="name">${esc(data.signatory_name)}</div>
        <div class="role">${esc(data.signatory_role)}</div>
      </div>
    </div>

    <div class="footer">
      <span>contact@beninhub-tech.net</span>
      <span>Abomey-Calavi</span>
      <span>+229 01 97 77 06 36</span>
    </div>
  </div>
</body>
</html>`;
}