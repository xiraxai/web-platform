// Últimas ideas — surface del blog en la home. Alimentado por el motor de contenido.
// SEO + demuestra expertise + da motivo para volver. Server component (lee del FS).

import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";

export function LatestPosts() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="ideas" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="kicker">Ideas</p>
              <span className="section-pill">{`// 06_blog`}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Cómo pensamos la IA aplicada.
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-foreground transition font-medium whitespace-nowrap"
          >
            Ver todo el blog <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-system rounded-2xl p-8 bg-surface border border-border-strong flex flex-col hover:border-accent/40 transition group"
            >
              <div className="flex items-center gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] tracking-[0.14em] uppercase text-subtle"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-semibold tracking-tight group-hover:text-accent transition">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed flex-1">
                {post.excerpt}
              </p>
              <span className="mt-5 text-xs text-subtle font-mono">
                {formatDate(post.date)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
