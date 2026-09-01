import { MapPin } from "lucide-react";
import type { State } from "../../../core/model";
import { money } from "../../format";
export const companyMark = (id: string, name: string) => { const sum = [...id].reduce((a,c) => a + c.charCodeAt(0), 0); return <span className={`company-mark mark-${sum % 4}`} aria-hidden="true">{name.split(" ").map(x => x[0]).join("").slice(0,2)}</span>; };
const status: Record<string,string> = { submitted:"Gönderildi",viewed:"İncelendi",interview:"Görüşme",offer:"Teklif",rejection:"Olumsuz","no response":"Yanıt yok","later stage":"Değerlendirme",accepted:"Kabul edildi",declined:"Reddedildi",withdrawn:"Geri çekildi" };
export function JobDiscovery({ game, onOpen, secondary=false }: { game: State; onOpen:(id:string)=>void; secondary?:boolean }) {
  return <section className="job-discovery" aria-labelledby="jobs-heading"><div className="career-section-heading"><div><small>{secondary ? "KEŞFET" : game.player.province.toLocaleUpperCase("tr-TR")}</small><h2 id="jobs-heading">{secondary ? "Diğer fırsatlar" : "Sana yakın fırsatlar"}</h2></div><b>{game.jobs.length}</b></div>
    <div className="job-rows">{game.jobs.map(job => { const company=game.companies.find(c=>c.id===job.companyId)!; const app=game.applications.find(a=>a.jobId===job.id); return <button key={job.id} onClick={()=>onOpen(job.id)} aria-label={`${company.name}, ${job.position} ilanını aç`}>
      {companyMark(company.id,company.name)}<span className="job-copy"><small>{company.name}</small><strong>{job.position}</strong><span><MapPin/> {job.city} · {job.workType}</span></span><span className="job-pay"><b>{money(job.salary)}</b><small>{app ? status[app.state] : "Başvuruya açık"}</small></span>
    </button>})}</div>
  </section>;
}
