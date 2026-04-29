const cases = [
  {
    kicker: "Operaciones",
    title: "Planificación operativa, automatizada",
    description:
      "Automatiza la planificación operativa: turnos, ausencias, picos de demanda. Decisiones que hoy te toman horas, en minutos.",
  },
  {
    kicker: "Datos",
    title: "Dashboards conectados a tus sistemas",
    description:
      "Dashboards de operación en tiempo real conectados a tus sistemas internos. Una sola fuente de verdad para Dirección.",
  },
  {
    kicker: "Procesos internos",
    title: "Del Excel crítico a la aplicación",
    description:
      "Reemplaza Excels críticos por aplicaciones que tu equipo entiende y mantiene. Auditables, versionadas, sin macros frágiles.",
  },
];

export function UseCases() {
  return (
    <section id="para-quien" className="border-t border-border bg-surface/30">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Para quién
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Equipos B2B con problemas concretos.
          </h2>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            No vendemos IA. Resolvemos problemas de negocio con la herramienta
            que corresponda.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cases.map((useCase) => (
            <div
              key={useCase.kicker}
              className="rounded-2xl border border-border bg-background p-8 transition-all hover:border-border/70"
            >
              <p className="text-accent text-xs font-medium tracking-widest uppercase mb-4">
                {useCase.kicker}
              </p>
              <h3 className="text-xl font-semibold tracking-tight">
                {useCase.title}
              </h3>
              <p className="mt-3 text-muted leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
