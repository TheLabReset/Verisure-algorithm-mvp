// La carita de MAIA (DESIGN §6.1): squircle --ink con dos ojos ovalados blancos y
// un aura MUY sutil en --verisure-tint (único halo del sistema; nunca multicolor).
// Estados expresivos por CSS: reposo (parpadeo ~6s) · pensando (ojos oscilan) ·
// alerta (aura roja suave). Respeta prefers-reduced-motion (ojos quietos, sin pulso).
const STATES = { reposo: 'maia-reposo', pensando: 'maia-pensando', alerta: 'maia-alerta' }

export default function MaiaFace({ state = 'reposo', size = 40, className = '', title = 'MAIA' }) {
  const cls = STATES[state] || STATES.reposo
  return (
    <span
      className={`maia-face ${cls} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`MAIA (${state})`}
      title={title}
    >
      <span className="maia-eye maia-eye-l" />
      <span className="maia-eye maia-eye-r" />
    </span>
  )
}
