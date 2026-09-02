import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { MailInbox } from "./MailInbox";
import { MailMessage } from "./MailMessage";
import "./mail.css";

export function MailApp({ game }: { game: State }) {
  const [activeId, setActiveId] = useState<string>();
  const active = game.mails.find((mail) => mail.id === activeId);
  const readMail = useGame((state) => state.readMail);
  return <AppShell title="Posta" variant="hidden"><main className={`mail-app ${active ? "message-open" : ""}`} data-app-identity="mail-native">
    <MailInbox game={game} activeId={activeId} onOpen={(id) => { readMail(id); setActiveId(id); }} />
    {active ? <MailMessage mail={active} onBack={() => setActiveId(undefined)} /> : <div className="mail-reading-placeholder" aria-hidden="true"><span>✉</span><p>Okumak için bir ileti seç.</p></div>}
  </main></AppShell>;
}
