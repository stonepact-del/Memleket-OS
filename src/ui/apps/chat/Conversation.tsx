import { ActionButton, DecisionView } from '../../life/LifeControls';
import { useGame } from '../../../store';
import { Info, Send } from "lucide-react";
import { useState } from "react";
import type { Message, NPC } from "../../../core/model";
import { time } from "../../format";
import { ContactAvatar } from "./ContactAvatar";
export function relationshipLabel(n: NPC) {
  const role = n.role.toLocaleLowerCase("tr-TR");
  if (/anne|baba|ebeveyn|veli|koruyucu/.test(role)) return "Ailen";
  if (/sınıf/.test(role)) return "Sınıf arkadaşın";
  if (/arkadaş/.test(role))
    return n.closeness === "close" ? "Yakın arkadaş" : "Arkadaşın";
  return n.closeness === "relevant"
    ? "Hayatında önemli biri"
    : "Tanıdığın biri";
}
const dayKey = (at: string) => at.slice(0, 10);
const dayLabel = (at: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date(at));
export function Conversation({
  npc,
  messages,
  onSend,
  onBack,
}: {
  npc: NPC;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
}) {
  const game=useGame(s=>s.game)!;
  const [text, setText] = useState(""),
    [info, setInfo] = useState(false);
  return (
    <section className="conversation">
      <header>
        <button
          className="conversation-back"
          onClick={onBack}
          aria-label="Konuşmalara dön"
        >
          ‹
        </button>
        <ContactAvatar npc={npc} small />
        <div>
          <b>{npc.name}</b>
          <small>{npc.role}</small>
        </div>
        <button aria-label="Kişi bilgisi" onClick={() => setInfo((v) => !v)}>
          <Info />
        </button>
      </header>
      {info && (
        <aside className="contact-context">
          <strong>{relationshipLabel(npc)}</strong><span>{npc.age} yaş · {npc.occupation} · {npc.lifeStage}</span><ActionButton game={game} id="social" target={npc.id}/>
          <span>
            {npc.relationship.tension > 45
              ? "Biraz mesafeli görünüyorsunuz."
              : npc.relationship.warmth > 65
                ? "Son zamanlarda aranız iyi."
                : "Birbirinizi tanımaya devam ediyorsunuz."}
          </span>
        </aside>
      )}
      <div className="bubbles" aria-live="polite">{game.life.decisions.filter(d=>d.status==="pending"&&d.source==="chat"&&d.relatedEntities.includes(npc.id)).map(d=><DecisionView key={d.id} game={game} decision={d}/>)}
        {messages.length === 0 && (
          <p className="chat-empty">Henüz konuşma yok.</p>
        )}
        {messages.map((m, i) => (
          <div
            className={`message ${m.fromPlayer ? "mine" : "theirs"}`}
            key={m.id}
          >
            {(i === 0 || dayKey(messages[i - 1].at) !== dayKey(m.at)) && (
              <time className="date-separator">{dayLabel(m.at)}</time>
            )}
            <p>{m.text}</p>
            <small>{time(m.at)}</small>
          </div>
        ))}
      </div>
      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) {
            onSend(text.trim());
            setText("");
          }
        }}
      >
        <label>
          <span className="sr-only">Mesaj</span>
          <input
            aria-label="Mesaj"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bir mesaj yaz…"
            maxLength={2000}
          />
        </label>
        <button aria-label="Gönder">
          <Send />
        </button>
      </form>
    </section>
  );
}
