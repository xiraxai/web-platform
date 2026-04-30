import Link from "next/link";
import ContactForm from "./components/ContactForm";
import { DecodeText } from "./components/DecodeText";
import { DotField } from "./components/DotField";
import { HowItWorks } from "./components/HowItWorks";
import { Reveal } from "./components/Reveal";
import { UseCases } from "./components/UseCases";

const APP_VERSION = "1.0.0";

export default function Home() {
  const now = new Date();
  const year = now.getFullYear();
  const BUILD_TAG = `${year}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

  return (
    <>
      {/* Skip to content — a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:font-medium"
      >
        Saltar al contenido
      </a>

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-semibold tracking-tight">
              XiraX<span className="text-accent"> AI</span>
            </span>
          </Link>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition"
          >
            Agendar llamada
            <span aria-hidden>→</span>
          </a>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="aurora" aria-hidden />
          <div className="absolute inset-0 hero-gradient pointer-events-none" />
          <div className="absolute inset-0 grid-pattern pointer-events-none" />
          <DotField />
          <div className="scan-beam" aria-hidden />
          <div className="absolute inset-0 scanlines pointer-events-none opacity-60" />
          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-36 md:pb-40">
            <div className="max-w-3xl">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 mb-8 font-mono text-[11px] tracking-[0.14em] uppercase text-muted backdrop-blur-sm"
                role="status"
                aria-label="Aceptando nuevos proyectos"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                <span aria-hidden>aceptando_proyectos</span>
                <span className="caret text-accent" aria-hidden />
              </div>
              <DecodeText
                as="h1"
                text={"Construimos productos con IA que tu negocio necesita."}
                className="font-mono text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1]"
              />
              <p className="mt-8 text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
                Mockup en 48 horas. Prototipo iterable en días. Producto en
                producción con monitoreo. Cada fase aprueba la siguiente.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="spec-chip">48h_mockup</span>
                <span className="spec-chip">72h_iteración</span>
                <span className="spec-chip">24-7_monitoreo</span>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <a
                  href="#contacto"
                  className="cta-primary inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:bg-white"
                >
                  Diagnostica tu idea
                  <span className="cta-arrow" aria-hidden>→</span>
                </a>
                <a
                  href="#como-funciona"
                  className="cta-secondary inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong px-6 py-3 font-medium hover:bg-surface"
                >
                  Cómo funciona
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* QUÉ HACEMOS */}
        <section id="que-hacemos" className="border-t border-border">
          <Reveal className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <SectionHeader code="// 01_capabilities" kicker="Qué hacemos" title="Cuatro frentes, un solo equipo." />
            <div className="mt-16 grid md:grid-cols-2 gap-4">
              <Pillar
                highlighted
                id="cap_01"
                title="Automatizamos procesos end-to-end"
                description="Construimos flujos 100% automáticos que eliminan trabajo manual. Conectamos sistemas, datos y decisiones en un solo circuito que opera solo."
              />
              <Pillar
                id="cap_02"
                title="Analizamos datos complejos"
                description="Convertimos tu data cruda en conclusiones accionables. Técnicas avanzadas, hipótesis probadas, recomendaciones con impacto medible."
              />
              <Pillar
                id="cap_03"
                title="Reportería para Dirección"
                description="Dashboards e informes pensados para VP, Dirección y CEO. Cero ruido, decisiones claras, números que sostienen el argumento."
              />
              <Pillar
                id="cap_04"
                title="Productos digitales"
                description="Landings, apps y herramientas con UX de primer nivel. Bajo costo, entrega rápida, diseño que convierte."
              />
            </div>
          </Reveal>
        </section>

        {/* CÓMO FUNCIONA */}
        <Reveal>
          <HowItWorks />
        </Reveal>

        {/* PARA QUIÉN */}
        <Reveal>
          <UseCases />
        </Reveal>

        {/* POR QUÉ XIRAX AI */}
        <section className="border-t border-border">
          <Reveal className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <SectionHeader code="// 04_diferenciales" kicker="Por qué XiraX AI" title="Lo que nos separa del resto." />
            <div className="mt-16 grid md:grid-cols-2 gap-x-12 gap-y-10">
              <Reason
                index={0}
                title="Un solo equipo, todo el circuito"
                description="Análisis, arquitectura, desarrollo y operación bajo el mismo techo. Sin vendors intermedios, sin manos que se suelten."
              />
              <Reason
                index={1}
                title="Velocidad real, no discurso"
                description="Entregas medibles cada semana. Producto en producción en semanas."
              />
              <Reason
                index={2}
                title="IA aplicada, no IA decorativa"
                description="Construimos solo lo que resuelve un problema de negocio concreto. Si no mejora un número tuyo, no se construye."
              />
              <Reason
                index={3}
                title="Precio honesto"
                description="Cobramos por resultado y alcance claro. Cero letra chica."
              />
            </div>
          </Reveal>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="border-t border-border bg-surface/30">
          <Reveal className="max-w-3xl mx-auto px-6 py-24 md:py-32">
            <div className="text-center mb-12">
              <p className="kicker mb-3 inline-block">Empecemos</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Empieza tu proyecto de IA.
              </h2>
              <p className="mt-6 text-lg text-muted">
                Cuéntanos qué quieres automatizar. En 24 horas te respondemos
                con un diagnóstico inicial — sin venta, sin letra chica.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 md:p-10">
              <ContactForm />
            </div>
            <p className="mt-6 text-center text-sm text-subtle">
              O escríbenos directo a{" "}
              <a
                href="mailto:contacto@xiraxai.com"
                className="text-foreground hover:text-accent transition underline underline-offset-4"
              >
                contacto@xiraxai.com
              </a>
            </p>
          </Reveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                href="mailto:contacto@xiraxai.com"
                className="hover:text-foreground transition"
              >
                contacto@xiraxai.com
              </a>
              <div className="mt-1">© {year} XiraX AI. Todos los derechos reservados.</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-border">
            <span className="sys-status">
              <span className="sys-dot" aria-hidden />
              <span>{`[ sys_ok ]`}</span>
            </span>
            <span className="sys-status">{`build ${BUILD_TAG}`}</span>
            <span className="sys-status">{`v${APP_VERSION}`}</span>
            <span className="sys-status">{`lat_co // es_co`}</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionHeader({
  kicker,
  title,
  code,
}: {
  kicker: string;
  title: string;
  code?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <p className="kicker">{kicker}</p>
        {code && <span className="section-pill">{code}</span>}
      </div>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
        {title}
      </h2>
    </div>
  );
}

function Pillar({
  id,
  title,
  description,
  highlighted,
}: {
  id: string;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        "card-system rounded-2xl p-8",
        highlighted
          ? "md:col-span-2 bg-gradient-to-br from-accent/10 to-transparent border border-accent/30"
          : "bg-surface border border-border-strong",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="card-id">{`[ ${id} ]`}</span>
        {highlighted && (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent border border-accent/30 px-3 py-1 text-[10px] font-mono tracking-[0.18em] uppercase">
            Producto estrella
          </span>
        )}
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-3 text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function Reason({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-2">
        <span
          className="reason-dot block"
          style={{ animationDelay: `${index * 600}ms` }}
          aria-hidden
        />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
