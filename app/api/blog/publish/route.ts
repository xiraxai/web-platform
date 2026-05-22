// app/api/blog/publish/route.ts — Webhook receiver para Make.com (FASE 3).
// Make.com llama este endpoint con el contenido generado por Claude API.
// Estrategia: guardar en Vercel KV (o fallback JSON en /tmp) + trigear rebuild
// via Vercel Deploy Hook para que el blog refleje el nuevo post en minutos.
//
// HMAC: mismo patrón que /api/leads/inbound en xiraxai/app.
// Header requerido: x-xirax-signature = hex(HMAC-SHA256(body, BLOG_WEBHOOK_SECRET))

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOG_WEBHOOK_SECRET = process.env.BLOG_WEBHOOK_SECRET ?? "";
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL ?? "";

interface PublishPayload {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  author?: string;
  content: string; // markdown puro (sin frontmatter)
}

function verifyHmac(body: string, signature: string): boolean {
  if (!BLOG_WEBHOOK_SECRET || BLOG_WEBHOOK_SECRET.length < 16) return false;
  const expected = createHmac("sha256", BLOG_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("hex");
  // Comparación timing-safe para evitar timing attacks
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return expected === signature;
  }
}

function buildFrontmatter(p: PublishPayload): string {
  const tags = (p.tags ?? []).map((t) => `  - "${t}"`).join("\n");
  return `---
title: "${p.title.replace(/"/g, '\\"')}"
slug: "${p.slug}"
date: "${p.date}"
excerpt: "${p.excerpt.replace(/"/g, '\\"')}"
tags:
${tags || '  - "AI"'}
author: "${p.author ?? "Equipo XiraX AI"}"
---

`;
}

function sanitizeSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  // 1. Leer body raw para verificar HMAC antes de parsear
  const bodyText = await req.text();
  const sig = req.headers.get("x-xirax-signature") ?? "";

  if (BLOG_WEBHOOK_SECRET) {
    const valid = verifyHmac(bodyText, sig);
    if (!valid) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } else {
    // Sin secret configurado → rechazar en producción, aceptar en dev
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
    }
  }

  // 2. Parsear payload
  let payload: PublishPayload;
  try {
    payload = JSON.parse(bodyText) as PublishPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 3. Validar campos obligatorios
  if (!payload.slug || !payload.title || !payload.content) {
    return NextResponse.json(
      { error: "missing_fields", required: ["slug", "title", "content"] },
      { status: 422 }
    );
  }

  const slug = sanitizeSlug(payload.slug);
  if (!slug) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 422 });
  }

  // 4. Construir el archivo markdown
  const frontmatter = buildFrontmatter({ ...payload, slug });
  const fileContent = frontmatter + payload.content;

  // 5. Guardar en content/_posts/
  // En Vercel (serverless), el filesystem en /var/task es read-only.
  // La estrategia correcta para producción es usar GitHub API para crear el archivo
  // y dejar que Vercel detecte el push y haga rebuild.
  // Para desarrollo local: escritura directa al filesystem.
  const postsDir = path.join(process.cwd(), "content", "_posts");
  const filePath = path.join(postsDir, `${slug}.md`);

  if (process.env.NODE_ENV !== "production") {
    // Desarrollo local: escritura directa
    try {
      if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
      fs.writeFileSync(filePath, fileContent, "utf8");
    } catch (e) {
      console.error("[blog/publish] fs write error", e);
      return NextResponse.json({ error: "write_failed" }, { status: 500 });
    }
  } else {
    // Producción: usar GitHub API para crear/actualizar el archivo
    // Requiere GITHUB_TOKEN + GITHUB_REPO (env vars en Vercel)
    const githubResult = await pushToGitHub(slug, fileContent);
    if (!githubResult.ok) {
      console.error("[blog/publish] GitHub push failed:", githubResult.error);
      // Fallback: trigear deploy hook igual (para que revalide aunque el post no esté)
      if (VERCEL_DEPLOY_HOOK) {
        await fetch(VERCEL_DEPLOY_HOOK, { method: "POST" }).catch(() => null);
      }
      return NextResponse.json(
        { error: "github_push_failed", detail: githubResult.error },
        { status: 502 }
      );
    }
  }

  // 6. Revalidar rutas del blog (ISR on-demand)
  try {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
  } catch {
    // Puede fallar en dev, no es crítico
  }

  // 7. Trigear deploy hook de Vercel (rebuild completo para producción)
  if (VERCEL_DEPLOY_HOOK) {
    fetch(VERCEL_DEPLOY_HOOK, { method: "POST" }).catch((e) =>
      console.error("[blog/publish] deploy hook error", e)
    );
  }

  console.log(`[blog/publish] post creado: ${slug}`);
  return NextResponse.json({ ok: true, slug }, { status: 201 });
}

// GET: health check del webhook
export async function GET() {
  return NextResponse.json({
    service: "xiraxai/blog-publish",
    status: "ok",
    configured: {
      hmac: !!BLOG_WEBHOOK_SECRET,
      deployHook: !!VERCEL_DEPLOY_HOOK,
      github: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
    },
  });
}

// ── GitHub API helper ──────────────────────────────────────────────────────────

interface GitHubResult {
  ok: boolean;
  error?: string;
}

async function pushToGitHub(slug: string, content: string): Promise<GitHubResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "xiraxai/web-platform"
  const branch = process.env.GITHUB_BRANCH ?? "main";

  if (!token || !repo) {
    return { ok: false, error: "GITHUB_TOKEN or GITHUB_REPO not configured" };
  }

  const filePath = `content/_posts/${slug}.md`;
  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Verificar si el archivo ya existe (para obtener el SHA necesario para actualizar)
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (getRes.ok) {
      const data = (await getRes.json()) as { sha?: string };
      existingSha = data.sha;
    }
  } catch {
    // archivo no existe todavía, está bien
  }

  const body = {
    message: `blog: publicar post '${slug}' via content engine`,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  };

  try {
    const res = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `GitHub API ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
