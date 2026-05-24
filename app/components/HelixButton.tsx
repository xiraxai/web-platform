"use client";

// Botón que abre el chat de Helix (escucha lo recoge SupportChat).
// Reemplaza el viejo CTA "Agendar llamada": en XiraX no hay llamadas, todo es mail o Helix.
export function HelixButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("xirax:open-helix"))
      }
    >
      {children}
    </button>
  );
}
