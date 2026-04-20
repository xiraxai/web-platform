"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get("nombre") ?? "");
    const empresa = String(data.get("empresa") ?? "");
    const email = String(data.get("email") ?? "");
    const mensaje = String(data.get("mensaje") ?? "");

    const subject = encodeURIComponent(
      `Diagnóstico XiraX AI — ${empresa || nombre}`
    );
    const body = encodeURIComponent(
      `Nombre: ${nombre}\nEmpresa: ${empresa}\nEmail: ${email}\n\nQué quiere resolver:\n${mensaje}`
    );

    window.location.href = `mailto:contacto@xiraxai.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
        />
        <Field
          label="Empresa"
          name="empresa"
          type="text"
          required
          autoComplete="organization"
        />
      </div>
      <Field
        label="Email corporativo"
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <div>
        <label
          htmlFor="mensaje"
          className="block text-sm text-muted mb-2 font-medium"
        >
          Qué quieres resolver
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          maxLength={300}
          required
          placeholder="Ej: automatizar el reporte semanal de operaciones que hoy nos toma 2 días."
          className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white transition"
      >
        Agendar diagnóstico
        <span aria-hidden>→</span>
      </button>
      {sent && (
        <p className="text-sm text-accent">
          Abrimos tu cliente de email. Si no se abrió, escríbenos a contacto@xiraxai.com.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-muted mb-2 font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
      />
    </div>
  );
}
