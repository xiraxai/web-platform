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
const BUDGET_VALUES = ["<500", "500-2000", "2000+", "unknown"] as const;
type Urgency = (typeof URGENCY_VALUES)[number];
type Budget = (typeof BUDGET_VALUES)[number];

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
              "Gracias. En 48h te contactamos con un diagnóstico y propuesta.",
          };
        }

        // 400 / 401 / 5xx → log y caer a Resend
        const errBody = await res.json().catch(() => ({}));
        console.error("Factory error", res.status, errBody);
      } catch (factoryErr) {
        console.error("Factory fetch failed:", factoryErr);
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

    return {
      status: "success",
      message: "Gracias. Te respondemos en 24 horas.",
    };
  } catch (err) {
    console.error("sendContactEmail exception:", err);
    return {
      status: "error",
      message: "Error inesperado. Escríbenos a contacto@xiraxai.com.",
    };
  }
}
