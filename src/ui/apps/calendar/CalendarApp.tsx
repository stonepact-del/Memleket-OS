import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { MonthView, monthKey } from "./MonthView";
import { AgendaView } from "./AgendaView";
import { EventDetail } from "./EventDetail";
export function CalendarApp({game}:{game:State}){const today=game.now.slice(0,10);const [view,setView]=useState<"month"|"agenda">("month");const [month,setMonth]=useState(monthKey(game.now));const [selectedDate,setSelectedDate]=useState(today);const [eventId,setEventId]=useState<string>();const event=game.events.find(e=>e.id===eventId);
  return <AppShell title="Takvim" variant="hidden"><main className="calendar-app" data-app-identity="calendar-native"><header className="calendar-header"><button aria-label="Ana ekrana dön" onClick={()=>useGame.getState().open("home")}>‹</button><div><small>MEMLEKETOS</small><h1>Takvim</h1></div><nav aria-label="Takvim görünümü"><button aria-pressed={view==="month"} onClick={()=>setView("month")}>Ay</button><button aria-pressed={view==="agenda"} onClick={()=>setView("agenda")}>Ajanda</button></nav></header>
    {event?<EventDetail game={game} event={event} onBack={()=>setEventId(undefined)}/>:view==="month"?<MonthView game={game} viewedMonth={month} selectedDate={selectedDate} onMonth={setMonth} onSelectDate={setSelectedDate} onOpenEvent={setEventId}/>:<AgendaView game={game} onOpen={setEventId}/>}</main></AppShell>}
