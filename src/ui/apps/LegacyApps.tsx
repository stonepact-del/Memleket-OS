import { useEffect, useState } from "react";
import * as I from "lucide-react";
import type { AppId, State } from "../../core/model";
import { useGame } from "../../store";
import { tr } from "../../data/content";
import { date, money } from "../format";
import { appNames } from "../appMeta";
import { AppShell } from "../os/AppShell";
const Card = ({ children }: { children: React.ReactNode }) => (
  <article className="card">{children}</article>
);
function Stocks({ g }: { g: State }) {
  const trade = useGame((x) => x.trade),
    [selected, setSelected] = useState<string>();
  const c = g.companies.find((x) => x.id === selected);
  if (c) {
    const h = g.holdings[c.id] || { quantity: 0, cost: 0 },
      value = h.quantity * c.price,
      gain = value - h.cost,
      pts = c.priceHistory
        .map(
          (v, i) =>
            `${(i / Math.max(1, c.priceHistory.length - 1)) * 280},${70 - (v / Math.max(...c.priceHistory)) * 60}`,
        )
        .join(" ");
    return (
      <div className="content">
        <button className="back" onClick={() => setSelected(undefined)}>
          <I.ArrowLeft /> Şirketler
        </button>
        <p className="fiction">
          Kurgusal şirket ve fiyatlar; finansal tavsiye değildir.
        </p>
        <h1>{c.name}</h1>
        <p>
          {c.sector} · Sağlık %{c.health} · İşe alım %{c.hiringDemand}
        </p>
        <svg
          className="price-chart"
          viewBox="0 0 280 80"
          role="img"
          aria-label="Fiyat geçmişi"
        >
          <polyline points={pts} />
        </svg>
        <div className="stat-row">
          <Card>
            <small>ADET</small>
            <b>{h.quantity}</b>
          </Card>
          <Card>
            <small>MALİYET</small>
            <b>{money(h.cost)}</b>
          </Card>
          <Card>
            <small>DEĞER</small>
            <b>{money(value)}</b>
          </Card>
          <Card>
            <small>FARK</small>
            <b className={gain >= 0 ? "gain" : "loss"}>{money(gain)}</b>
          </Card>
        </div>
        <button onClick={() => trade(c.id, 1)}>1 adet al</button>
        {h.quantity > 0 && (
          <button onClick={() => trade(c.id, -1)}>1 adet sat</button>
        )}
      </div>
    );
  }
  return (
    <div className="content">
      <p className="fiction">
        Tamamen kurgusal yerel piyasa; tavsiye değildir.
      </p>
      <div className="cards">
        {g.companies.slice(0, 16).map((c) => (
          <Card key={c.id}>
            <small>{c.sector}</small>
            <h3>{c.name}</h3>
            <b>{money(c.price)}</b>
            <p>{g.holdings[c.id]?.quantity || 0} adet</p>
            <button onClick={() => setSelected(c.id)}>Şirketi aç</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Archive({ g }: { g: State }) {
  return (
    <div className="content timeline">
      <h1>{g.player.name}’in Hayat Arşivi</h1>
      {g.archive
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((x, i) => (
          <article key={i}>
            <i />
            <div>
              <small>
                {date(x.at)} • {x.category}
              </small>
              <p>{x.text}</p>
            </div>
          </article>
        ))}
    </div>
  );
}
function Notes({ g }: { g: State }) {
  const set = useGame((x) => x.setNotes);
  return (
    <div className="content notes">
      <label htmlFor="notes">Kişisel notların</label>
      <textarea
        id="notes"
        value={g.notes}
        onChange={(e) => set(e.target.value)}
        placeholder="Çalışma planı, hedefler, hatırlatmalar…"
      />
      <small>Otomatik olarak yerel kayda eklenir.</small>
    </div>
  );
}
function Settings({ g }: { g: State }) {
  const s = useGame();
  return (
    <div className="content">
      <h1>Ayarlar</h1>
      {(
        [
          ["sound", "Sesler"],
          ["reducedMotion", "Azaltılmış hareket"],
          ["largeText", "Büyük metin"],
        ] as const
      ).map(([k, n]) => (
        <button
          className="setting"
          key={k}
          onClick={() => s.setting(k, !g.settings[k])}
        >
          <span>{n}</span>
          <b>{g.settings[k] ? "Açık" : "Kapalı"}</b>
        </button>
      ))}
      <h3>Duvar kâğıdı</h3>
      <div className="pills">
        {(
          [
            ["city", "Şehir"],
            ["coast", "Sahil"],
            ["simple", "Sade"],
          ] as const
        ).map(([v, n]) => (
          <button
            className={g.settings.wallpaper === v ? "active" : ""}
            onClick={() => s.wallpaper(v)}
            key={v}
          >
            {n}
          </button>
        ))}
      </div>
      <Card>
        <I.ShieldCheck />
        <h3>Gizlilik</h3>
        <p>{tr.privacy}</p>
      </Card>
      <Card>
        <h3>Yerel kayıt</h3>
        <p>
          İçe aktarılan dosya önce sürümlenir ve katı şemayla doğrulanır. Hatalı
          dosya mevcut hayatı değiştirmez.
        </p>
        <button onClick={() => void s.save()}>Şimdi kaydet</button>
        <button onClick={() => void s.exportSave()}>JSON dışa aktar</button>
        <label className="import-button">
          JSON içe aktar
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void s.importSave(f);
            }}
          />
        </label>
      </Card>
    </div>
  );
}
function MapApp({ g }: { g: State }) {
  const s = useGame(),
    target = s.navigationTarget?.app === "map" ? s.navigationTarget : undefined,
    [dest, setDest] = useState(() => target?.place ?? ""),
    [mode, setMode] = useState("Yürü"),
    job = g.employment && g.jobs.find((j) => j.id === g.employment?.jobId),
    company = job && g.companies.find((c) => c.id === job.companyId),
    interview = g.events.find((e) => e.type === "interview" && !e.processed);
  useEffect(() => useGame.getState().clearNavigationTarget(), []);
  const base = [
      ["Ev", I.House],
      ["Okul", I.GraduationCap],
      ["Kafe", I.Coffee],
      ["Market", I.ShoppingBasket],
      ["Hastane", I.Hospital],
    ],
    places: [string, typeof I.House][] = base as [string, typeof I.House][];
  if (company) places.push([company.name, I.BriefcaseBusiness]);
  if (interview) places.push(["Görüşme noktası", I.MapPin]);
  return (
    <div className="content map">
      <p>
        Şu an: <b>{g.location}</b>
      </p>
      <div className="map-canvas">
        {places.map(([n, Icon], i) => (
          <button
            style={{
              left: `${15 + ((i * 17) % 76)}%`,
              top: `${18 + ((i * 21) % 68)}%`,
            }}
            onClick={() => setDest(n)}
            key={n}
          >
            <Icon />
            <span>{n}</span>
          </button>
        ))}
      </div>
      <Card>
        <h3>{dest || "Bir varış noktası seç"}</h3>
        <div className="pills">
          {[
            "Yürü",
            "Otobüs",
            "Minibüs",
            "Taksi",
            ...(g.vehicles.length ? ["Aracım"] : []),
          ].map((m) => (
            <button
              className={mode === m ? "active" : ""}
              key={m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          disabled={!dest || dest === g.location}
          onClick={() => s.travel(dest, mode)}
        >
          Yola çık
        </button>
      </Card>
    </div>
  );
}
function LegacyContent({ app, game }: { app: AppId; game: State }) {
  if (app === "stocks") return <Stocks g={game} />;
  if (app === "archive") return <Archive g={game} />;
  if (app === "notes") return <Notes g={game} />;
  if (app === "settings") return <Settings g={game} />;
  if (app === "map") return <MapApp g={game} />;
  return null;
}
export function LegacyApp({ app, game }: { app: AppId; game: State }) {
  return (
    <AppShell title={appNames[app]} variant="solid">
      <LegacyContent app={app} game={game} />
    </AppShell>
  );
}
