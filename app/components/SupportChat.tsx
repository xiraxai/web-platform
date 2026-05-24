"use client";

import { useState, useRef, useEffect } from "react";

interface Msg {
  id: string;
  role: "bot" | "user";
  text: string;
  ts: number;
}

const INITIAL: Msg = {
  id: "welcome",
  role: "bot",
  text:
    "Hola 👋 Soy Helix, el asistente de IA de XiraX. Puedo resolverte al instante dudas sobre lo que hacemos, el proceso y los planes. ¿En qué te ayudo? (Si dejas tu correo, un humano del equipo le da seguimiento.)",
  ts: Date.now(),
};

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([INITIAL]);
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Permite que cualquier CTA (ej. "Hablar con Helix") abra el chat.
  useEffect(() => {
    const openHelix = () => setOpen(true);
    window.addEventListener("xirax:open-helix", openHelix);
    return () => window.removeEventListener("xirax:open-helix", openHelix);
  }, []);

  async function handleSend() {
    if (!text.trim() || sending) return;
    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      ts: Date.now(),
    };
    const nextMsgs = [...msgs, userMsg];
    setMsgs(nextMsgs);
    setText("");
    setSending(true);

    // Captura de lead: si dejó correo, avisamos al equipo una vez (no bloquea el chat).
    if (email.trim() && !leadSent) {
      setLeadSent(true);
      fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: `[Chat Helix] ${userMsg.text}`,
        }),
      }).catch(() => {});
    }

    try {
      // Helix (IA) responde con todo el historial de la conversación.
      const apiMessages = nextMsgs.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch("/api/helix-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      const reply =
        data.reply ||
        "Tuve un problema para responder. Intenta de nuevo o escríbenos a helix@xiraxai.com.";
      setMsgs((m) => [
        ...m,
        { id: `b-${Date.now()}`, role: "bot", text: reply, ts: Date.now() },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          text: "Error de red. Intenta de nuevo o escríbenos a helix@xiraxai.com.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label={open ? "Cerrar soporte" : "Abrir soporte"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-background shadow-lg shadow-accent/30 hover:scale-105 transition-transform flex items-center justify-center"
        style={{ boxShadow: "0 10px 30px rgba(16,185,129,.35)" }}
      >
        <span aria-hidden style={{ fontSize: "1.5rem" }}>
          {open ? "×" : "💬"}
        </span>
      </button>

      {open && (
        <div
          className="card-system rounded-2xl flex flex-col overflow-hidden border border-border-strong"
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "0.75rem",
            zIndex: 50,
            width: "min(380px, calc(100vw - 1.5rem))",
            height: "min(70vh, 540px)",
            maxHeight: "calc(100vh - 8rem)",
            background: "var(--surface)",
          }}
          role="dialog"
          aria-label="Chat con Helix, asistente de IA de XiraX"
        >
          <header
            className="px-4 py-3 border-b border-border-strong flex items-center justify-between"
            style={{ background: "rgba(16,185,129,.06)" }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              <strong className="text-sm font-semibold">Helix</strong>
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted font-mono">
                asistente IA
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-mono">
              en línea
            </span>
          </header>

          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ scrollBehavior: "smooth" }}
          >
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-accent text-background"
                      : "bg-background border border-border-strong text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3.5 py-2.5 bg-background border border-border-strong text-muted text-sm italic">
                  Helix está escribiendo…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border-strong p-3 space-y-2">
            <input
              type="email"
              placeholder="tu@email.com (opcional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border-strong text-sm focus:outline-none focus:border-accent disabled:opacity-50"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe aquí…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sending}
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border-strong text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium disabled:opacity-40"
              >
                Enviar
              </button>
            </div>
            <p className="text-[10px] text-muted">
              Helix responde al instante. Deja tu correo para que un humano le dé seguimiento.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
