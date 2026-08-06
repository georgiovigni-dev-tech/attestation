import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { buildAttestationHtml } from "@/lib/attestation-html";
import type { AttestationData } from "@/lib/docx-generator";

function isProductionRuntime() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

async function launchBrowser() {
  if (isProductionRuntime()) {
    const executablePath = await chromium.executablePath();
    const args = await chromium.args;
    return puppeteerCore.launch({
      executablePath,
      args,
      headless: true,
    });
  }
  return puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
}

export async function generatePdfBuffer(data: AttestationData): Promise<Buffer> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(buildAttestationHtml(data), { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}