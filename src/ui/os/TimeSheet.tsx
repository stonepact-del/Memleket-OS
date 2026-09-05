import { SkipForward, X } from 'lucide-react';
import type { State } from '../../core/model';
import { nextImportantEvent, pendingDecision } from '../../core/actions';
import { useGame } from '../../store';
import { date } from '../format';
import { Sheet } from '../components/Sheet';
import { ActionButton, DecisionView, RoutinePicker } from '../life/LifeControls';
export function TimeSheet({game,close}:{game:State;close:()=>void}) {
  const s=useGame(),next=nextImportantEvent(game),pending=pendingDecision(game);
  const move=(days:number)=>{s.advance(days);close();};
  return <Sheet label="Zaman akışı" onClose={close} className="time-sheet"><header><div><small>HAYAT SENİN RİTMİNDE</small><h2>Bugünden sonrasına</h2></div><button onClick={close} aria-label="Kapat"><X/></button></header>
    {game.life.status==='ended'?<p>Bu hayatın hikâyesi tamamlandı. Hayat Arşivi’nden hatıralarına bakabilirsin.</p>:pending?<DecisionView game={game} decision={pending}/>:<>
      <RoutinePicker game={game}/><div className="speed-row">{[[1/24,'1 saat'],[1,'1 gün'],[4,'4 gün'],[12,'12 gün'],[30,'30 gün'],[90,'90 gün']].map(([d,label])=><button key={label} onClick={()=>move(Number(d))}><b>{label}</b><span>Düzenini sürdür</span></button>)}</div>
      <button className="next-event" onClick={()=>move(next?Math.max(0,(Date.parse(next.at)-Date.parse(game.now))/864e5):1)}><SkipForward/><span><b>Sonraki önemli olay</b><small>{next?.title??'Yarın'}{next?` · ${date(next.at)}`:''}</small></span></button>
      <div className="life-actions"><ActionButton game={game} id="rest"/><ActionButton game={game} id="walk"/><ActionButton game={game} id="project"/></div>
      <p>Telefon kapalıyken hayat ilerlemez. Seçtiğin düzen; okulunu, işini ve yakınlarına ayırdığın zamanı etkiler.</p>
    </>}
    <footer>{date(game.now,{dateStyle:'long',timeStyle:'short'})}</footer></Sheet>;
}
