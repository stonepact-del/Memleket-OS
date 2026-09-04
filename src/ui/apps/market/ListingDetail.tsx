import { ArrowLeft, Heart, MessageCircle, SearchCheck } from "lucide-react";
import { useState } from "react";
import type { Listing } from "../../../core/model";
import { useGame } from "../../../store";
import { money } from "../../format";
import { ListingThumbnail } from "./ListingThumbnail";
export function ListingDetail({
  listing,
  onBack,
}: {
  listing: Listing;
  onBack: () => void;
}) {
  const s = useGame(),
    [offer, setOffer] = useState(""),
    n = listing.negotiation;
  return (
    <main className="market-detail">
      <header>
        <button onClick={onBack}>
          <ArrowLeft /> İlanlara dön
        </button>
        <button
          onClick={() => s.toggleFavorite(listing.id)}
          aria-label={listing.favorite ? "Favorilerden çıkar" : "Favoriye ekle"}
        >
          <Heart fill={listing.favorite ? "currentColor" : "none"} />
        </button>
      </header>
      <ListingThumbnail listing={listing} large />
      <section className="market-detail-copy">
        <h1>{listing.title}</h1>
        <strong className="market-price">
          {money(n?.agreedPrice ?? listing.price)}
        </strong>
        <section className="market-seller">
          <small>SATICI</small>
          <b>{listing.seller}</b>
        </section>
        <div className="market-key-facts">
          <span>{listing.category}</span>
          <span>%{listing.condition} kondisyon</span>
          <span>Piyasa {money(listing.marketValue)}</span>
        </div>
        <p>{listing.details}</p>
        <div className="market-status" aria-label="İlan işlem durumu">
          {n?.contacted && <span>Satıcıyla konuşuldu</span>}
          {n?.offer && <span>Teklifin: {money(n.offer)}</span>}
          {n?.counterOffer && (
            <span>Karşı teklif: {money(n.counterOffer)}</span>
          )}
          {n?.agreedPrice && <span>Fiyatta anlaşıldı</span>}
          <span>
            İnceleme:{" "}
            {n?.inspected ? n.revealedIssue || "sorun görülmedi" : "yapılmadı"}
          </span>
        </div>
        <div className="market-secondary-actions">
          <button onClick={() => s.contact(listing.id)}>
            <MessageCircle /> Satıcıya sor
          </button>
          <button onClick={() => s.inspect(listing.id)}>
            <SearchCheck /> İncele
          </button>
        </div>
        <form
          className="market-offer"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(offer.replace(",", "."));
            if (Number.isFinite(value) && value > 0)
              s.offer(listing.id, Math.round(value * 100));
            else s.setError("Geçerli bir TL tutarı gir.");
          }}
        >
          <label>
            Teklif (TL)
            <input
              inputMode="decimal"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder={(listing.price / 100).toFixed(0)}
            />
          </label>
          <button>Teklif gönder</button>
        </form>
        {n?.counterOffer && (
          <button
            className="market-counter"
            onClick={() => s.counter(listing.id)}
          >
            Karşı teklifi kabul et ({money(n.counterOffer)})
          </button>
        )}
        <button className="market-buy" onClick={() => s.buy(listing.id)}>
          {n?.agreedPrice
            ? "Anlaşılan fiyata satın al"
            : "İstenen fiyata satın al"}
        </button>
      </section>
    </main>
  );
}
