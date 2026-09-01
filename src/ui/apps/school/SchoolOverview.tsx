import type { State } from "../../../core/model";
import { useGame } from "../../../store";
import { ExamSection } from "./ExamSection";
import { SubjectList } from "./SubjectList";

export function SchoolOverview({ game, onStudy }: { game: State; onStudy: (subject: string) => void }) {
  return <>
    <header className="school-masthead">
      <button aria-label="Ana ekrana dön" onClick={() => useGame.getState().open("home")}>‹</button>
      <p>{game.education.grade}. SINIF · ÖĞRENCİ ALANI</p>
      <h1>{game.education.school}</h1>
      <span>Bugünkü çalışma ritmini sakin ve düzenli tut.</span>
    </header>
    <div className="school-paper">
      <ExamSection game={game} />
      <SubjectList knowledge={game.education.knowledge} onStudy={onStudy} />
      <section className="school-results" aria-labelledby="results-heading">
        <h2 id="results-heading">Sonuçlar</h2>
        {!game.education.mockScores.length ? <p>Henüz kayıtlı bir sınav sonucun yok.</p> :
          <ol>{game.education.mockScores.map((score, index) => <li key={index}><span>Sınav {index + 1}</span><strong>{score} puan</strong></li>)}</ol>}
      </section>
    </div>
  </>;
}
