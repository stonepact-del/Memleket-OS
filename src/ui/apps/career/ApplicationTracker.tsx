import { CalendarClock } from "lucide-react";
import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { date } from "../../format";
const status:Record<string,string>={submitted:"Gönderildi",viewed:"İncelendi",interview:"Görüşme",offer:"Teklif",rejection:"Olumsuz","no response":"Yanıt yok","later stage":"Son değerlendirme",accepted:"Kabul edildi",declined:"Reddedildi",withdrawn:"Geri çekildi"};
export function ApplicationTracker({game,onOpenJob}:{game:State;onOpenJob:(id:string)=>void}){return <section className="application-tracker" aria-labelledby="applications-heading"><div className="career-section-heading"><div><small>SÜREÇ</small><h2 id="applications-heading">Başvurularım</h2></div></div>
  {!game.applications.length?<p className="career-empty">Henüz bir başvurun yok. İlan ayrıntılarından başvurabilirsin.</p>:<ol>{game.applications.map(app=>{const job=game.jobs.find(j=>j.id===app.jobId)!;const company=game.companies.find(c=>c.id===job.companyId)!;return <li key={app.id} className={app.statusUnread?"unread":""}><button onClick={()=>onOpenJob(job.id)}><span className="tracker-dot"/><span><b>{job.position}</b><small>{company.name}</small></span><strong>{status[app.state]}</strong></button>
    {app.interviewAt&&<button className="calendar-link" onClick={()=>{const event=game.events.find(e=>e.type==="interview"&&e.entityIds?.[0]===app.id);useGame.getState().navigate({app:"calendar",eventId:event?.id,date:app.interviewAt?.slice(0,10)})}}><CalendarClock/> {date(app.interviewAt,{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})} · Takvimde aç</button>}
    {app.state==="offer"&&<div className="offer-actions"><p>İş teklifi kararını bekliyor.</p><button onClick={()=>useGame.getState().offerDecision(app.id,true)}>Teklifi kabul et</button><button onClick={()=>useGame.getState().offerDecision(app.id,false)}>Reddet</button></div>}</li>})}</ol>}
  </section>}
