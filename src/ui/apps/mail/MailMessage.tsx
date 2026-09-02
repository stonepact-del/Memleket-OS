import { ArrowUpRight } from "lucide-react";
import type { State } from "../../../core/model";
import { appNames } from "../../appMeta";
import { date, time } from "../../format";
import { useGame } from "../../../store";
export function MailMessage({ mail, onBack }: { mail: State["mails"][number]; onBack: () => void }) {
  return <article className="mail-message"><header><button aria-label="Gelen kutusuna dön" onClick={onBack}>‹</button><span>İLETİ</span></header><div className="mail-letter"><p className="mail-kicker">{mail.read ? "OKUNDU" : "YENİ İLETİ"}</p><h1>{mail.subject}</h1><div className="mail-address"><span aria-hidden="true">{mail.sender.slice(0, 1)}</span><div><strong>{mail.sender}</strong><time dateTime={mail.at}>{date(mail.at)} · {time(mail.at)}</time></div></div><div className="mail-body">{mail.body}</div>{mail.app && <button className="mail-app-link" onClick={() => useGame.getState().open(mail.app!)}>{appNames[mail.app]} uygulamasını aç <ArrowUpRight /></button>}</div></article>;
}
