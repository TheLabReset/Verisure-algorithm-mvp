// Pill de callout (DESIGN §5): fondo --ink, texto claro, radio 999px.
// Para etiquetar valores directo sobre el dato (no leyendas lejanas).
export default function Pill({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ background: 'var(--ink)', color: 'var(--surface)', fontVariantNumeric: 'tabular-nums' }}
    >
      {children}
    </span>
  )
}
