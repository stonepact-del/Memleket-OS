import { jobUnavailable } from '../../../core/life';
import { ArrowLeft, MapPin, BriefcaseBusiness, GraduationCap } from "lucide-react";
import type { Job, State } from "../../../core/model";
import { useGame } from "../../../store";
import { money } from "../../format";
import { companyMark } from "./JobDiscovery";
const labels:Record<string,string>={submitted:"Başvuru gönderildi",viewed:"Başvuru incelendi",interview:"Görüşme planlandı",offer:"Teklif geldi",rejection:"Başvuru sonuçlandı","no response":"Yanıt bekleniyor","later stage":"Değerlendirme sürüyor",accepted:"Teklif kabul edildi",declined:"Teklif reddedildi",withdrawn:"Başvuru geri çekildi"};
export function JobDetail({ game, job, onBack }: { game:State; job:Job; onBack:()=>void }) { const company=game.companies.find(c=>c.id===job.companyId)!;const application=game.applications.find(a=>a.jobId===job.id);
  return <section className="job-detail"><button className="career-back" onClick={onBack}><ArrowLeft/> Fırsatlar</button><div className="job-detail-brand">{companyMark(company.id,company.name)}<div><small>{company.sector}</small><h2>{company.name}</h2></div></div><h1>{job.position}</h1>
    <dl><div><MapPin/><dt>Konum</dt><dd>{job.city}</dd></div><div><BriefcaseBusiness/><dt>Çalışma biçimi</dt><dd>{job.workType}</dd></div><div><GraduationCap/><dt>Eğitim</dt><dd>{job.education}</dd></div></dl>
    <div className="job-salary"><small>AYLIK ÜCRET</small><strong>{money(job.salary)}</strong></div><section><h3>Beklenen beceriler</h3><ul>{job.skills.map(skill=><li key={skill}>{skill}</li>)}</ul></section>
    <button className="apply-action" disabled={!!jobUnavailable(game,job.id)||!!application&&!['rejection','declined','withdrawn','no response'].includes(application.state)} onClick={()=>useGame.getState().apply(job.id)}>{jobUnavailable(game,job.id)??(application ? ["rejection","declined","withdrawn","no response"].includes(application.state)?"Yeniden başvur":labels[application.state] : "Başvur")}</button>
  </section>;
}
