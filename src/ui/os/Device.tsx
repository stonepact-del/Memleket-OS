import { useEffect, useState } from "react";
import type { AppId, State } from "../../core/model";
import { useGame } from "../../store";
import { simulationTimeOfDay } from "../wallpaper";
import { appNames } from "../appMeta";
import { AppIcon } from "./AppIcon";
import { StatusBar } from "./StatusBar";
import { LockScreen } from "./LockScreen";
import { NotificationCenter } from "./NotificationCenter";
import { SystemNavigation } from "./SystemNavigation";
import { TimeSheet } from "./TimeSheet";
import { HomeScreen } from "./HomeScreen";
import { ChatApp } from "../apps/chat/ChatApp";
import { BankApp } from "../apps/bank/BankApp";
import { MarketApp } from "../apps/market/MarketApp";
import { SchoolApp } from "../apps/school/SchoolApp";
import { CareerApp } from "../apps/career/CareerApp";
import { CalendarApp } from "../apps/calendar/CalendarApp";
import { FeedApp } from "../apps/feed/FeedApp";
import { MailApp } from "../apps/mail/MailApp";
import { NewsApp } from "../apps/news/NewsApp";
import { StocksApp } from "../apps/stocks/StocksApp";
import { MapApp } from "../apps/map/MapApp";
import { NotesApp } from "../apps/notes/NotesApp";
import { SettingsApp } from "../apps/settings/SettingsApp";
import { ArchiveApp } from "../apps/archive/ArchiveApp";
function Brand() {
  return (
    <div className="brand">
      <span>M</span>
      <div>
        <b>MemleketOS</b>
        <small>Bir hayat. Bin ihtimal.</small>
      </div>
    </div>
  );
}
function DesktopRail() {
  const s = useGame();
  return (
    <aside className="rail">
      <Brand />
      <nav>
        {(Object.keys(appNames) as AppId[]).map((a) => (
          <button
            className={s.app === a ? "active" : ""}
            key={a}
            onClick={() => s.open(a)}
            title={appNames[a]}
          >
            <AppIcon app={a} size="small" />
            <span>{appNames[a]}</span>
          </button>
        ))}
      </nav>
      <button onClick={() => s.setScreen("menu")}>
        <span>Menü</span>
      </button>
    </aside>
  );
}
function Content({ game, openTime }: { game: State; openTime: () => void }) {
  const app = useGame((x) => x.app);
  if (app === "home") return <HomeScreen game={game} openTime={openTime} />;
  if (app === "chat") return <ChatApp game={game} />;
  if (app === "bank") return <BankApp game={game} />;
  if (app === "market") return <MarketApp game={game} />;
  if (app === "school") return <SchoolApp game={game} />;
  if (app === "career") return <CareerApp game={game} />;
  if (app === "calendar") return <CalendarApp game={game} />;
  if (app === "feed") return <FeedApp game={game} />;
  if (app === "mail") return <MailApp game={game} />;
  if (app === "news") return <NewsApp game={game} />;
  if (app === "stocks") return <StocksApp game={game} />;
  if (app === "map") return <MapApp game={game} />;
  if (app === "notes") return <NotesApp game={game} />;
  if (app === "settings") return <SettingsApp game={game} />;
  if (app === "archive") return <ArchiveApp game={game} />;
  return <HomeScreen game={game} openTime={openTime} />;
}
export function Device() {
  const s = useGame(),
    game = s.game!,
    [locked, setLocked] = useState(true),
    [center, setCenter] = useState(false),
    [timeOpen, setTimeOpen] = useState(false);
  useEffect(() => {
    if (!s.notice) return;
    const t = setTimeout(() => useGame.setState({ notice: undefined }), 2600);
    return () => clearTimeout(t);
  }, [s.notice]);
  if (locked) return <LockScreen game={game} unlock={() => setLocked(false)} />;
  return (
    <main
      className={`device ${game.settings.largeText ? "large" : ""} ${game.settings.reducedMotion ? "reduce-motion" : ""} wallpaper-${game.settings.wallpaper} tod-${simulationTimeOfDay(game.now)}`}
    >
      <DesktopRail />
      <section className="workspace">
        <StatusBar openCenter={() => setCenter(true)} />
        <div className={`app-window app-${s.app}`}>
          <Content game={game} openTime={() => setTimeOpen(true)} />
        </div>
        <SystemNavigation />
      </section>
      {center && (
        <NotificationCenter game={game} close={() => setCenter(false)} />
      )}{" "}
      {timeOpen && <TimeSheet game={game} close={() => setTimeOpen(false)} />}{" "}
      {s.notice && (
        <div role="status" className="toast success">
          {s.notice}
          <button
            aria-label="Bildirimi kapat"
            onClick={() => useGame.setState({ notice: undefined })}
          >
            ×
          </button>
        </div>
      )}{" "}
      {s.error && (
        <div role="alert" className="toast">
          {s.error}
          <button aria-label="Hatayı kapat" onClick={() => s.setError()}>
            ×
          </button>
        </div>
      )}
    </main>
  );
}
