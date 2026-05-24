"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { sendContactEmail, type ContactFormState } from "../actions/contact";
import { Mascot } from "./Mascot";

// Campos de atribución: de dónde llegó el lead (Google Ads, redes, orgánico).
// Se capturan de la URL (utm_*, gclid) y del referrer, y se persisten en la
// sesión por si el usuario navega antes de enviar. El backend (XiraX OS) los
// usa para diferenciar el origen del lead.
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;
import { DecodeText } from "./DecodeText";
import { FileUpload, type Attachment } from "./FileUpload";

const initialState: ContactFormState = { status: "idle" };

type Props = {
  uploadsEnabled?: boolean;
};

export default function ContactForm({ uploadsEnabled = true }: Props) {
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState,
  );
  const [logoAttachments, setLogoAttachments] = useState<Attachment[]>([]);
  const [docAttachments, setDocAttachments] = useState<Attachment[]>([]);
  const [referenceAttachments, setReferenceAttachments] = useState<
    Attachment[]
  >([]);
  const [uploadCount, setUploadCount] = useState(0);
  const isUploading = uploadCount > 0;
  const [tracking, setTracking] = useState<Record<string, string>>({});

  useEffect(() => {
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("xirax_tracking") || "{}");
    } catch {
      stored = {};
    }
    const params = new URLSearchParams(window.location.search);
    const t: Record<string, string> = { ...stored };
    for (const k of TRACKING_KEYS) {
      const v = params.get(k);
      if (v) t[k] = v.slice(0, 200);
    }
    if (!t.referrer && document.referrer) {
      t.referrer = document.referrer.slice(0, 200);
    }
    if (!t.landing_path) t.landing_path = window.location.pathname.slice(0, 200);
    try {
      sessionStorage.setItem("xirax_tracking", JSON.stringify(t));
    } catch {
      /* sessionStorage no disponible */
    }
    setTracking(t);
  }, []);

  const allAttachments: Attachment[] = [
    ...logoAttachments,
    ...docAttachments,
    ...referenceAttachments,
  ];

  function incUpload(delta: number) {
    setUploadCount((c) => Math.max(0, c + delta));
  }

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-accent/30 bg-accent/5 p-6 text-center"
      >
        <div className="flex justify-center mb-1">
          <Mascot state="mailSent" size={150} />
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
    <div className="relative">
      <div className="form-scan" aria-hidden="true" />
      <form action={formAction} className="relative space-y-10" noValidate>
        {/* Honeypot anti-bot */}
        <div aria-hidden="true" className="hidden">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Atribución: origen del lead (Google Ads, redes, orgánico) */}
        {Object.entries(tracking).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        <Fieldset index="01" legend="SOBRE_TI" hint="datos de contacto">
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

        <FormDivider />

        <Fieldset
          index="02"
          legend="TU_IDEA"
          hint="el problema que querés resolver"
        >
          <div className="grid lg:grid-cols-2 gap-4">
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

        <FormDivider />

        <Fieldset
          index="03"
          legend="PARAMETROS"
          hint="opcionales — refinan el diagnóstico"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Industria o sector"
              name="industry"
              type="text"
              maxLength={100}
              optional
              placeholder="Ej: salud, logística, educación, manufactura…"
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
                { value: "200-2000", label: "USD 200 – 2.000" },
                { value: "2000-5000", label: "USD 2.000 – 5.000" },
                { value: "5000-15000", label: "USD 5.000 – 15.000" },
                { value: "15000+", label: "USD 15.000+" },
              ]}
            />
          </div>
        </Fieldset>

        <FormDivider />

        <Fieldset
          index="04"
          legend="ASSETS"
          hint="archivos opcionales para contexto"
        >
          <div className="space-y-4">
            <FileUpload
              kind="logo"
              label="Logo o marca"
              value={logoAttachments}
              onChange={setLogoAttachments}
              onUploadingChange={incUpload}
              disabled={!uploadsEnabled}
              disabledReason="Uploads no disponibles en este entorno."
            />
            <FileUpload
              kind="doc"
              label="Documento de contexto"
              value={docAttachments}
              onChange={setDocAttachments}
              onUploadingChange={incUpload}
              disabled={!uploadsEnabled}
              disabledReason="Uploads no disponibles en este entorno."
            />
            <FileUpload
              kind="reference"
              label="Referencias visuales"
              value={referenceAttachments}
              onChange={setReferenceAttachments}
              onUploadingChange={incUpload}
              disabled={!uploadsEnabled}
              disabledReason="Uploads no disponibles en este entorno."
            />
          </div>
        </Fieldset>

        <input
          type="hidden"
          name="attachments"
          value={JSON.stringify(allAttachments)}
        />

        <FormDivider />

        <div className="md:grid md:grid-cols-[200px_1fr] md:gap-10">
          <div className="hidden md:block" />
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="cta-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Enviando…"
                : isUploading
                  ? "Subiendo archivos…"
                  : "Enviar diagnóstico"}
              {!isPending && !isUploading && (
                <span className="cta-arrow" aria-hidden>
                  →
                </span>
              )}
            </button>
            {isUploading && (
              <p className="text-xs text-subtle">
                Esperá a que terminen los uploads para enviar.
              </p>
            )}
            {state.status === "error" && (
              <p role="alert" className="text-sm text-red-400">
                {state.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function Fieldset({
  index,
  legend,
  hint,
  children,
}: {
  index: string;
  legend: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-0 p-0 m-0 grid md:grid-cols-[200px_1fr] gap-6 md:gap-10">
      <legend className="contents">
        <div className="md:pt-1">
          <div className="form-section-num font-mono text-5xl md:text-6xl leading-none tabular-nums">
            <DecodeText as="span" text={index} />
          </div>
          <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            <span className="opacity-60 mr-1.5">{`>`}</span>
            <DecodeText as="span" text={legend} />
            <span className="form-section-caret" aria-hidden="true" />
          </div>
          {hint && (
            <div className="mt-2 font-mono text-[11px] tracking-[0.02em] text-subtle leading-snug">
              <span className="text-accent/70 mr-1.5" aria-hidden>
                →
              </span>
              {hint}
            </div>
          )}
        </div>
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function FormDivider() {
  return (
    <div className="form-divider" aria-hidden="true">
      <div className="connector inset-x-0 top-0" />
    </div>
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
      <label
        htmlFor={name}
        className="flex items-baseline justify-between text-sm text-foreground mb-2 font-medium"
      >
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
        className="form-input w-full rounded-lg bg-background border border-border-strong px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent disabled:opacity-60"
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
      <label
        htmlFor={name}
        className="block text-sm text-foreground mb-2 font-medium"
      >
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
        className="form-input w-full min-h-[120px] rounded-lg bg-background border border-border-strong px-4 py-3 text-foreground placeholder:text-subtle focus:outline-none focus:border-accent resize-y disabled:opacity-60"
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
      <label
        htmlFor={name}
        className="flex items-baseline justify-between text-sm text-foreground mb-2 font-medium"
      >
        <span>{label}</span>
        {optional && <OptionalBadge />}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className="form-input w-full appearance-none rounded-lg bg-background border border-border-strong px-4 pr-10 py-3 text-foreground focus:outline-none focus:border-accent disabled:opacity-60"
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
