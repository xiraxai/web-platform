"use client";

import { useRef, useState, type DragEvent } from "react";
import { upload } from "@vercel/blob/client";

export type AttachmentKind = "logo" | "doc" | "reference";

export type Attachment = {
  kind: AttachmentKind;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
};

type KindSpec = {
  maxBytes: number;
  allowedMime: readonly string[];
  displayMime: string;
  displaySize: string;
  maxFiles: number;
};

const KIND_SPECS: Record<AttachmentKind, KindSpec> = {
  logo: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ],
    displayMime: "PNG, JPG, SVG, WebP",
    displaySize: "max 5 MB",
    maxFiles: 1,
  },
  doc: {
    maxBytes: 10 * 1024 * 1024,
    allowedMime: ["application/pdf", "text/plain", "text/markdown"],
    displayMime: "PDF, TXT, MD",
    displaySize: "max 10 MB",
    maxFiles: 1,
  },
  reference: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    displayMime: "PNG, JPG, WebP",
    displaySize: "max 5 MB c/u",
    maxFiles: 3,
  },
};

type FileUploadProps = {
  kind: AttachmentKind;
  label: string;
  value: Attachment[];
  onChange: (next: Attachment[]) => void;
  onUploadingChange: (delta: number) => void;
  disabled?: boolean;
  disabledReason?: string;
};

type InFlight = {
  id: string;
  filename: string;
  size_bytes: number;
  progress: number;
  error?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  kind,
  label,
  value,
  onChange,
  onUploadingChange,
  disabled,
  disabledReason,
}: FileUploadProps) {
  const spec = KIND_SPECS[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [inFlight, setInFlight] = useState<InFlight[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const remainingSlots = spec.maxFiles - value.length - inFlight.length;
  const slotFull = remainingSlots <= 0;
  const interactable = !disabled && !slotFull;

  function validateFile(file: File): string | null {
    if (!spec.allowedMime.includes(file.type)) {
      return `Tipo no permitido. ${spec.displayMime} solamente.`;
    }
    if (file.size > spec.maxBytes) {
      return `Archivo muy grande. ${spec.displaySize}.`;
    }
    return null;
  }

  async function uploadFile(file: File) {
    const id = `${Date.now()}-${file.name}`;
    const initial: InFlight = {
      id,
      filename: file.name,
      size_bytes: file.size,
      progress: 0,
    };
    setInFlight((prev) => [...prev, initial]);
    onUploadingChange(1);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload-url",
        clientPayload: JSON.stringify({
          kind,
          size_bytes: file.size,
          mime_type: file.type,
        }),
        onUploadProgress: ({ percentage }) => {
          setInFlight((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, progress: percentage } : f,
            ),
          );
        },
      });

      const newAttachment: Attachment = {
        kind,
        url: blob.url,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      };
      onChange([...value, newAttachment]);
      setInFlight((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido al subir.";
      setInFlight((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, error: friendlyError(message) }
            : f,
        ),
      );
    } finally {
      onUploadingChange(-1);
    }
  }

  function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const available = spec.maxFiles - value.length - inFlight.length;
    if (available <= 0) return;
    const toProcess = arr.slice(0, available);
    for (const file of toProcess) {
      const err = validateFile(file);
      if (err) {
        setInFlight((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${file.name}-err`,
            filename: file.name,
            size_bytes: file.size,
            progress: 0,
            error: err,
          },
        ]);
        continue;
      }
      void uploadFile(file);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (!interactable) return;
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!interactable) return;
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function removeAttachment(url: string) {
    onChange(value.filter((a) => a.url !== url));
  }

  function dismissError(id: string) {
    setInFlight((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-foreground font-medium">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-subtle font-normal">
          opc
        </span>
      </div>

      {!slotFull && (
        <div
          onClick={() => interactable && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={interactable ? 0 : -1}
          aria-disabled={!interactable}
          onKeyDown={(e) => {
            if (!interactable) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={[
            "w-full rounded-lg border border-dashed px-4 py-5 text-center transition cursor-pointer",
            "focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40",
            disabled
              ? "border-border bg-surface/40 cursor-not-allowed opacity-60"
              : dragOver
                ? "border-accent bg-accent/5"
                : "border-border-strong/70 hover:border-accent/60 bg-background",
          ].join(" ")}
        >
          <div className="text-sm text-foreground/85">
            {disabled ? (
              <span>{disabledReason ?? "Uploads no disponibles."}</span>
            ) : (
              <>
                <span aria-hidden className="mr-2">
                  [📎]
                </span>
                Arrastrá un archivo o click para seleccionar
              </>
            )}
          </div>
          {!disabled && (
            <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-subtle">
              <span className="text-accent/70 mr-1.5">{"//"}</span>
              {spec.displayMime} · {spec.displaySize}
              {spec.maxFiles > 1 ? ` · hasta ${spec.maxFiles}` : ""}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={spec.allowedMime.join(",")}
            multiple={spec.maxFiles > 1}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {(value.length > 0 || inFlight.length > 0) && (
        <ul className="mt-2 space-y-2">
          {value.map((att) => (
            <li
              key={att.url}
              className="flex items-center gap-3 rounded-lg border border-border-strong bg-background px-3 py-2 text-sm"
            >
              <span aria-hidden className="text-accent/80">
                [📎]
              </span>
              <span className="flex-1 truncate text-foreground">
                {att.filename}
              </span>
              <span className="font-mono text-[10px] tracking-[0.04em] text-subtle">
                {formatBytes(att.size_bytes)}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.url)}
                aria-label={`Quitar ${att.filename}`}
                className="ml-1 rounded p-1 text-subtle hover:text-foreground hover:bg-surface transition"
              >
                ×
              </button>
            </li>
          ))}
          {inFlight.map((f) => (
            <li
              key={f.id}
              className={[
                "rounded-lg border bg-background px-3 py-2 text-sm",
                f.error
                  ? "border-red-500/40"
                  : "border-border-strong",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-accent/60">
                  [📎]
                </span>
                <span className="flex-1 truncate text-foreground">
                  {f.filename}
                </span>
                <span className="font-mono text-[10px] tracking-[0.04em] text-subtle">
                  {formatBytes(f.size_bytes)}
                </span>
                {f.error && (
                  <button
                    type="button"
                    onClick={() => dismissError(f.id)}
                    aria-label="Cerrar error"
                    className="ml-1 rounded p-1 text-subtle hover:text-foreground hover:bg-surface transition"
                  >
                    ×
                  </button>
                )}
              </div>
              {f.error ? (
                <p className="mt-1 text-xs text-red-400">{f.error}</p>
              ) : (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full bg-accent transition-[width] duration-150"
                    style={{ width: `${Math.max(2, f.progress)}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function friendlyError(raw: string): string {
  if (raw.includes("UPLOADS_DISABLED"))
    return "Uploads no están habilitados en este entorno.";
  if (raw.includes("SIZE_EXCEEDED")) return "Archivo muy grande.";
  if (raw.includes("MIME_NOT_ALLOWED"))
    return "Tipo de archivo no permitido.";
  if (raw.includes("Failed to fetch") || raw.includes("network"))
    return "Falló la red. Inténtalo de nuevo.";
  return "No pudimos subir el archivo. Inténtalo de nuevo.";
}
