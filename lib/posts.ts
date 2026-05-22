// lib/posts.ts — utilidades para leer posts del blog desde content/_posts/
// Server-only: solo llamar desde Server Components o Route Handlers.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content", "_posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // ISO string yyyy-mm-dd
  excerpt: string;
  tags: string[];
  author: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

/** Lee y parsea el frontmatter de un archivo .md */
function readFileMeta(filename: string): PostMeta | null {
  if (!filename.endsWith(".md")) return null;
  const slug = filename.replace(/\.md$/, "");
  const filePath = path.join(POSTS_DIR, filename);
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      author: String(data.author ?? "Equipo XiraX AI"),
    };
  } catch {
    return null;
  }
}

/** Devuelve todos los posts ordenados por fecha descendente */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR);
  const posts = files
    .map(readFileMeta)
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

/** Devuelve los slugs de todos los posts (para generateStaticParams) */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/** Devuelve un post completo con HTML renderizado */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    const processed = await remark().use(html, { sanitize: false }).process(content);
    const contentHtml = processed.toString();
    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      author: String(data.author ?? "Equipo XiraX AI"),
      contentHtml,
    };
  } catch {
    return null;
  }
}

/** Formatea una fecha ISO a "22 may 2026" en español */
export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
