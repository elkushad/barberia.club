"use client";

// Nombre (subrayado) de quien invitó a un cliente referido. Al hacer clic,
// hace autoscroll hasta la card del cliente que lo invitó y la resalta.
export default function ReferrerLink({ targetId, name }: { targetId: string; name: string }) {
  const goToReferrer = () => {
    const el = document.getElementById(`cliente-${targetId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("cliente-highlight");
    // reinicia la animación si se vuelve a hacer clic
    void el.offsetWidth;
    el.classList.add("cliente-highlight");
    window.setTimeout(() => el.classList.remove("cliente-highlight"), 2200);
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={goToReferrer}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToReferrer();
        }
      }}
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {name}
    </span>
  );
}
