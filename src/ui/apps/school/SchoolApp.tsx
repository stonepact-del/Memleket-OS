import { useState } from "react";
import type { State } from "../../../core/model";
import { AppShell } from "../../os/AppShell";
import { SchoolOverview } from "./SchoolOverview";
import { StudySheet } from "./StudySheet";

export function SchoolApp({ game }: { game: State }) {
  const [subject, setSubject] = useState<string>();
  return <AppShell title="Okulum" variant="hidden">
    <main className="school-app" data-app-identity="school-native">
      <SchoolOverview game={game} onStudy={setSubject} />
      {subject && <StudySheet subject={subject} energy={game.player.energy} onClose={() => setSubject(undefined)} />}
    </main>
  </AppShell>;
}
