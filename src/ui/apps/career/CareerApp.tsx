import { DecisionView } from '../../life/LifeControls';
import { useEffect, useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { JobDiscovery } from "./JobDiscovery";
import { JobDetail } from "./JobDetail";
import { ApplicationTracker } from "./ApplicationTracker";
import { EmploymentView } from "./EmploymentView";
export function CareerApp({ game }: { game: State }) {
  const target = useGame((state) => state.navigationTarget?.app === "career" ? state.navigationTarget : undefined);
  const targetedApplication = target?.applicationId ? game.applications.find(application => application.id === target.applicationId) : undefined;
  const [selected, setSelected] = useState<string | undefined>(() => target?.jobId ?? targetedApplication?.jobId);
  const job = game.jobs.find(j => j.id === selected);
  useEffect(() => {
    useGame.getState().clearCareerUnread();
    useGame.getState().clearNavigationTarget();
  }, []);
  return <AppShell title="Kariyer" variant="hidden"><main className="career-app" data-app-identity="career-native">
    <header className="career-header"><button aria-label="Ana ekrana dön" onClick={() => useGame.getState().open("home")}>‹</button><div><small>{game.employment ? "ÇALIŞMA ALANI" : "FIRSATLAR"}</small><h1>Kariyer</h1></div><span>{game.applications.length}<small>başvuru</small></span></header>
    <>{game.life.decisions.filter(d=>d.status==="pending"&&d.source==="career"&&!["interview","offer"].includes(d.type)).map(d=><DecisionView game={game} decision={d} key={d.id}/>)}</>
    {job ? <JobDetail game={game} job={job} onBack={() => setSelected(undefined)} /> : <div className="career-layout">
      <div>{game.employment ? <EmploymentView game={game} /> : <JobDiscovery game={game} onOpen={setSelected} />}</div>
      <ApplicationTracker game={game} onOpenJob={setSelected} />
      {game.employment && <JobDiscovery game={game} onOpen={setSelected} secondary />}
    </div>}
  </main></AppShell>;
}
