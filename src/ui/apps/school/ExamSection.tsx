import { CalendarDays } from "lucide-react";
import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { date } from "../../format";
export function ExamSection({ game }: { game: State }) {
  const exam = game.events.filter(e => e.type === "exam" && !e.processed && e.at >= game.now).sort((a,b) => a.at.localeCompare(b.at))[0];
  return <section className="school-today" aria-labelledby="today-heading"><h2 id="today-heading">Bugün</h2>
    {exam ? <button onClick={() => useGame.getState().navigate({app:"calendar",eventId:exam.id,date:exam.at.slice(0,10)})}><CalendarDays /><span><small>YAKLAŞAN SINAV</small><b>{exam.title}</b><time>{date(exam.at, { day: "numeric", month: "long", weekday: "long" })}</time></span><i>Takvimde aç →</i></button> : <p>Yaklaşan bir akademik etkinliğin yok. Kendi ritminde ilerleyebilirsin.</p>}
  </section>;
}
