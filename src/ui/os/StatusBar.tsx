import { Signal, Wifi } from "lucide-react";
import { useGame } from "../../store";
import { time } from "../format";
export function PhoneIndicators() {
  return (
    <span className="indicators" aria-hidden="true">
      <Signal />
      <Wifi />
      <i className="battery" />
    </span>
  );
}
export function StatusBar({ openCenter }: { openCenter: () => void }) {
  const g = useGame((x) => x.game)!;
  return (
    <header className="status">
      <span className="sim-time">{time(g.now)}</span>
      <button
        className="desktop-home"
        onClick={() => useGame.getState().open("home")}
      >
        MemleketOS
      </button>
      <button
        className="status-icons"
        aria-label="Bildirim merkezini aç"
        onClick={openCenter}
      >
        <i className="system-pulse" aria-hidden="true" />
        <PhoneIndicators />
        {g.notifications.some((n) => !n.read) && <b />}
      </button>
    </header>
  );
}
