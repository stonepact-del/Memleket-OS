import type { State } from '../../../core/model';
import { useGame } from '../../../store';
import { ExamSection } from './ExamSection';
import { SubjectList } from './SubjectList';
import { ActionButton, AppDecisions, RoutinePicker } from '../../life/LifeControls';
import { lifeContext } from '../../../core/actions';
import { TurkeyRuleset as rules } from '../../../data/turkeyRuleset';
export function SchoolOverview({game,onStudy}:{game:State;onStudy:(subject:string)=>void}) {
  const l=game.life,p=rules.programs.find(p=>p.id===game.education.program);
  return <><header className="school-masthead"><button aria-label="Ana ekrana dön" onClick={()=>useGame.getState().open('home')}>‹</button><p>{game.education.stage==='highSchool'?`${game.education.grade}. SINIF · ÖĞRENCİ ALANI`:lifeContext(game)}</p><h1>{game.education.school}</h1><span>{l.route==='school'?'Bugünkü çalışma ritmini sakin ve düzenli tut.':'Öğrenmenin tek bir yolu, tek bir yaşı yok.'}</span></header>
    <AppDecisions game={game} source="school"/>
    <div className="school-paper"><ExamSection game={game}/>
      <section className="life-section"><h2>{l.route==='university'?'Dönem defterin':l.route==='vocational'?'Meslek atölyen':'Önündeki yol'}</h2>
        <p>{l.route==='school'?`${game.education.grade}. sınıfı tamamla, YKS’ye hazırlan veya meslek yolunu keşfet. Günlük düzenin okul devamını ve öğrenmeni etkiler.`:l.route==='preparing'?'Başvuru dönemini Takvim’den takip et. TYT, AYT ve YDT hazırlık puanların alan bilgisi, düzen ve sınav günü stresine bağlı.':l.route==='university'?`${p?.name??game.education.school}. Dört derslik tam veya iki derslik hafif dönem seçebilirsin. Her dersin geçme eşiği 50/100.`:l.route==='vocational'?'Bir yıl boyunca uygulama yap. Dengeli veya eğitim odaklı düzenle mesleki yeterlilik kazan; iş odaklı düzende daha uzun sürebilir.':'Yeni bir eğitim hedefi belirleyebilir veya öğrendiklerini geliştirebilirsin.'}</p>
        <dl className="life-facts"><div><dt>Devam</dt><dd>%{Math.round(game.education.attendance)}</dd></div><div><dt>Düzen</dt><dd>%{Math.round(game.education.consistency)}</dd></div>{p&&<><div><dt>Kredi</dt><dd>{game.education.credits} / {p.semesters*30}</dd></div><div><dt>Ortalama</dt><dd>{game.education.gpa.toFixed(2)} / 4</dd></div></>}</dl>
        {l.courses.length>0&&<ul className="course-list">{l.courses.map(c=><li key={c.id}><span>{c.name}<small>{c.credits} kredi</small></span><strong>{c.score?`${c.score} · ${c.passed?'Geçti':'Tekrar'}`:'Dönem sürüyor'}</strong></li>)}</ul>}
        <RoutinePicker game={game}/>
        {l.yks.attempts>0&&<p>Son YKS · {l.yks.resultYear}<br/>TYT {l.yks.tyt} · AYT {l.yks.ayt} · YDT {l.yks.ydt} /100</p>}
        <div className="life-actions">{l.route==='working'&&<ActionButton game={game} id="return-education"/>}{l.route==='university'&&<><ActionButton game={game} id="transfer-program"/><ActionButton game={game} id="leave-education"/></>}</div>
        <p className="scenario-note">{rules.label}</p>
      </section>
      <SubjectList knowledge={game.education.knowledge} onStudy={onStudy}/>
      <section className="school-results" aria-labelledby="results-heading"><h2 id="results-heading">Sonuçlar</h2>{!game.education.mockScores.length?<p>Henüz kayıtlı bir sınav sonucun yok.</p>:<ol>{game.education.mockScores.map((score,index)=><li key={index}><span>Sınav {index+1}</span><strong>{score} puan</strong></li>)}</ol>}</section>
    </div></>;
}
