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
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Fieldset legend="SOBRE_VOS" hint="datos de contacto">
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

      <Fieldset legend="TU_IDEA" hint="el problema que querés resolver">
        <div className="grid md:grid-cols-2 gap-4">
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
        </div>
      </Fieldset>

      <Fieldset legend="PARAMETROS" hint="opcionales — refinan el diagnóstico">
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Industria o sector"
            name="industry"
            type="text"
            maxLength={100}
            optional
            placeholder="Ej: e-commerce, salud, logística, fintech…"
            disabled={isPending}
          />
          <Field
            label="Referencias"
            name="references"
            type="text"
            maxLength={500}
            optional
            placeholder="https://ejemplo.com, https://otra.com"
            disabled={isPending}
          />
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
      </Fieldset>

      <div className="relative pt-8">
        <div className="connector left-0 right-0 top-0" />
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isPending}
            className="cta-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Enviando…" : "Agendar diagnóstico"}
            {!isPending && <span className="cta-arrow" aria-hidden>→</span>}
          </button>
          {state.status === "error" && (
            <p role="alert" className="text-sm text-red-400">
              {state.message}
            </p>
          )}
        </div>
      </div>
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
    <fieldset className="border-0 p-0 m-0 border-l-2 border-accent/30 pl-5 md:pl-6 space-y-4">
      <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2 ml-[-1.5rem] md:ml-[-1.625rem] pl-5 md:pl-6">
        <span>
          <span className="opacity-60 mr-1.5">{`>`}</span>
          {legend}
        </span>
        {hint && (
          <span className="font-mono text-[10px] tracking-[0.04em] text-subtle normal-case">
            {"// "}
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
      <label htmlFor={name} className="flex items-baseline justify-between text-sm text-foreground mb-2 font-medium">
        <span>{label}</span>
        {optional && <OptionalBadge />}
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
        className="w-full rounded-lg bg-background border border-border-strong px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition disabled:opacity-60"
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
      <label htmlFor={name} className="block text-sm text-foreground mb-2 font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        maxLength={1000}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-[120px] rounded-lg bg-background border border-border-strong px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition resize-y disabled:opacity-60"
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
      <label htmlFor={name} className="flex items-baseline justify-between text-sm text-foreground mb-2 font-medium">
        <span>{label}</span>
        {optional && <OptionalBadge />}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className="w-full appearance-none rounded-lg bg-background border border-border-strong px-4 pr-10 py-3 text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition disabled:opacity-60"
          style={{ colorScheme: "dark" }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtle" />
      </div>
    </div>
  );
}

function OptionalBadge() {
  return (
    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle font-normal">
      opc
    </span>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 5.5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
