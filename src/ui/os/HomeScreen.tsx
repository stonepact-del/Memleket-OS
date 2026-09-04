import {
  BatteryMedium,
  ChevronRight,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { CSSProperties } from "react";
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
        <div className="home-date">
          <span>
            {date(game.now, { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <b>
            {game.education.stage === "highSchool"
              ? `${game.education.grade}. sınıf`
              : game.education.stage === "university"
                ? "Üniversite"
                : "Hayat akışı"}
          </b>
        </div>
        <strong>Merhaba, {game.player.name.split(" ")[0]}.</strong>
        <span>
          <MapPin /> {game.player.province} · {game.location}
        </span>
      </header>
      <section className="life-ribbon" aria-label="Günlük durum">
        <div>
          <Sparkles />
          <span>
            <small>RUH HALİ</small>
            <b>%{game.player.mood}</b>
          </span>
        </div>
        <div>
          <BatteryMedium />
          <span>
            <small>ENERJİ</small>
            <b>%{game.player.energy}</b>
          </span>
        </div>
        <i
          style={
            {
              "--mood": `${game.player.mood}%`,
              "--energy": `${game.player.energy}%`,
            } as CSSProperties
          }
        />
      </section>
      <section className="context-widget" aria-label="Sıradaki önemli olay">
        <button
          onClick={() =>
            next
              ? s.navigate({
                  app: "calendar",
                  eventId: next.id,
                  date: next.at.slice(0, 10),
                })
              : s.open("calendar")
          }
        >
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
