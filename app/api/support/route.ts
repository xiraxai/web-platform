import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "helix@xiraxai.com";
const TO = process.env.RESEND_TO ?? "raphael@xiraxai.com";

interface Body {
  email?: string | null;
  message?: string;
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!message || message.length < 3) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "message_too_long" }, { status: 413 });
  }

  const ua = req.headers.get("user-agent") ?? "—";
  const ref = req.headers.get("referer") ?? "—";

  const subject = `[Soporte landing] ${message.slice(0, 60).replace(/\s+/g, " ")}${message.length > 60 ? "…" : ""}`;
  const html = `
    <h2>Nuevo mensaje desde el chat de soporte (landing)</h2>
    <p><strong>Email cliente:</strong> ${email ? escapeHtml(email) : "<em>no provisto</em>"}</p>
    <p><strong>Mensaje:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;background:#fafafa;padding:12px;border-left:3px solid #10b981;">${escapeHtml(message)}</pre>
    <hr/>
    <p style="font-size:12px;color:#888;">UA: ${escapeHtml(ua)}<br/>Ref: ${escapeHtml(ref)}</p>
  `;

  try {
    await resend.emails.send({
      from: `XiraX Soporte <${FROM}>`,
      to: TO,
      replyTo: email || undefined,
      subject,
      html,
    });
  } catch (e) {
    console.error("[support] resend error", e);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
