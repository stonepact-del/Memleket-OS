import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { useGame } from "../../../store";
import { JobDiscovery } from "./JobDiscovery";
import { JobDetail } from "./JobDetail";
import { ApplicationTracker } from "./ApplicationTracker";
import { EmploymentView } from "./EmploymentView";
export function CareerApp({ game }: { game: State }) {
  const [selected, setSelected] = useState<string>();
  const job = game.jobs.find(j => j.id === selected);
  return <AppShell title="Kariyer" variant="hidden"><main className="career-app" data-app-identity="career-native">
    <header className="career-header"><button aria-label="Ana ekrana dön" onClick={() => useGame.getState().open("home")}>‹</button><div><small>{game.employment ? "ÇALIŞMA ALANI" : "FIRSATLAR"}</small><h1>Kariyer</h1></div><span>{game.applications.length}<small>başvuru</small></span></header>
    {job ? <JobDetail game={game} job={job} onBack={() => setSelected(undefined)} /> : <div className="career-layout">
      <div>{game.employment ? <EmploymentView game={game} /> : <JobDiscovery game={game} onOpen={setSelected} />}</div>
      <ApplicationTracker game={game} onOpenJob={setSelected} />
      {game.employment && <JobDiscovery game={game} onOpen={setSelected} secondary />}
    </div>}
  </main></AppShell>;
}
