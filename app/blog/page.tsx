// app/blog/page.tsx — Blog index de XiraX AI
// ISR: revalida cada 300s para reflejar nuevos posts sin rebuild completo.

import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, formatDate } from "@/lib/posts";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog · XiraX AI",
  description:
    "Análisis, casos y aprendizajes sobre automatización, IA aplicada y transformación operativa para empresas B2B en Colombia.",
  openGraph: {
    title: "Blog · XiraX AI",
    description: "Automatización, IA aplicada y transformación operativa para empresas B2B.",
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      {/* NAV — reutiliza el mismo patrón que page.tsx */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-semibold tracking-tight">
              XiraX<span className="text-accent"> AI</span>
            </span>
          </Link>
          <a
            href="/#contacto"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition"
          >
            Escríbenos
            <span aria-hidden>→</span>
          </a>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 grid-pattern pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 mb-6 font-mono text-[11px] tracking-[0.14em] uppercase text-muted backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" aria-hidden />
              <span>blog_xiraxai</span>
            </div>
            <h1 className="font-mono text-4xl md:text-5xl font-semibold tracking-tight leading-tight max-w-2xl">
              Ideas que mueven
              <span className="text-accent"> operaciones.</span>
            </h1>
            <p className="mt-5 text-lg text-muted max-w-xl leading-relaxed">
              Automatización, IA aplicada y transformación operativa para empresas B2B. Sin buzz, con números.
            </p>
          </div>
        </section>

        {/* POSTS */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-mono text-muted text-sm tracking-wider">
                // próximamente — primer post en preparación
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-border-strong bg-surface hover:border-accent/40 hover:bg-surface/80 transition-all duration-200 overflow-hidden"
                >
                  {/* Header de la card */}
                  <div className="p-6 flex-1">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 text-[10px] font-mono tracking-[0.14em] uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Título */}
                    <h2 className="text-lg font-semibold tracking-tight leading-snug group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer de la card */}
                  <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-subtle font-mono">{formatDate(post.date)}</span>
                      <span className="text-subtle" aria-hidden>·</span>
                      <span className="text-xs text-subtle">{post.author}</span>
                    </div>
                    <span
                      className="text-muted group-hover:text-accent transition-colors text-sm"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold">
              XiraX<span className="text-accent"> AI</span>
            </div>
            <p className="text-sm text-subtle mt-1">
              Fábrica de productos con IA para empresas B2B.
            </p>
          </div>
          <div className="text-sm text-subtle text-left sm:text-right">
            <a
              href="mailto:helix@xiraxai.com"
              className="hover:text-foreground transition"
            >
              helix@xiraxai.com
            </a>
            <div className="mt-1">
              © {new Date().getFullYear()} XiraX AI. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
