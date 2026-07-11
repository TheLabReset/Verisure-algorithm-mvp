// Banner honesto por fuente (DESIGN §7 "fuente caída"), color --caution.
// No decorativo: solo aparece cuando una fuente no respondió.
import { AlertTriangle } from 'lucide-react'

export default function Banner({ message }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-inner border-l-4 px-4 py-3 text-sm"
      style={{ background: 'var(--wash)', color: 'var(--caution)', borderColor: 'var(--caution)' }}
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
