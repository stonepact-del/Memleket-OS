import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useGame } from "../../store";
export function AppShell({
  title,
  children,
  variant = "solid",
  toolbar,
}: {
  title: string;
  children: ReactNode;
  variant?: "solid" | "transparent" | "large" | "hidden";
  toolbar?: ReactNode;
}) {
  const s = useGame();
  return (
    <div className={`native-app-shell shell-${variant}`}>
      {variant !== "hidden" && (
        <header className="native-app-header">
          <button onClick={() => s.open("home")} aria-label="Ana ekrana dön">
            <ChevronLeft />
          </button>
          <h1>{title}</h1>
          {toolbar || <span />}
        </header>
      )}
      <div className="native-app-body">{children}</div>
    </div>
  );
}
