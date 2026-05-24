"use server";

import { createHmac } from "crypto";
import { Resend } from "resend";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "helix@xiraxai.com";
const TO = process.env.RESEND_TO ?? "raphael@xiraxai.com";

const URGENCY_VALUES = ["days", "weeks", "none"] as const;
const BUDGET_VALUES = [
  "200-2000",
  "2000-5000",
  "5000-15000",
  "15000+",
  "unknown",
] as const;
type Urgency = (typeof URGENCY_VALUES)[number];
type Budget = (typeof BUDGET_VALUES)[number];

type FactoryFailure = {
  status: string;
  body: string;
};

const ATTACHMENT_KINDS = ["logo", "doc", "reference"] as const;
type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

type Attachment = {
  kind: AttachmentKind;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
};

const ATTACHMENT_MIME_BY_KIND: Record<AttachmentKind, readonly string[]> = {
  logo: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp",
  ],
  doc: ["application/pdf", "text/plain", "text/markdown"],
  reference: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
};

const ATTACHMENT_MAX_BYTES_BY_KIND: Record<AttachmentKind, number> = {
  logo: 5 * 1024 * 1024,
  doc: 10 * 1024 * 1024,
  reference: 5 * 1024 * 1024,
};

const ATTACHMENT_MAX_TOTAL = 5;

type FactoryPayload = {
  name: string;
  email: string;
  company: string;
  idea: string;
  target_user: string;
  urgency: Urgency;
  budget: Budget;
  industry?: string;
  references?: string;
  attachments?: Attachment[];
  source?: string;
  meta?: Record<string, string>;
};

function isAttachmentKind(v: unknown): v is AttachmentKind {
  return (
    typeof v === "string" &&
    (ATTACHMENT_KINDS as readonly string[]).includes(v)
  );
}

function parseAttachments(raw: string): Attachment[] | { error: string } {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Attachments inválidos." };
  }
  if (!Array.isArray(parsed)) return [];
  if (parsed.length === 0) return [];
  if (parsed.length > ATTACHMENT_MAX_TOTAL) {
    return { error: `Máximo ${ATTACHMENT_MAX_TOTAL} archivos.` };
  }
  const out: Attachment[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      return { error: "Attachment malformado." };
    }
    const a = item as Record<string, unknown>;
    if (!isAttachmentKind(a.kind)) {
      return { error: "Tipo de attachment inválido." };
    }
    if (typeof a.url !== "string" || !a.url.startsWith("https://")) {
      return { error: "URL de attachment inválida." };
    }
    if (typeof a.filename !== "string" || !a.filename) {
      return { error: "Nombre de archivo inválido." };
    }
    if (typeof a.mime_type !== "string" || !a.mime_type) {
      return { error: "Tipo MIME inválido." };
    }
    if (
      typeof a.size_bytes !== "number" ||
      !Number.isFinite(a.size_bytes) ||
      a.size_bytes < 0
    ) {
      return { error: "Tamaño de archivo inválido." };
    }
    const allowedMime = ATTACHMENT_MIME_BY_KIND[a.kind];
    if (!allowedMime.includes(a.mime_type)) {
      return {
        error: `MIME ${a.mime_type} no permitido para ${a.kind}.`,
      };
    }
    if (a.size_bytes > ATTACHMENT_MAX_BYTES_BY_KIND[a.kind]) {
      return { error: `Archivo demasiado grande para ${a.kind}.` };
    }
    out.push({
      kind: a.kind,
      url: a.url,
      filename: a.filename,
      mime_type: a.mime_type,
      size_bytes: a.size_bytes,
    });
  }
  return out;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildHmacHeader(body: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const companyInput = String(formData.get("company") ?? "").trim();
    const idea = String(formData.get("idea") ?? "").trim();
    const targetUser = String(formData.get("target_user") ?? "").trim();
    const industry = String(formData.get("industry") ?? "").trim();
    const references = String(formData.get("references") ?? "").trim();
    const urgencyRaw = String(formData.get("urgency") ?? "").trim();
    const budgetRaw = String(formData.get("budget") ?? "").trim();
    const attachmentsRaw = String(formData.get("attachments") ?? "");
    const honeypot = String(formData.get("website") ?? "").trim();

    // --- Atribución del lead (de dónde llegó: Google Ads, redes, orgánico) ---
    const trk = (k: string) => String(formData.get(k) ?? "").trim().slice(0, 200);
    const utmSource = trk("utm_source");
    const utmMedium = trk("utm_medium");
    const utmCampaign = trk("utm_campaign");
    const utmTerm = trk("utm_term");
    const utmContent = trk("utm_content");
    const gclid = trk("gclid");
    const referrer = trk("referrer");
    const landingPath = trk("landing_path");

    // Origen normalizado para que XiraX OS lo clasifique.
    const deriveSource = (): string => {
      if (gclid || utmMedium === "cpc" || utmMedium === "ppc") return "google-ads";
      if (utmSource) return utmSource.toLowerCase();
      const r = referrer.toLowerCase();
      if (r.includes("instagram")) return "instagram";
      if (r.includes("facebook") || r.includes("fb.")) return "facebook";
      if (r.includes("linkedin")) return "linkedin";
      if (r.includes("google")) return "google-organic";
      if (r) return "referral";
      return "web";
    };
    const leadSource = deriveSource();
    const leadMeta: Record<string, string> = {};
    if (utmSource) leadMeta.utm_source = utmSource;
    if (utmMedium) leadMeta.utm_medium = utmMedium;
    if (utmCampaign) leadMeta.utm_campaign = utmCampaign;
    if (utmTerm) leadMeta.utm_term = utmTerm;
    if (utmContent) leadMeta.utm_content = utmContent;
    if (gclid) leadMeta.gclid = gclid;
    if (referrer) leadMeta.referrer = referrer;
    if (landingPath) leadMeta.landing_path = landingPath;

    if (honeypot) {
      return { status: "success", message: "Mensaje enviado." };
    }

    if (!name || !email || !idea || !targetUser) {
      return {
        status: "error",
        message: "Completá todos los campos obligatorios.",
      };
    }

    if (
      name.length > 100 ||
      companyInput.length > 100 ||
      idea.length > 1000 ||
      targetUser.length > 1000 ||
      industry.length > 100 ||
      references.length > 500
    ) {
      return { status: "error", message: "Entrada demasiado larga." };
    }

    if (!validEmail(email)) {
      return { status: "error", message: "Email inválido." };
    }

    const urgency: Urgency = (URGENCY_VALUES as readonly string[]).includes(
      urgencyRaw,
    )
      ? (urgencyRaw as Urgency)
      : "none";
    const budget: Budget = (BUDGET_VALUES as readonly string[]).includes(
      budgetRaw,
    )
      ? (budgetRaw as Budget)
      : "unknown";

    const company = companyInput || name;

    const attachmentsResult = parseAttachments(attachmentsRaw);
    if (!Array.isArray(attachmentsResult)) {
      return { status: "error", message: attachmentsResult.error };
    }
    const attachments = attachmentsResult;

    const payload: FactoryPayload = {
      name,
      email,
      company,
      idea,
      target_user: targetUser,
      urgency,
      budget,
    };
    if (industry) payload.industry = industry;
    if (references) payload.references = references;
    if (attachments.length > 0) payload.attachments = attachments;
    payload.source = leadSource;
    if (Object.keys(leadMeta).length > 0) payload.meta = leadMeta;

    // --- Factory integration (primary path) ---
    const factoryUrl = process.env.FACTORY_URL;
    const hmacSecret = process.env.FACTORY_HMAC_SECRET;

    let factoryFailure: FactoryFailure | null = null;

    if (factoryUrl && hmacSecret) {
      // CRÍTICO: el body que firmamos y el que enviamos deben ser
      // exactamente la misma string. No re-stringify.
      const rawBody = JSON.stringify(payload);
      const signature = buildHmacHeader(rawBody, hmacSecret);

      try {
        const res = await fetch(`${factoryUrl}/leads/intake`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-XiraX-Signature": signature,
          },
          body: rawBody,
        });

        if (res.status === 429) {
          return {
            status: "error",
            message:
              "Estamos con alta demanda. Escríbenos directo a helix@xiraxai.com.",
          };
        }

        if (res.ok) {
          return {
            status: "success",
            message:
              "Gracias. En 24 horas te contactamos con un diagnóstico y propuesta.",
          };
        }

        // 400 / 401 / 5xx → log y caer a Resend
        const errText = await res.text().catch(() => "");
        console.error("Factory error", res.status, errText);
        factoryFailure = {
          status: String(res.status),
          body: errText.slice(0, 500),
        };
      } catch (factoryErr) {
        console.error("Factory fetch failed:", factoryErr);
        factoryFailure = {
          status: "network",
          body:
            factoryErr instanceof Error
              ? factoryErr.message.slice(0, 500)
              : String(factoryErr).slice(0, 500),
        };
      }
    }

    // --- Resend fallback ---
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no configurada");
      return {
        status: "error",
        message: "Servicio no disponible. Escríbenos a helix@xiraxai.com.",
      };
    }

    const subject = `Nuevo lead — ${company}`;

    const optionalRow = (label: string, value: string) =>
      value
        ? `<tr><td style="padding:8px 0;color:#666;">${escapeHtml(label)}</td><td style="padding:8px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`
        : "";

    const attachmentsHtmlRows = attachments
      .map(
        (a) =>
          `<tr><td style="padding:8px 0;color:#666;text-transform:capitalize;">${escapeHtml(a.kind)}</td><td style="padding:8px 0;"><a href="${escapeHtml(a.url)}" style="color:#0a66c2;">${escapeHtml(a.filename)}</a> <span style="color:#999;">(${formatBytes(a.size_bytes)})</span></td></tr>`,
      )
      .join("");
    const attachmentsHtml = attachments.length
      ? `<h3 style="margin:24px 0 8px;font-size:14px;color:#666;">Adjuntos (${attachments.length})</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${attachmentsHtmlRows}</table>`
      : "";
    const attachmentsText = attachments.length
      ? `\nAdjuntos (${attachments.length}):\n${attachments
          .map(
            (a) =>
              `  - [${a.kind}] ${a.filename} (${formatBytes(a.size_bytes)}) → ${a.url}`,
          )
          .join("\n")}\n`
      : "";

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;">Nuevo lead desde xiraxai.com</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:160px;">Nombre</td><td style="padding:8px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Empresa / proyecto</td><td style="padding:8px 0;"><strong>${escapeHtml(company)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Origen</td><td style="padding:8px 0;"><strong>${escapeHtml(leadSource)}</strong>${utmCampaign ? ` · ${escapeHtml(utmCampaign)}` : ""}</td></tr>
          ${optionalRow("Industria", industry)}
          <tr><td style="padding:8px 0;color:#666;">Urgencia</td><td style="padding:8px 0;"><strong>${escapeHtml(urgency)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Presupuesto</td><td style="padding:8px 0;"><strong>${escapeHtml(budget)}</strong></td></tr>
          ${optionalRow("Referencias", references)}
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Qué querés construir o automatizar?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(idea)}</p>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Quién lo va a usar?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(targetUser)}</p>
        ${attachmentsHtml}
        <p style="margin-top:24px;font-size:12px;color:#999;">Responde directo a este email — el Reply-To es el del prospecto.</p>
      </div>
    `;

    const text = `Nuevo lead desde xiraxai.com

Nombre: ${name}
Empresa / proyecto: ${company}
Email: ${email}
Origen: ${leadSource}${utmCampaign ? ` (${utmCampaign})` : ""}${industry ? `\nIndustria: ${industry}` : ""}
Urgencia: ${urgency}
Presupuesto: ${budget}${references ? `\nReferencias: ${references}` : ""}

¿Qué querés construir o automatizar?
${idea}

¿Quién lo va a usar?
${targetUser}
${attachmentsText}`;

    const { error } = await resend.emails.send({
      from: `XiraX AI <${FROM}>`,
      to: [TO],
      replyTo: email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        status: "error",
        message: "No se pudo enviar. Escríbenos a helix@xiraxai.com.",
      };
    }

    if (factoryFailure) {
      await sendFactoryDownAlert({
        lead: payload,
        failure: factoryFailure,
      });
    }

    return {
      status: "success",
      message:
        "Gracias. En 24 horas te contactamos con un diagnóstico y propuesta.",
    };
  } catch (err) {
    console.error("sendContactEmail exception:", err);
    return {
      status: "error",
      message: "Error inesperado. Escríbenos a helix@xiraxai.com.",
    };
  }
}

async function sendFactoryDownAlert({
  lead,
  failure,
}: {
  lead: FactoryPayload;
  failure: FactoryFailure;
}): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const leadJson = JSON.stringify(lead, null, 2);

    const subject = `🚨 ALERTA xiraxai.com: factory cayó — lead salvado por Resend`;

    const alertAttachments = lead.attachments ?? [];
    const alertAttachmentsHtml = alertAttachments.length
      ? `<h3 style="margin:24px 0 8px;font-size:14px;color:#666;">Adjuntos (${alertAttachments.length})</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${alertAttachments
          .map(
            (a) =>
              `<tr><td style="padding:8px 0;color:#666;text-transform:capitalize;width:120px;">${escapeHtml(a.kind)}</td><td style="padding:8px 0;"><a href="${escapeHtml(a.url)}" style="color:#0a66c2;">${escapeHtml(a.filename)}</a> <span style="color:#999;">(${formatBytes(a.size_bytes)})</span></td></tr>`,
          )
          .join("")}</table>`
      : "";

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#b91c1c;">🚨 Factory caído — lead salvado por Resend</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:160px;">Lead afectado</td><td style="padding:8px 0;"><strong>${escapeHtml(lead.name)}</strong> &lt;${escapeHtml(lead.email)}&gt;</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Status del factory</td><td style="padding:8px 0;"><strong>${escapeHtml(failure.status)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Timestamp (UTC)</td><td style="padding:8px 0;"><code>${escapeHtml(timestamp)}</code></td></tr>
        </table>
        ${alertAttachmentsHtml}
        ${
          failure.body
            ? `<h3 style="margin:24px 0 8px;font-size:14px;color:#666;">Body de error del factory</h3>
        <pre style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;line-height:1.5;overflow-x:auto;">${escapeHtml(failure.body)}</pre>`
            : ""
        }
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">Para procesar manualmente:</h3>
        <pre style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:12px;line-height:1.5;overflow-x:auto;">${escapeHtml(leadJson)}</pre>
        <div style="margin-top:24px;padding:12px;background:#fef3c7;border-left:3px solid #d97706;border-radius:4px;font-size:14px;line-height:1.5;">
          <strong>El lead llegó por email pero NO está en la DB del factory.</strong><br>
          Si quieres procesarlo, envíalo manualmente.
        </div>
        <p style="margin-top:16px;font-size:13px;">
          Dashboard de Railway: <a href="https://railway.app/dashboard">https://railway.app/dashboard</a>
        </p>
      </div>
    `;

    const alertAttachmentsText = alertAttachments.length
      ? `\nAdjuntos (${alertAttachments.length}):\n${alertAttachments
          .map(
            (a) =>
              `  - [${a.kind}] ${a.filename} (${formatBytes(a.size_bytes)}) → ${a.url}`,
          )
          .join("\n")}\n`
      : "";

    const text = `🚨 ALERTA xiraxai.com: factory cayó — lead salvado por Resend

Lead afectado: ${lead.name} <${lead.email}>
Status del factory: ${failure.status}
Timestamp (UTC): ${timestamp}
${alertAttachmentsText}${failure.body ? `\nBody de error del factory:\n${failure.body}\n` : ""}
Para procesar manualmente:
${leadJson}

El lead llegó por email pero NO está en la DB del factory.
Si quieres procesarlo, envíalo manualmente.

Dashboard de Railway: https://railway.app/dashboard
`;

    const { error } = await resend.emails.send({
      from: `XiraX AI Alerts <${FROM}>`,
      to: [TO],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Factory-down alert email failed:", error);
    }
  } catch (err) {
    console.error("Factory-down alert threw:", err);
  }
}
