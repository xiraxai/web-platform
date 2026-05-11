"use server";

import { createHmac } from "crypto";
import { Resend } from "resend";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "contacto@xiraxai.com";
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
};

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
    const honeypot = String(formData.get("website") ?? "").trim();

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
              "Estamos con alta demanda. Escríbenos directo a contacto@xiraxai.com.",
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
        message: "Servicio no disponible. Escríbenos a contacto@xiraxai.com.",
      };
    }

    const subject = `Nuevo lead — ${company}`;

    const optionalRow = (label: string, value: string) =>
      value
        ? `<tr><td style="padding:8px 0;color:#666;">${escapeHtml(label)}</td><td style="padding:8px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`
        : "";

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;">Nuevo lead desde xiraxai.com</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:160px;">Nombre</td><td style="padding:8px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Empresa / proyecto</td><td style="padding:8px 0;"><strong>${escapeHtml(company)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${optionalRow("Industria", industry)}
          <tr><td style="padding:8px 0;color:#666;">Urgencia</td><td style="padding:8px 0;"><strong>${escapeHtml(urgency)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Presupuesto</td><td style="padding:8px 0;"><strong>${escapeHtml(budget)}</strong></td></tr>
          ${optionalRow("Referencias", references)}
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Qué querés construir o automatizar?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(idea)}</p>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Quién lo va a usar?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(targetUser)}</p>
        <p style="margin-top:24px;font-size:12px;color:#999;">Responde directo a este email — el Reply-To es el del prospecto.</p>
      </div>
    `;

    const text = `Nuevo lead desde xiraxai.com

Nombre: ${name}
Empresa / proyecto: ${company}
Email: ${email}${industry ? `\nIndustria: ${industry}` : ""}
Urgencia: ${urgency}
Presupuesto: ${budget}${references ? `\nReferencias: ${references}` : ""}

¿Qué querés construir o automatizar?
${idea}

¿Quién lo va a usar?
${targetUser}
`;

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
        message: "No se pudo enviar. Escríbenos a contacto@xiraxai.com.",
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
      message: "Error inesperado. Escríbenos a contacto@xiraxai.com.",
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

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#b91c1c;">🚨 Factory caído — lead salvado por Resend</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:160px;">Lead afectado</td><td style="padding:8px 0;"><strong>${escapeHtml(lead.name)}</strong> &lt;${escapeHtml(lead.email)}&gt;</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Status del factory</td><td style="padding:8px 0;"><strong>${escapeHtml(failure.status)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Timestamp (UTC)</td><td style="padding:8px 0;"><code>${escapeHtml(timestamp)}</code></td></tr>
        </table>
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
          Si querés procesarlo, mandalo manualmente.
        </div>
        <p style="margin-top:16px;font-size:13px;">
          Dashboard de Railway: <a href="https://railway.app/dashboard">https://railway.app/dashboard</a>
        </p>
      </div>
    `;

    const text = `🚨 ALERTA xiraxai.com: factory cayó — lead salvado por Resend

Lead afectado: ${lead.name} <${lead.email}>
Status del factory: ${failure.status}
Timestamp (UTC): ${timestamp}
${failure.body ? `\nBody de error del factory:\n${failure.body}\n` : ""}
Para procesar manualmente:
${leadJson}

El lead llegó por email pero NO está en la DB del factory.
Si querés procesarlo, mandalo manualmente.

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
