import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAttestationById, updateAttestation } from "@/lib/db";
import { downloadAttestationFile } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let id: string | null = null;

  try {
    const body = await req.json();
    id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const record = await getAttestationById(id);
    if (!record) {
      return NextResponse.json({ error: "Attestation introuvable" }, { status: 404 });
    }

    if (!record.docx_url) {
      return NextResponse.json(
        { error: "Aucun fichier généré pour cette attestation" },
        { status: 400 }
      );
    }

    const attachments: Array<{ filename: string; content: Buffer }> = [];

    if (!record.pdf_url) {
      return NextResponse.json(
        { error: "Aucun fichier PDF généré pour cette attestation" },
        { status: 400 }
      );
    }

    const pdf = await downloadAttestationFile(record.pdf_url);
    if (pdf.error || !pdf.buffer) {
      throw new Error(pdf.error || "Fichier PDF introuvable");
    }
    const safeName = record.student_full_name.replace(/\s+/g, "_");
    attachments.push({ filename: `Attestation_Stage_${safeName}.pdf`, content: pdf.buffer });

    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Bénin Hub Technologies" <${process.env.SMTP_USER}>`,
      to: record.student_email,
      subject: `Votre Attestation de Stage - Bénin Hub Technologies`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #12719c;">Attestation de Stage</h2>
          <p>Bonjour <strong>${record.student_full_name}</strong>,</p>
          <p>Veuillez trouver en pièce jointe votre attestation de stage officielle délivrée par <strong>Bénin Hub Technologies (BHT)</strong>.</p>
          <p>Cordialement,<br><strong>Direction Générale - BHT</strong></p>
        </div>
      `,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    await updateAttestation(id, {
      status: "sent",
      last_sent_at: new Date().toISOString(),
      send_error_log: null,
    });

    return NextResponse.json({ success: true, message: "E-mail envoyé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de l'envoi de l'e-mail";
    console.error("Erreur d'envoi Nodemailer :", error);
    if (id) {
      await updateAttestation(id, {
        status: "error",
        send_error_log: message,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}