import type { State } from "../../../core/model";
import { date, money } from "../../format";
export function accountPresentation(birthDate: string, now: string) {
  let age =
    new Date(now).getUTCFullYear() - new Date(birthDate).getUTCFullYear();
  const birthday = new Date(birthDate),
    today = new Date(now);
  if (
    today.getUTCMonth() < birthday.getUTCMonth() ||
    (today.getUTCMonth() === birthday.getUTCMonth() &&
      today.getUTCDate() < birthday.getUTCDate())
  )
    age--;
  return age < 18 ? "Genç hesap" : "Vadesiz hesap";
}
export function BankOverview({ game }: { game: State }) {
  const month = game.now.slice(0, 7),
    ledger = game.ledger.filter((x) => x.at.startsWith(month)),
    incoming = ledger
      .filter((x) => x.amount > 0)
      .reduce((a, x) => a + x.amount, 0),
    outgoing = -ledger
      .filter((x) => x.amount < 0)
      .reduce((a, x) => a + x.amount, 0),
    upcoming = game.events
      .filter((e) => !e.processed && (e.type === "bill" || e.type === "salary"))
      .sort((a, b) => a.at.localeCompare(b.at))[0],
    job =
      game.employment && game.jobs.find((j) => j.id === game.employment?.jobId),
    values = game.ledger
      .slice(0, 8)
      .reverse()
      .map((x) => x.balanceAfter),
    min = Math.min(...values, game.balance),
    max = Math.max(...values, game.balance),
    range = Math.max(1, max - min),
    points = values
      .map(
        (v, i) =>
          `${(i / Math.max(1, values.length - 1)) * 300},${74 - ((v - min) / range) * 58}`,
      )
      .join(" ");
  return (
    <>
      <section className="bank-hero">
        <div className="bank-brand">
          <i>CB</i>
          <span>
            <b>CepBanka</b>
            <small>
              {accountPresentation(game.player.birthDate, game.now)} · Kurgusal
              no. {String(game.characterSeed).slice(-4).padStart(4, "0")}
            </small>
          </span>
        </div>
        <small>KULLANILABİLİR BAKİYE</small>
        <h1>{money(game.balance)}</h1>
        <p>{job ? `${job.position} geliri` : "Aile harçlığı hesabı"}</p>
        <svg
          viewBox="0 0 300 84"
          role="img"
          aria-label="Gerçek hesap bakiyesi hareket grafiği"
        >
          <path d="M0 75H300" />
          <polyline points={points || "0,74 300,74"} />
          {values.length === 1 && <circle cx="150" cy="45" r="4" />}
        </svg>
      </section>
      <section className="bank-insights">
        <div>
          <small>YAKLAŞAN</small>
          <b>{upcoming?.title || "Planlı ödeme yok"}</b>
          <span>{upcoming ? date(upcoming.at) : "Takvim temiz"}</span>
        </div>
        <div>
          <small>BU AY GELEN</small>
          <b>{money(incoming)}</b>
          <span>Hesaba giriş</span>
        </div>
        <div>
          <small>BU AY GİDEN</small>
          <b>{money(outgoing)}</b>
          <span>Hesaptan çıkış</span>
        </div>
      </section>
    </>
  );
}
