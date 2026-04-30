const steps = [
  {
    number: "01",
    title: "Diagnóstico visual en 48h",
    description:
      "Describes tu idea. En 48 horas recibes una propuesta visual funcional — no una presentación, un producto navegable.",
  },
  {
    number: "02",
    title: "Prototipo que puedes probar",
    description:
      "Si el mockup te convence, construimos la versión real. Iteras sobre algo concreto, no sobre supuestos.",
  },
  {
    number: "03",
    title: "Tu producto en producción",
    description:
      "Desplegamos en infraestructura XiraX AI con monitoreo 24/7. Tú operas el producto, nosotros lo mantenemos.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <p className="kicker mb-4">Cómo funciona</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Tres fases. Cada una aprueba la siguiente.
          </h2>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            Sin contrato largo por adelantado. Avanzas solo si la fase anterior
            te convence.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 relative">
          <div className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-border sm:block" />
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col">
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border-strong bg-surface">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
