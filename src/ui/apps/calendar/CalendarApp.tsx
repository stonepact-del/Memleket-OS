import { useEffect, useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { MonthView, monthKey } from "./MonthView";
import { AgendaView } from "./AgendaView";
import { EventDetail } from "./EventDetail";
export function CalendarApp({game}:{game:State}){const target=useGame(state=>state.navigationTarget?.app==="calendar"?state.navigationTarget:undefined);const targetEvent=target?.eventId?game.events.find(event=>event.id===target.eventId):undefined;const today=game.now.slice(0,10);const targetDate=targetEvent?.at.slice(0,10)??target?.date;const [view,setView]=useState<"month"|"agenda">("month");const [month,setMonth]=useState(()=>targetDate?monthKey(targetDate):monthKey(game.now));const [selectedDate,setSelectedDate]=useState(()=>targetDate??today);const [eventId,setEventId]=useState<string|undefined>(()=>targetEvent?.id);const event=game.events.find(e=>e.id===eventId);useEffect(()=>useGame.getState().clearNavigationTarget(),[]);
  return <AppShell title="Takvim" variant="hidden"><main className="calendar-app" data-app-identity="calendar-native"><header className="calendar-header"><button aria-label="Ana ekrana dön" onClick={()=>useGame.getState().open("home")}>‹</button><div><small>MEMLEKETOS</small><h1>Takvim</h1></div><nav aria-label="Takvim görünümü"><button aria-pressed={view==="month"} onClick={()=>setView("month")}>Ay</button><button aria-pressed={view==="agenda"} onClick={()=>setView("agenda")}>Ajanda</button></nav></header>
    {event?<EventDetail game={game} event={event} onBack={()=>setEventId(undefined)}/>:view==="month"?<MonthView game={game} viewedMonth={month} selectedDate={selectedDate} onMonth={setMonth} onSelectDate={setSelectedDate} onOpenEvent={setEventId}/>:<AgendaView game={game} onOpen={setEventId}/>}</main></AppShell>}
