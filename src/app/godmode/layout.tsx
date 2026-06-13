import { requireAdmin } from "@/lib/auth";
import GodmodeShell from "./GodmodeShell";

export default async function GodmodeLayout({ children }: { children: React.ReactNode }) {
  // Primera barrera: solo usuarios con rol ADMIN pueden entrar a God Mode.
  await requireAdmin();

  return <GodmodeShell>{children}</GodmodeShell>;
}
