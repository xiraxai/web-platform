"use client";

// Enlace interno que hace scroll suave a una sección SIN dejar el #hash en la URL.
// Así, si el usuario reabre xiraxai.com, siempre arranca en el inicio (no en #contacto).
export function SmoothScrollLink({
  target,
  className,
  children,
}: {
  target: string; // ej. "#contacto"
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={target}
      className={className}
      onClick={(e) => {
        const id = target.replace(/^#/, "");
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {children}
    </a>
  );
}
