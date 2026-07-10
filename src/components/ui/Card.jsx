// Card — primitiva base de superficie (DESIGN §4).
// Sin borde: la separación es el aire sobre --base. Sombra mínima o ninguna.
// variant="anchor" => card oscura ancla (--ink), UNA por vista máximo (DESIGN §4/§6).

export default function Card({ variant = 'surface', as: Tag = 'section', className = '', children, ...rest }) {
  const base = 'rounded-card p-5 sm:p-6'
  const skin =
    variant === 'anchor'
      ? 'bg-ink text-base'
      : 'bg-surface text-ink shadow-card'
  return (
    <Tag className={`${base} ${skin} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
