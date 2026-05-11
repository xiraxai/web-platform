import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AttachmentKind = "logo" | "doc" | "reference";

type KindSpec = {
  maxBytes: number;
  allowedMime: readonly string[];
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
  },
  doc: {
    maxBytes: 10 * 1024 * 1024,
    allowedMime: ["application/pdf", "text/plain", "text/markdown"],
  },
  reference: {
    maxBytes: 5 * 1024 * 1024,
    allowedMime: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  },
};

function isKind(value: unknown): value is AttachmentKind {
  return value === "logo" || value === "doc" || value === "reference";
}

type ClientPayload = {
  kind: AttachmentKind;
  size_bytes: number;
  mime_type: string;
};

function parseClientPayload(raw: string | null | undefined): ClientPayload {
  if (!raw) throw new Error("MISSING_CLIENT_PAYLOAD");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("INVALID_CLIENT_PAYLOAD");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("INVALID_CLIENT_PAYLOAD");
  }
  const p = parsed as Record<string, unknown>;
  if (!isKind(p.kind)) throw new Error("INVALID_KIND");
  if (typeof p.size_bytes !== "number" || !Number.isFinite(p.size_bytes)) {
    throw new Error("INVALID_SIZE");
  }
  if (typeof p.mime_type !== "string" || !p.mime_type) {
    throw new Error("INVALID_MIME");
  }
  return {
    kind: p.kind,
    size_bytes: p.size_bytes,
    mime_type: p.mime_type,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "UPLOADS_DISABLED" },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload);
        const spec = KIND_SPECS[payload.kind];

        if (payload.size_bytes > spec.maxBytes) {
          throw new Error(
            `SIZE_EXCEEDED: ${payload.kind} max ${spec.maxBytes} bytes`,
          );
        }
        if (!spec.allowedMime.includes(payload.mime_type)) {
          throw new Error(
            `MIME_NOT_ALLOWED: ${payload.mime_type} for ${payload.kind}`,
          );
        }

        return {
          allowedContentTypes: [...spec.allowedMime],
          maximumSizeInBytes: spec.maxBytes,
          tokenPayload: JSON.stringify({ kind: payload.kind }),
        };
      },
      onUploadCompleted: async () => {
        // No-op; client receives the public URL and metadata directly.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
