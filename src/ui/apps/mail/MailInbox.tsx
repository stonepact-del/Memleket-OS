import { Paperclip } from "lucide-react";
import type { State } from "../../../core/model";
import { appNames } from "../../appMeta";
import { date, time } from "../../format";
import { useGame } from "../../../store";
export function MailInbox({ game, activeId, onOpen }: { game: State; activeId?: string; onOpen: (id: string) => void }) {
  const unread = game.mails.filter((mail) => !mail.read).length;
  return <section className="mail-inbox" aria-label="Gelen kutusu"><header><button aria-label="Ana ekrana dön" onClick={() => useGame.getState().open("home")}>‹</button><div><small>POSTA</small><h1>Gelen kutusu</h1></div><b aria-label={`${unread} okunmamış ileti`}>{unread}</b></header>
    {game.mails.length ? <div className="mail-rows">{game.mails.map((mail) => <button key={mail.id} className={`${mail.read ? "is-read" : "is-unread"} ${activeId === mail.id ? "active" : ""}`} aria-label={`${mail.read ? "Okunmuş" : "Okunmamış"}: ${mail.sender}, ${mail.subject}`} onClick={() => onOpen(mail.id)}><i aria-hidden="true" /><div className="mail-copy"><span><strong>{mail.sender}</strong><time dateTime={mail.at}>{mail.at.slice(0, 10) === game.now.slice(0, 10) ? time(mail.at) : date(mail.at, { day: "numeric", month: "short" })}</time></span><b>{mail.subject}</b><p>{mail.body}</p></div>{mail.app && <span className="mail-source"><Paperclip />{appNames[mail.app]}</span>}</button>)}</div> : <div className="mail-empty"><span aria-hidden="true">✓</span><h2>Gelen kutun boş</h2><p>Yeni bir ileti geldiğinde burada görünecek.</p></div>}
  </section>;
}
