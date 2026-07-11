// Noticias de seguridad (CONTEXTO) — barrido de prensa. Tipográfico: el titular es el
// elemento fuerte (link), fuente + hora en --ink-2 (DESIGN §9). Honestidad de cadencia.
export default function NewsList({ noticias }) {
  if (!noticias?.length) return null
  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <h3 className="font-display text-xl text-ink sm:text-2xl">Noticias de seguridad de hoy</h3>
      <p className="mt-1 text-sm text-ink-2">barrido de prensa · 8:00 a. m.</p>

      <ul className="mt-4 divide-y divide-line">
        {noticias.map((noticia, i) => (
          <li key={i} className="py-3">
            <a
              href={noticia.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-base font-medium text-ink underline-offset-4 hover:text-verisure-deep hover:underline"
            >
              {noticia.titular}
            </a>
            <p className="mt-1 text-xs text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {noticia.fuente} · {noticia.hora}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
