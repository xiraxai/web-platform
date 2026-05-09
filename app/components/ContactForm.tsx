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
    <form action={formAction} className="space-y-8" noValidate>
      {/* Honeypot anti-bot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <Fieldset legend="Sobre vos">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Nombre"
            name="name"
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
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={100}
          optional
          placeholder="Empresa, proyecto, o tu nombre"
          disabled={isPending}
        />
      </Fieldset>

      <Fieldset legend="Tu idea">
        <TextareaField
          label="¿Qué querés construir o automatizar?"
          name="idea"
          required
          placeholder="Ej: un agente que arme el reporte semanal de operaciones leyendo nuestras planillas."
          disabled={isPending}
        />
        <TextareaField
          label="¿Quién lo va a usar?"
          name="target_user"
          required
          placeholder="Ej: el equipo de ops (3 personas), o nuestros clientes finales en el portal."
          disabled={isPending}
        />
      </Fieldset>

      <Fieldset
        legend="Detalles opcionales"
        hint="Mejoran la respuesta que te damos."
      >
        <Field
          label="Industria o sector"
          name="industry"
          type="text"
          maxLength={100}
          optional
          placeholder="Ej: e-commerce, salud, logística, fintech…"
          disabled={isPending}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Urgencia"
            name="urgency"
            optional
            disabled={isPending}
            defaultValue="none"
            options={[
              { value: "none", label: "Sin urgencia" },
              { value: "weeks", label: "En semanas" },
              { value: "days", label: "En días" },
            ]}
          />
          <SelectField
            label="Presupuesto"
            name="budget"
            optional
            disabled={isPending}
            defaultValue="unknown"
            options={[
              { value: "unknown", label: "A definir" },
              { value: "<500", label: "Menos de USD 500" },
              { value: "500-2000", label: "USD 500 – 2000" },
              { value: "2000+", label: "USD 2000+" },
            ]}
          />
        </div>
        <Field
          label="Referencias"
          name="references"
          type="text"
          maxLength={500}
          optional
          placeholder="https://ejemplo.com, https://otra.com"
          disabled={isPending}
        />
      </Fieldset>

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

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 border-0 p-0 m-0">
      <legend className="text-xs uppercase tracking-wider text-subtle font-semibold mb-1">
        {legend}
        {hint && (
          <span className="ml-2 normal-case tracking-normal font-normal text-muted">
            {hint}
          </span>
        )}
      </legend>
      {children}
    </fieldset>
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
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
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
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  required,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  required?: boolean;
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
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition resize-none disabled:opacity-60"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  optional,
  defaultValue,
  options,
  disabled,
}: {
  label: string;
  name: string;
  optional?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm text-muted mb-2 font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-subtle">(opcional)</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
