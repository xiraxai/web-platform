"use server";

import { Resend } from "resend";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "contacto@xiraxai.com";
const TO = process.env.RESEND_TO ?? "raphael@xiraxai.com";

// Escape HTML to prevent injection in email body
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

export async function sendContactEmail(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    const nombre = String(formData.get("nombre") ?? "").trim();
    const empresa = String(formData.get("empresa") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const mensaje = String(formData.get("mensaje") ?? "").trim();
    // Honeypot: campo oculto, si viene lleno es bot
    const honeypot = String(formData.get("website") ?? "").trim();

    if (honeypot) {
      // Fake success para no dar pistas al bot
      return { status: "success", message: "Mensaje enviado." };
    }

    if (!nombre || !empresa || !email || !mensaje) {
      return {
        status: "error",
        message: "Todos los campos son obligatorios.",
      };
    }

    if (nombre.length > 100 || empresa.length > 100 || mensaje.length > 2000) {
      return { status: "error", message: "Entrada demasiado larga." };
    }

    if (!validEmail(email)) {
      return { status: "error", message: "Email inválido." };
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY no configurada");
      return {
        status: "error",
        message: "Servicio no disponible. Escríbenos a contacto@xiraxai.com.",
      };
    }

    const subject = `Nuevo lead — ${empresa}`;

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;font-size:18px;">Nuevo lead desde xiraxai.com</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#666;width:110px;">Nombre</td><td style="padding:8px 0;"><strong>${escapeHtml(nombre)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Empresa</td><td style="padding:8px 0;"><strong>${escapeHtml(empresa)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#666;">Qué quiere resolver</h3>
        <p style="white-space:pre-wrap;padding:12px;background:#f5f5f5;border-radius:8px;font-size:14px;line-height:1.5;">${escapeHtml(mensaje)}</p>
        <p style="margin-top:24px;font-size:12px;color:#999;">Responde directo a este email — el Reply-To es el del prospecto.</p>
      </div>
    `;

    const text = `Nuevo lead desde xiraxai.com

Nombre: ${nombre}
Empresa: ${empresa}
Email: ${email}

Qué quiere resolver:
${mensaje}
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
