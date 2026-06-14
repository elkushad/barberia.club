"use client";

import { Trash2 } from "lucide-react";

export default function DeleteBarbershopButton({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("¿Estás seguro de eliminar esta barbería? Esta acción es irreversible.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Eliminar"
        style={{ padding: "6px", backgroundColor: "var(--bg-tertiary)", border: "none", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer" }}
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
