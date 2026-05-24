// Casos — prueba social anonimizada. Sin nombres de cliente, sin exponer al founder.
// Son productos reales construidos por XiraX, descritos por capacidad y resultado.

const CASES = [
  {
    id: "case_01",
    sector: "Comercio · Alimentos",
    title: "Tienda artesanal online con autogestión",
    build:
      "E-commerce con catálogo, carrito y pedidos directos a WhatsApp. Panel propio para que la dueña suba productos, precios y fotos sin tocar código.",
    result:
      "La dueña opera la tienda sola; los pedidos llegan listos al chat, sin intermediarios.",
  },
  {
    id: "case_02",
    sector: "Servicios B2B",
    title: "Sistema comercial lead-to-cash",
    build:
      "Plataforma que captura leads, los califica con IA, genera propuestas, cobra por link y maneja una red de comerciales con comisiones automáticas.",
    result:
      "Del primer contacto al cobro sin trabajo manual; cada lead queda medido y asignado.",
  },
  {
    id: "case_03",
    sector: "Marketing · Demanda",
    title: "Motor de contenido y captación",
    build:
      "Landing y blog con SEO, conectados a un motor que genera y publica contenido B2B de forma automática para atraer prospectos.",
    result:
      "Presencia que trabaja sola y trae leads, sin equipo de marketing dedicado.",
  },
];

export function Cases() {
  return (
    <section id="casos" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="kicker">Casos</p>
            <span className="section-pill">{`// 02_casos`}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Productos reales, ya en producción.
          </h2>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            Una muestra de lo que construimos. Nombres reservados por
            confidencialidad; los resultados son reales.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {CASES.map((c) => (
            <div
              key={c.id}
              className="card-system rounded-2xl p-8 bg-surface border border-border-strong flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <span className="card-id">{`[ ${c.id} ]`}</span>
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-subtle">
                  {c.sector}
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {c.title}
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                <span className="text-foreground/80 font-medium">
                  Qué construimos.{" "}
                </span>
                {c.build}
              </p>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                <span className="text-accent font-medium">Resultado. </span>
                {c.result}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
