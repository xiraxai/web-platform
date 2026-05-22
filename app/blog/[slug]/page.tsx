// app/blog/[slug]/page.tsx — Post individual del blog
// ISR: revalida cada 300s.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getAllPostSlugs, formatDate } from "@/lib/posts";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post no encontrado · XiraX AI" };
  return {
    title: `${post.title} · XiraX AI`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight shrink-0">
            XiraX<span className="text-accent"> AI</span>
          </Link>
          <span className="text-subtle text-sm" aria-hidden>/</span>
          <Link href="/blog" className="text-sm text-muted hover:text-foreground transition">
            Blog
          </Link>
          <span className="text-subtle text-sm" aria-hidden>/</span>
          <span className="text-sm text-subtle truncate hidden sm:block">{post.title}</span>
        </nav>
      </header>

      <main className="flex-1">
        {/* HEADER DEL POST */}
        <article>
          <header className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 grid-pattern pointer-events-none" />
            <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-12">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
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
              <h1 className="font-mono text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="mt-4 text-lg text-muted leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="mt-6 flex items-center gap-4 text-sm text-subtle font-mono">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden>·</span>
                <span>{post.author}</span>
              </div>
            </div>
          </header>

          {/* CONTENIDO */}
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <div
              className="prose-xirax"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Volver al blog */}
            <div className="mt-16 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
              >
                <span aria-hidden>←</span>
                Volver al blog
              </Link>
            </div>
          </div>
        </article>

        {/* CTA */}
        <section className="border-t border-border bg-surface/30">
          <div className="max-w-3xl mx-auto px-6 py-12 text-center">
            <p className="kicker mb-3 inline-block">¿Querés ir más lejos?</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Diagnóstico gratuito para tu empresa.
            </h2>
            <p className="mt-4 text-muted max-w-md mx-auto">
              En 20 minutos identificamos qué proceso tiene el mayor potencial de automatización en tu operación.
            </p>
            <a
              href="/#contacto"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white transition"
            >
              Empezar diagnóstico →
            </a>
          </div>
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
          <div className="text-sm text-subtle">
            © {new Date().getFullYear()} XiraX AI. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}
