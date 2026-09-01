import { useGame } from "../../store";
export function SystemNavigation() {
  const s = useGame();
  if (s.app === "home") return null;
  return (
    <footer className="system-nav">
      <button onClick={() => s.open("home")} aria-label="Ana ekran">
        <span />
      </button>
    </footer>
  );
}
