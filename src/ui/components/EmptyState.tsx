export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <section className="empty-state">
      <i aria-hidden="true" />
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
    </section>
  );
}
