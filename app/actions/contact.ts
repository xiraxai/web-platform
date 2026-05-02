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
    const nombre = String(formData.get("nombre") ?? "").trim();
    const empresa = String(formData.get("empresa") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const automatizar = String(formData.get("automatizar") ?? "").trim();
    const hoy = String(formData.get("hoy") ?? "").trim();
    const resultado = String(formData.get("resultado") ?? "").trim();
    const honeypot = String(formData.get("website") ?? "").trim();

    if (honeypot) {
      return { status: "success", message: "Mensaje enviado." };
    }

    if (!nombre || !email || !automatizar || !hoy || !resultado) {
      return {
        status: "error",
        message: "Completá todos los campos obligatorios.",
      };
    }

    if (
      nombre.length > 100 ||
      empresa.length > 100 ||
      automatizar.length > 1000 ||
      hoy.length > 1000 ||
      resultado.length > 1000
    ) {
      return { status: "error", message: "Entrada demasiado larga." };
    }

    if (!validEmail(email)) {
      return { status: "error", message: "Email inválido." };
    }

    // --- Factory integration ---
    const factoryUrl = process.env.FACTORY_URL;
    const hmacSecret = process.env.FACTORY_HMAC_SECRET;

    if (factoryUrl && hmacSecret) {
      const payload = {
        name: nombre,
        company: empresa || nombre,
        email,
        idea: `${automatizar}\n\nSituación actual: ${hoy}`,
        target_user: resultado,
      };

      const rawBody = JSON.stringify(payload);

      const res = await fetch(`${factoryUrl}/leads/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XiraX-Signature": buildHmacHeader(rawBody, hmacSecret),
        },
        body: rawBody,
      });

      if (res.status === 429) {
        return {
          status: "error",
          message:
            "Estamos con alta demanda en este momento. Escríbenos directo a contacto@xiraxai.com.",
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
      const body = await res.json().catch(() => ({}));
      console.error("Factory error", res.status, body);
    }

    // --- Resend fallback ---
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no configurada");
      return {
        status: "error",
        message: "Servicio no disponible. Escríbenos a contacto@xiraxai.com.",
      };
    }

    const subject = `Nuevo lead — ${empresa || nombre}`;

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;">Nuevo lead desde xiraxai.com</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:130px;">Nombre</td><td style="padding:8px 0;"><strong>${escapeHtml(nombre)}</strong></td></tr>
          ${empresa ? `<tr><td style="padding:8px 0;color:#666;">Empresa / proyecto</td><td style="padding:8px 0;"><strong>${escapeHtml(empresa)}</strong></td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Qué querés automatizar?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(automatizar)}</p>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Cómo lo hacés hoy?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(hoy)}</p>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">¿Qué resultado te cambiaría el día a día?</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(resultado)}</p>
        <p style="margin-top:24px;font-size:12px;color:#999;">Responde directo a este email — el Reply-To es el del prospecto.</p>
      </div>
    `;

    const text = `Nuevo lead desde xiraxai.com

Nombre: ${nombre}${empresa ? `\nEmpresa / proyecto: ${empresa}` : ""}
Email: ${email}

¿Qué querés automatizar?
${automatizar}

¿Cómo lo hacés hoy?
${hoy}

¿Qué resultado te cambiaría el día a día?
${resultado}
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
