import type { State } from '../../core/model';
import type { Decision, Routine } from '../../core/lifeModel';
import { actionPreview } from '../../core/actions';
import { optionUnavailable } from '../../core/life';
import { routines } from '../../data/turkeyRuleset';
import { useGame } from '../../store';
import { date, money } from '../format';

export function ActionButton({game,id,target}:{game:State;id:string;target?:string}) {
  const preview=actionPreview(game,{id,target});
  return <div className="life-action"><button disabled={!!preview.whyUnavailable} onClick={()=>useGame.getState().action({id,target})}>{preview.label}<span>{preview.minutes?`${preview.minutes} dk`:'Anında'}{preview.cost?` · ${money(preview.cost)}`:''}</span></button><small>{preview.whyUnavailable??preview.description}</small></div>;
}
export function DecisionView({game,decision}:{game:State;decision:Decision}) {
  return <section className="life-decision" aria-label={decision.title}>
    <p className="decision-kicker">{decision.blocking?'ZAMAN SENİ BEKLİYOR':'BİR DAVETİN VAR'} · {date(decision.createdAt)}</p>
    <h2>{decision.title}</h2><p>{decision.description}</p>
    {decision.deadline&&<small>Yanıt süresi: {date(decision.deadline)}</small>}
    <div className="decision-options">{decision.options.map(o=>{const reason=optionUnavailable(game,decision,o);return <div key={o.id}><button disabled={!!reason} onClick={()=>useGame.getState().decide(decision.id,o.id)}><strong>{o.label}</strong><span>{o.description}</span><small>{o.timeMinutes?`${o.timeMinutes} dakika`:'Zaman harcamaz'} · {o.moneyCost?money(o.moneyCost):'Ücretsiz'}</small>{o.delayed.map((f,i)=><em key={i}>{f.days} gün sonra: {f.title}</em>)}</button>{reason&&<small className="unavailable-reason">{reason}</small>}</div>})}</div>
  </section>;
}
export function AppDecisions({game,source}:{game:State;source:Decision['source']}) {
  return <>{game.life.decisions.filter(d=>d.status==='pending'&&d.source===source).map(d=><DecisionView key={d.id} game={game} decision={d}/>)}</>;
}
export function RoutinePicker({game}:{game:State}) {
  return <section className="routine-picker"><label htmlFor="routine">Günlük düzenin</label><select id="routine" value={game.life.routine} disabled={game.life.status==='ended'} onChange={e=>useGame.getState().routine(e.target.value as Routine)}>{Object.entries(routines).map(([key,r])=><option value={key} key={key}>{r.label}</option>)}</select><p>{routines[game.life.routine].description}</p><small>Zaman ilerlerken bu düzeni izlersin. Önemli kararlar akışı durdurur.</small></section>;
}
