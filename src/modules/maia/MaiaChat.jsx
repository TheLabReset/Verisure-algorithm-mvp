// Chat de MAIA — conversación sobre la data del día. En modo demostración responde
// desde los hechos derivados (motor puro `maiaAnswer`), sin latencia artificial
// (DESIGN §7). Con VITE_MAIA_CHAT='live' delega en una Netlify Function que proxea
// la API de Anthropic (la key vive en el servidor, nunca en el bundle) y muestra el
// estado "pensando" mientras responde; si falla, cae al motor local.
import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import MaiaFace from './MaiaFace'
import { SUGGESTED, maiaAnswer } from './maiaChat'
import { fmtDayFull } from '../radar/dateLabels'

const LIVE = import.meta.env.VITE_MAIA_CHAT === 'live'

export default function MaiaChat({ facts = {} }) {
  const day = facts.day
  const [log, setLog] = useState(() => [
    {
      role: 'maia',
      text: `Buenos días. Ya leí las fuentes de hoy${day ? ` (${fmtDayFull(day)})` : ''}. Pregúntame por la inversión del día, las piezas nuevas, el SOI o el Score.`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [log, thinking])

  async function ask(raw) {
    const question = (raw ?? '').trim()
    if (!question || thinking) return
    setInput('')
    setLog((l) => [...l, { role: 'user', text: question }])

    if (LIVE) {
      setThinking(true)
      try {
        const res = await fetch('/api/maia', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ question, day }),
        })
        if (!res.ok) throw new Error('maia proxy error')
        const data = await res.json()
        setLog((l) => [...l, { role: 'maia', text: data.answer }])
      } catch {
        setLog((l) => [...l, { role: 'maia', text: maiaAnswer(question, facts).text }])
      } finally {
        setThinking(false)
      }
    } else {
      // Modo demostración: respuesta inmediata desde la data (sin latencia artificial).
      setLog((l) => [...l, { role: 'maia', text: maiaAnswer(question, facts).text }])
    }
  }

  return (
    <section className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-3">
        <MaiaFace state={thinking ? 'pensando' : 'reposo'} size={36} />
        <div>
          <h3 className="font-display text-xl text-ink sm:text-2xl">Pregúntale a MAIA</h3>
          <p className="text-sm text-ink-2">Sobre la data de hoy · inversión, piezas, SOI, Score, DIY</p>
        </div>
      </div>

      <div className="mt-4 space-y-3" role="log" aria-live="polite" aria-label="Conversación con MAIA">
        {log.map((m, i) =>
          m.role === 'maia' ? (
            <div key={i} className="flex items-start gap-2">
              <MaiaFace state="reposo" size={26} className="mt-0.5" />
              <p className="max-w-[46ch] rounded-inner px-3 py-2 text-sm text-ink" style={{ background: 'var(--wash)' }}>
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[46ch] rounded-inner border border-line px-3 py-2 text-sm text-ink">{m.text}</p>
            </div>
          ),
        )}
        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-ink-2">
            <MaiaFace state="pensando" size={26} /> MAIA está leyendo la data…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="min-h-[44px] rounded-pill border border-line px-3.5 text-xs text-ink-2 transition-colors hover:bg-wash hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale a MAIA sobre el mercado…"
          aria-label="Escribe tu pregunta para MAIA"
          className="min-h-[44px] flex-1 rounded-pill border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3"
        />
        <button
          type="submit"
          aria-label="Enviar pregunta"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-surface"
          style={{ background: 'var(--verisure)' }}
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      </form>

      <p className="mt-3 text-xs text-ink-2">
        Modo demostración: MAIA responde desde la data derivada del día. La conversación abierta con LLM se activa al configurar la API.
      </p>
    </section>
  )
}
