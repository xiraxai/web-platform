// Cómo trabajamos + planes de acompañamiento (suscripción).
// Planta la expectativa de ingreso recurrente y califica leads por presupuesto.
// Regla: los desarrollos nuevos se cotizan aparte (ver factory: feedback vs desarrollo).

const TIERS = [
  {
    id: "plan_esencial",
    name: "Esencial",
    price: "desde $690.000",
    unit: "/mes",
    desc: "Para mantener el producto vivo y estable.",
    includes: [
      "Hosting monitoreado 24/7",
      "Soporte y correcciones",
      "Ajustes menores de contenido",
      "Reporte mensual",
    ],
  },
  {
    id: "plan_crecimiento",
    name: "Crecimiento",
    price: "desde $1.890.000",
    unit: "/mes",
    desc: "Para mejorar el producto mes a mes.",
    includes: [
      "Todo lo de Esencial",
      "Mejoras continuas priorizadas",
      "Más horas de desarrollo",
      "Atención prioritaria",
    ],
    highlighted: true,
  },
  {
    id: "plan_total",
    name: "Total",
    price: "desde $3.900.000",
    unit: "/mes",
    desc: "Para evolucionar el producto como socio.",
    includes: [
      "Todo lo de Crecimiento",
      "Evolución de producto",
      "Analítica y dashboards",
      "Acompañamiento estratégico",
    ],
  },
];

export function Plans() {
  return (
    <section id="planes" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="kicker">Cómo trabajamos</p>
            <span className="section-pill">{`// 05_planes`}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Te construimos el producto y te acompañamos.
          </h2>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            Primero el build (mockup en 48h, prototipo iterable, producción).
            Luego un plan de acompañamiento mensual para que el producto siga
            vivo y mejorando.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={[
                "card-system rounded-2xl p-8 flex flex-col",
                t.highlighted
                  ? "bg-gradient-to-br from-accent/10 to-transparent border border-accent/30"
                  : "bg-surface border border-border-strong",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <span className="card-id">{`[ ${t.id} ]`}</span>
                {t.highlighted && (
                  <span className="inline-flex items-center rounded-full bg-accent/10 text-accent border border-accent/30 px-3 py-1 text-[10px] font-mono tracking-[0.18em] uppercase">
                    Más elegido
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">
                  {t.price}
                </span>
                <span className="text-sm text-subtle">{t.unit}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{t.desc}</p>
              <ul className="mt-5 space-y-2 flex-1">
                {t.includes.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <span className="text-accent mt-0.5" aria-hidden>
                      ✓
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-subtle max-w-2xl">
          El valor del build se cotiza según el alcance. Los planes incluyen
          soporte y ajustes; los desarrollos o módulos nuevos se cotizan aparte,
          siempre con precio claro y sin letra chica.
        </p>
      </div>
    </section>
  );
}
