const steps = [
  {
    number: "01",
    title: "Diagnóstico visual en 48h",
    description:
      "Describes tu idea. En 48 horas recibes una propuesta visual funcional — no una presentación, un producto navegable.",
    spec: "output: propuesta_visual.url",
  },
  {
    number: "02",
    title: "Prototipo que puedes probar",
    description:
      "Si el mockup te convence, construimos la versión real. Iteras sobre algo concreto, no sobre supuestos.",
    spec: "output: producto_real.iterable",
  },
  {
    number: "03",
    title: "Tu producto en producción",
    description:
      "Desplegamos en infraestructura XiraX AI con monitoreo 24/7. Tú operas el producto, nosotros lo mantenemos.",
    spec: "output: producto_en_vivo + monitoreo_24-7",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="kicker">Cómo funciona</p>
            <span className="section-pill">{"// 02_pipeline"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Tres fases. Cada una aprueba la siguiente.
          </h2>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            Sin contrato largo por adelantado. Avanzas solo si la fase anterior
            te convence.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 relative">
          <div
            aria-hidden
            className="connector left-[8%] right-[8%] top-6 hidden sm:block"
          />
          {steps.map((step) => (
            <div
              key={step.number}
              className="step-card group relative flex flex-col"
            >
              <div className="step-num relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border-strong bg-surface">
                <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-muted leading-relaxed">
                {step.description}
              </p>
              <span className="spec-line mt-4">{step.spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
