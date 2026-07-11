// Skeleton con la FORMA real del contenido (DESIGN §7). Usa la clase .skeleton (shimmer).
export default function Skeleton({ className = '', style }) {
  return <div className={`skeleton rounded-inner ${className}`} style={style} aria-hidden="true" />
}
