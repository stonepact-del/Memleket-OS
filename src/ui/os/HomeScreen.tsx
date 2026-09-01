import { ChevronRight, Clock3 } from "lucide-react";
import type { AppId, State } from "../../core/model";
import { useGame } from "../../store";
import { appNames } from "../appMeta";
import { date, money } from "../format";
import { AppIcon } from "./AppIcon";
const dock: AppId[] = ["chat", "bank", "market", "news"];
export function HomeScreen({
  game,
  openTime,
}: {
  game: State;
  openTime: () => void;
}) {
  const s = useGame(),
    next = game.events
      .filter((e) => !e.processed)
      .sort((a, b) => a.at.localeCompare(b.at))[0],
    apps = (Object.keys(appNames) as AppId[]).filter(
      (a) => a !== "home" && !dock.includes(a),
    ),
    badge = (a: AppId) =>
      a === "chat"
        ? game.messages.filter((m) => !m.fromPlayer && !m.read).length
        : a === "mail"
          ? game.mails.filter((m) => !m.read).length
          : a === "career"
            ? game.applications.filter(
                (x) =>
                  x.statusUnread ||
                  x.state === "interview" ||
                  x.state === "offer",
              ).length
            : 0;
  const icon = (a: AppId, label = true) => {
    const count = badge(a);
    return (
      <button
        key={a}
        onClick={() => s.open(a)}
        aria-label={label ? undefined : appNames[a]}
      >
        <span className="icon-wrap">
          <AppIcon app={a} />
          {count > 0 && <b className="badge">{count}</b>}
        </span>
        {label && <span>{appNames[a]}</span>}
      </button>
    );
  };
  return (
    <div className="phone-home">
      <header className="home-greeting">
        <small>{date(game.now, { weekday: "long" })}</small>
        <strong>Merhaba, {game.player.name.split(" ")[0]}</strong>
        <span>{game.player.province}</span>
      </header>
      <section className="context-widget" aria-label="Sıradaki önemli olay">
        <button onClick={() => s.open("calendar")}>
          <small>SIRADAKİ</small>
          <b>{next?.title || "Bugün sakin"}</b>
          <span>
            {next ? date(next.at) : "Planlı olay yok"} · {game.education.grade}.
            sınıf
          </span>
        </button>
        <aside>
          <button onClick={() => s.open("school")}>
            <small>OKUL</small>
            <b>{game.education.school}</b>
          </button>
          <button onClick={() => s.open("bank")}>
            <small>BAKİYE</small>
            <b>{money(game.balance)}</b>
          </button>
        </aside>
      </section>
      <button className="time-widget" onClick={openTime}>
        <Clock3 />
        <span>
          <small>ZAMAN</small>
          <b>Akışı yönet</b>
        </span>
        <ChevronRight />
      </button>
      <div className="app-grid">{apps.map((a) => icon(a))}</div>
      <section className="phone-dock" aria-label="Sık kullanılan uygulamalar">
        {dock.map((a) => icon(a, false))}
      </section>
    </div>
  );
}
