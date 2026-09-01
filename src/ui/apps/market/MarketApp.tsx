import { Search } from "lucide-react";
import { useState } from "react";
import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { ListingGrid } from "./ListingGrid";
import { ListingDetail } from "./ListingDetail";
import "./market.css";
const cats = ["Tümü", "Vasıta", "Emlak", "Elektronik", "Ev & Yaşam"];
export function MarketApp({ game }: { game: State }) {
  const s = useGame(),
    [cat, setCat] = useState("Tümü"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<string>(),
    listing = game.listings.find((x) => x.id === selected);
  if (listing)
    return (
      <div className="market-native-layout" data-app-identity="market-native">
        <ListingDetail
          listing={listing}
          onBack={() => setSelected(undefined)}
        />
      </div>
    );
  const shown = game.listings.filter(
    (l) =>
      l.status === "active" &&
      (cat === "Tümü" || l.category === cat) &&
      l.title
        .toLocaleLowerCase("tr-TR")
        .includes(query.toLocaleLowerCase("tr-TR")),
  );
  return (
    <main className="market-native-layout" data-app-identity="market-native">
      <header className="market-header">
        <span>
          <i>SP</i>
          <div>
            <small>YEREL PAZAR</small>
            <h1>SarıPazar</h1>
          </div>
        </span>
        <label>
          <Search />
          <span className="sr-only">İlan ara</span>
          <input
            aria-label="İlan ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ne arıyorsun?"
          />
        </label>
      </header>
      <nav className="market-categories" aria-label="İlan kategorileri">
        {cats.map((c) => (
          <button
            className={cat === c ? "active" : ""}
            onClick={() => setCat(c)}
            key={c}
          >
            {c}
          </button>
        ))}
      </nav>
      <ListingGrid
        listings={shown}
        onOpen={setSelected}
        onFavorite={s.toggleFavorite}
      />
    </main>
  );
}
