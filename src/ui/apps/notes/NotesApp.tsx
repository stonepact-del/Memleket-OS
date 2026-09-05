import { BookOpen, Check, PenLine } from "lucide-react";
import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { date } from "../../format";
import { AppShell } from "../../os/AppShell";
export function NotesApp({game}:{game:State}){const setNotes=useGame(x=>x.setNotes);return <AppShell title="Notlar" variant="hidden"><main className="notes-app" data-app-identity="notes-native"><header><button aria-label="Ana ekrana dön" onClick={()=>useGame.getState().open("home")}>‹</button><BookOpen/><div><small>KİŞİSEL DEFTER</small><h1>Bugünün sayfası</h1></div><span><Check/> Kişisel notlar</span></header><section className="notebook"><div className="notebook-meta"><span>{date(game.now,{weekday:"long",day:"numeric",month:"long"})}</span><PenLine aria-hidden="true"/></div><label htmlFor="personal-notes">Kişisel notların</label><textarea id="personal-notes" value={game.notes} onChange={event=>setNotes(event.target.value)} placeholder="Aklında kalanları, çalışma planını ya da yarın için küçük bir hatırlatmayı buraya yaz…"/><footer>MemleketOS · yalnızca bu cihazda</footer></section></main></AppShell>}
