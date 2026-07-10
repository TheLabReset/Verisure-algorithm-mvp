// EmptyState — estado vacío diseñado (DESIGN §7): mensaje útil + contexto.
// En Fase 0 los módulos aún no tienen datos; el mensaje es honesto sobre ello.
export default function EmptyState({ title, note }) {
  return (
    <div className="rounded-card bg-surface px-6 py-16 text-center shadow-card">
      <p className="font-display text-xl text-ink">{title}</p>
      {note ? <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">{note}</p> : null}
    </div>
  )
}
