import { X } from "lucide-react";
import type { State } from "../../core/model";
import { useGame } from "../../store";
import { appNames } from "../appMeta";
import { date, time } from "../format";
import { AppIcon } from "./AppIcon";
import { Sheet } from "../components/Sheet";
export function NotificationCenter({
  game,
  close,
}: {
  game: State;
  close: () => void;
}) {
  const s = useGame();
  return (
    <Sheet
      label="Bildirim merkezi"
      onClose={close}
      className="notification-center"
    >
      <header>
        <div>
          <small>
            MEMLEKETOS · {date(game.now, { weekday: "long", day: "numeric", month: "long" })}
          </small>
          <h2>Bugün</h2>
        </div>
        <button aria-label="Kapat" onClick={close}>
          <X />
        </button>
      </header>
      <div className="notification-actions">
        <span>
          {game.notifications.filter((n) => !n.read).length} okunmamış
        </span>
        <button className="mark-all" onClick={() => s.markAllRead()}>
          Tümünü okundu işaretle
        </button>
      </div>
      {game.notifications.length === 0 ? (
        <div className="notification-empty"><AppIcon app="home"/><h3>Her şey sakin</h3><p>Yeni bir gelişme olduğunda burada göreceksin.</p></div>
      ) : (
        <div className="notification-stack">
          {game.notifications.map((n) => (
            <button
              className={n.read ? "read" : "unread"}
              key={n.id}
              onClick={() => {
                s.readNotification(n.id);
                s.open(n.app);
                close();
              }}
            >
              <AppIcon app={n.app} size="small" />
              <div>
                <span>
                  <b>{appNames[n.app]}</b>
                  <time>{time(n.at)}</time>
                </span>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
