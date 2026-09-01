import { useState } from "react";
import { BookOpen, BatteryMedium } from "lucide-react";
import { useGame } from "../../../store";
import { Sheet } from "../../components/Sheet";
const choices = [[.5, "30 dakika"], [1, "1 saat"], [2, "2 saat"]] as const;
export function StudySheet({ subject, energy, onClose }: { subject: string; energy: number; onClose: () => void }) {
  const [duration, setDuration] = useState<number>(.5);
  return <Sheet label={`${subject} çalışma planı`} onClose={onClose} className="study-sheet">
    <div className="study-sheet-symbol"><BookOpen /></div><small>ÇALIŞMA OTURUMU</small><h2>{subject}</h2>
    <p className="energy-context"><BatteryMedium /> Mevcut enerji <b>%{energy}</b></p>
    <fieldset><legend>Süre seç</legend><div>{choices.map(([value, label]) => <button aria-pressed={duration === value} className={duration === value ? "selected" : ""} key={value} onClick={() => setDuration(value)}>{label}</button>)}</div></fieldset>
    <p>Seçilen süre: <strong>{choices.find(([v]) => v === duration)?.[1]}</strong></p>
    <button className="study-start" onClick={() => { useGame.getState().study(subject, duration); onClose(); }}>Çalışmaya başla</button>
    <button className="study-cancel" onClick={onClose}>Vazgeç</button>
  </Sheet>;
}
