import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
} from "docx";

export interface AttestationData {
  director_title_name: string;
  company_name: string;
  student_gender: string;
  student_full_name: string;
  birth_date: string;
  birth_place: string;
  school_name: string;
  filiere: string;
  start_date: string;
  end_date: string;
  poles: string;
  issue_place: string;
  issue_date: string;
  signatory_name: string;
  signatory_role: string;
}

const SKY = "12719C";

export async function generateDocxBuffer(data: AttestationData): Promise<Buffer> {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: [
          // ---- En-tête : marque BHT (gauche) + description (droite) ----
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "CBD5E1" } },
            spacing: { after: 300 },
            children: [
              new TextRun({ text: "BHT", bold: true, size: 48, color: SKY, font: "Arial" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "Pôle d'innovation et de formation numérique basé à Abomey-Calavi, BHT certifie que le présent document est délivré conformément à ses standards d'excellence. L'entreprise accompagne les talents tech, promeut l'entrepreneuriat digital et participe activement à la transformation numérique du Bénin.",
                italics: true,
                size: 18,
                color: "475569",
              }),
            ],
          }),

          // ---- Titre ----
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [
              new TextRun({
                text: "ATTESTATION DE STAGE",
                bold: true,
                size: 40,
                color: SKY,
                underline: { type: "single", color: SKY },
              }),
            ],
          }),

          // ---- Corps ----
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 300, line: 360 },
            children: [
              new TextRun({ text: "Je soussigné, " }),
              new TextRun({ text: data.director_title_name, bold: true }),
              new TextRun({ text: ", Directeur Général de " }),
              new TextRun({ text: data.company_name, bold: true }),
              new TextRun({ text: ", certifie que " }),
              new TextRun({ text: `${data.student_gender} ${data.student_full_name}`, bold: true }),
              new TextRun({ text: " né(e) le " }),
              new TextRun({ text: data.birth_date, bold: true }),
              new TextRun({ text: " à " }),
              new TextRun({ text: data.birth_place, bold: true }),
              new TextRun({ text: ", étudiant(e) à " }),
              new TextRun({ text: data.school_name, bold: true }),
              new TextRun({ text: " en " }),
              new TextRun({ text: data.filiere, bold: true }),
              new TextRun({ text: ", a effectué un stage et formation au sein de notre entreprise du " }),
              new TextRun({ text: `${data.start_date} au ${data.end_date}`, bold: true }),
              new TextRun({ text: "." }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 300, line: 360 },
            children: [
              new TextRun({ text: "Durant cette période, le/la stagiaire a participé activement aux activités des pôles " }),
              new TextRun({ text: data.poles, bold: true }),
              new TextRun({ text: ", développé des compétences concrètes, et fait preuve de rigueur, d'autonomie et d'esprit collaboratif, conformément aux valeurs d'excellence et d'innovation de " }),
              new TextRun({ text: "BHT", bold: true }),
              new TextRun({ text: "." }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 500, line: 360 },
            children: [
              new TextRun({ text: "La présente attestation est délivrée pour servir et valoir ce que de droit." }),
            ],
          }),

          // ---- Lieu et date ----
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 },
            children: [
              new TextRun({ text: `Fait à ${data.issue_place}, le ${data.issue_date}.`, bold: true }),
            ],
          }),

          // ---- Signature ----
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
            children: [new TextRun({ text: data.signatory_name, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 500 },
            children: [new TextRun({ text: data.signatory_role, underline: { type: "single" } })],
          }),

          // ---- Pied de page ----
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            border: { top: { style: BorderStyle.SINGLE, size: 12, color: SKY } },
            children: [
              new TextRun({ text: "contact@beninhub-tech.net     |     Abomey-Calavi     |     +229 01 97 77 06 36", size: 18, color: SKY }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}