const glyph = (name: string) => {
  const n = name.toLocaleLowerCase("tr-TR");
  if (n.includes("mat")) return "∑";
  if (n.includes("türk")) return "Aa";
  if (n.includes("fen")) return "⚗";
  if (n.includes("sos")) return "⌖";
  if (n.includes("ing")) return "EN";
  return name.slice(0, 2).toLocaleUpperCase("tr-TR");
};
export function SubjectList({ knowledge, onStudy }: { knowledge: Record<string, number>; onStudy: (subject: string) => void }) {
  return <section className="subject-section" aria-labelledby="subjects-heading"><div className="school-section-title"><h2 id="subjects-heading">Dersler</h2><span>{Object.keys(knowledge).length} ders</span></div>
    <ul>{Object.entries(knowledge).map(([name, value]) => <li key={name}>
      <span className="subject-glyph" aria-hidden="true">{glyph(name)}</span>
      <div className="subject-progress"><div><b>{name}</b><span>%{value}</span></div><progress aria-label={`${name} ilerlemesi`} value={value} max="100" /></div>
      <button onClick={() => onStudy(name)} aria-label={`${name} çalış`}>Çalış</button>
    </li>)}</ul>
  </section>;
}
