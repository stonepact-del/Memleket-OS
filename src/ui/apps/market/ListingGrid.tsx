import { Heart } from "lucide-react";
import type { Listing } from "../../../core/model";
import { money } from "../../format";
import { ListingThumbnail } from "./ListingThumbnail";
import { EmptyState } from "../../components/EmptyState";
export function ListingGrid({
  listings,
  onOpen,
  onFavorite,
}: {
  listings: Listing[];
  onOpen: (id: string) => void;
  onFavorite: (id: string) => void;
}) {
  if (!listings.length)
    return (
      <EmptyState
        title="Bu filtrede ilan bulunamadı."
        detail="Başka bir kategoriye veya arama sözcüğüne göz at."
      />
    );
  return (
    <div className="market-listing-grid">
      {listings.map((l) => (
        <article key={l.id}>
          <button
            className="listing-open"
            onClick={() => onOpen(l.id)}
            aria-label="İlanı aç"
          >
            <ListingThumbnail listing={l} />
            <span className="listing-condition">%{l.condition} kondisyon</span>
            <div>
              <strong>{money(l.price)}</strong>
              <h3>{l.title}</h3>
              <p>
                {l.category} · {l.seller}
              </p>
            </div>
          </button>
          <button
            className={`market-heart ${l.favorite ? "active" : ""}`}
            onClick={() => onFavorite(l.id)}
            aria-label={l.favorite ? "Favorilerden çıkar" : "Favoriye ekle"}
          >
            <Heart fill={l.favorite ? "currentColor" : "none"} />
          </button>
        </article>
      ))}
    </div>
  );
}
