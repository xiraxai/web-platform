"use client";

import { useActionState } from "react";
import { sendContactEmail, type ContactFormState } from "../actions/contact";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-center"
      >
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-accent/20 text-accent mb-3">
          <span aria-hidden>✓</span>
        </div>
        <p className="text-lg font-semibold text-foreground">
          {state.message}
        </p>
        <p className="mt-2 text-sm text-muted">
          Revisaremos tu caso y te contactaremos con un diagnóstico inicial.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {/* Honeypot anti-bot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          maxLength={100}
          disabled={isPending}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={150}
          disabled={isPending}
        />
      </div>
      <Field
        label="Empresa o proyecto"
        name="empresa"
        type="text"
        autoComplete="organization"
        maxLength={100}
        optional
        disabled={isPending}
      />
      <TextareaField
        label="¿Qué querés automatizar o dejar de hacer manualmente?"
        name="automatizar"
        placeholder="Ej: el reporte semanal de operaciones que hoy nos toma 2 días."
        disabled={isPending}
      />
      <TextareaField
        label="¿Cómo lo hacés hoy?"
        name="hoy"
        placeholder="Ej: lo hacemos a mano en Excel, tarda 3 horas por semana entre 2 personas."
        disabled={isPending}
      />
      <TextareaField
        label="¿Qué resultado te cambiaría el día a día?"
        name="resultado"
        placeholder="Ej: que salga solo cada lunes a las 8am sin que nadie lo tenga que armar."
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Enviando…" : "Agendar diagnóstico"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-400">
          {state.message}
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
  optional,
  autoComplete,
  maxLength,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-muted mb-2 font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-subtle">(opcional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-muted mb-2 font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        maxLength={1000}
        required
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition resize-none disabled:opacity-60"
      />
    </div>
  );
}
