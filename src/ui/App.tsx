import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Library,
  Play,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useGame } from "../store";
import { provinces, tr } from "../data/content";
import { date } from "./format";
import { Device } from "./os/Device";

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
function Menu() {
  const set = useGame((x) => x.setScreen);
  return (
    <main className="menu">
      <div className="menu-panel">
        <Brand />
        <div className="menu-copy">
          <p>Türkiye’de sıradan bir hayatın olağanüstü ayrıntıları.</p>
          <h1>
            Kendi ritminde
            <br />
            bir hayat yaşa.
          </h1>
        </div>
        <nav>
          <button className="primary" onClick={() => set("new")}>
            <Sparkles /> {tr.menu.newLife}
          </button>
          <button onClick={() => set("lives")}>
            <Library /> {tr.menu.lives}
          </button>
        </nav>
        <small className="local">
          <ShieldCheck /> Tamamen yerel • Hesap yok • İzleme yok
        </small>
      </div>
    </main>
  );
}
function NewLife() {
  const s = useGame(),
    [name, setName] = useState(""),
    [province, setProvince] = useState("İstanbul");
  return (
    <main className="form-page">
      <section>
        <button className="back" onClick={() => s.setScreen("menu")}>
          <ArrowLeft /> Geri
        </button>
        <p className="eyebrow">YENİ BİR BAŞLANGIÇ</p>
        <h1>Hikâyen nerede başlıyor?</h1>
        <p>
          Gerçek bilgi vermene gerek yok. Her ayrıntı cihazında ve tohumdan
          üretilir.
        </p>
        <label>
          Karakter adı{" "}
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Deniz Kaya"
          />
        </label>
        <label>
          Başlangıç ili{" "}
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {provinces.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <button
          className="primary wide"
          onClick={() => void s.newLife(name, province)}
        >
          <Play /> Hayatı başlat
        </button>
      </section>
    </main>
  );
}
function Lives() {
  const s = useGame(),
    refresh = s.refresh;
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <main className="form-page">
      <section className="lives">
        <button className="back" onClick={() => s.setScreen("menu")}>
          <ArrowLeft /> Menü
        </button>
        <h1>Hayatlarım</h1>
        {!s.lives.length && <p>Henüz yerel kayıt yok.</p>}
        {s.lives.map((l) => (
          <article key={l.id}>
            <div>
              <b>{l.name}</b>
              <small>
                {l.province} • {date(l.updatedAt)}
              </small>
            </div>
            <button onClick={() => void s.load(l.id)}>Devam et</button>
            <button
              className="danger"
              aria-label="Sil"
              onClick={() => void s.remove(l.id)}
            >
              <Trash2 />
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
export function App() {
  const s = useGame(),
    refresh = s.refresh,
    load = s.load;
  useEffect(() => {
    void (async () => {
      await refresh();
      const current = useGame.getState();
      if (!current.game && current.lives[0]) await load(current.lives[0].id);
    })();
  }, [refresh, load]);
  if (s.screen === "menu") return <Menu />;
  if (s.screen === "new") return <NewLife />;
  if (s.screen === "lives") return <Lives />;
  return <Device />;
}
