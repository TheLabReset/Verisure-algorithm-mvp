// Render de la CREATIVIDAD real (no la URL cruda): el contrato trae asset={url,kind}
// por pieza/panel/estreno. Aquí se muestra hermoso según el medio:
//   video (TV/OTT/OOH digital) → <video> con controles · audio (radio) → player con onda
//   image (digital/OOH) → <img> object-cover · youtube → miniatura enlazada · link → tarjeta
// Degrada solo (onError) a una ilustración de formato — nunca imagen rota (DESIGN §7).
import { useState } from 'react'
import { Play, AudioLines, ImageIcon, RectangleHorizontal, Smartphone, ExternalLink } from 'lucide-react'

const box = 'relative w-full overflow-hidden rounded-inner'

function youtubeId(url = '') {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

// Ilustración de formato (fallback / kind=link / sin asset). Fondo wash + ícono neutro.
function FormatFallback({ Icon = Play, label, dark = false }) {
  return (
    <div className={`${box} flex aspect-video items-center justify-center`} style={{ background: dark ? 'var(--ink)' : 'var(--wash)' }}>
      <div className="absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--ink-3) 0, var(--ink-3) 1px, transparent 1px, transparent 8px)' }} />
      <Icon size={30} strokeWidth={1.5} style={{ color: dark ? 'var(--ink-3)' : 'var(--ink-3)' }} aria-hidden="true" />
      {label ? <span className="absolute bottom-2 left-2 rounded-pill px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}>{label}</span> : null}
    </div>
  )
}

// Ícono de medio para el fallback (por kind/medio de la pieza).
function iconFor(kind, medio) {
  if (kind === 'audio') return AudioLines
  if (kind === 'image') return medio === 'DIGITAL' ? Smartphone : ImageIcon
  if (medio === 'DIGITAL') return Smartphone
  if (/OOH/.test(medio || '')) return RectangleHorizontal
  return Play
}

export default function AssetView({ asset, medio, label, alt = 'Creatividad', className = '' }) {
  const [broken, setBroken] = useState(false)
  const Icon = iconFor(asset?.kind, medio)

  if (!asset || !asset.url || broken) {
    return <div className={className}><FormatFallback Icon={Icon} label={label} /></div>
  }

  const { url, kind } = asset

  if (kind === 'image') {
    return (
      <div className={className}>
        <div className={`${box} aspect-video`} style={{ background: 'var(--wash)' }}>
          <img src={url} alt={alt} loading="lazy" onError={() => setBroken(true)}
               className="h-full w-full object-cover" style={{ display: 'block' }} />
          {label ? <span className="absolute bottom-2 left-2 rounded-pill px-2 py-0.5 text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--ink) 78%, transparent)', color: 'var(--base)' }}>{label}</span> : null}
        </div>
      </div>
    )
  }

  if (kind === 'video') {
    return (
      <div className={className}>
        <div className={`${box} aspect-video`} style={{ background: 'var(--ink)' }}>
          <video src={url} controls preload="metadata" muted playsInline onError={() => setBroken(true)}
                 className="h-full w-full object-contain" style={{ display: 'block' }}>
          </video>
          {label ? <span className="pointer-events-none absolute left-2 top-2 rounded-pill px-2 py-0.5 text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--ink) 78%, transparent)', color: 'var(--base)' }}>{label}</span> : null}
        </div>
      </div>
    )
  }

  if (kind === 'audio') {
    return (
      <div className={className}>
        <div className={`${box} flex aspect-video flex-col justify-between p-4`} style={{ background: 'var(--ink)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--base)' }}>
            <AudioLines size={18} aria-hidden="true" />
            <span className="text-xs font-medium">{label || 'Spot de radio'}</span>
          </div>
          {/* Onda decorativa (barras) — lectura de "audio" sin librería. */}
          <div className="flex items-end gap-[3px]" aria-hidden="true" style={{ height: 42 }}>
            {[10, 22, 14, 34, 42, 28, 18, 38, 24, 12, 30, 20, 40, 16, 26, 36, 14, 22, 32, 18].map((h, i) => (
              <span key={i} className="flex-1 rounded-pill" style={{ height: h, background: 'color-mix(in srgb, var(--verisure) 70%, var(--base))', opacity: 0.55 }} />
            ))}
          </div>
          <audio src={url} controls preload="none" onError={() => setBroken(true)} className="w-full" style={{ height: 34 }} />
        </div>
      </div>
    )
  }

  // youtube → miniatura enlazada (evita iframe/CSP; abre en pestaña nueva).
  const yt = youtubeId(url)
  if (yt) {
    return (
      <div className={className}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={`${box} block aspect-video`} style={{ background: 'var(--ink)' }} aria-label={`${alt} — ver en YouTube`}>
          <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt={alt} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover" style={{ display: 'block' }} />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill" style={{ background: 'var(--verisure)', color: 'var(--surface)' }}>
              <Play size={22} fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        </a>
      </div>
    )
  }

  // link genérico → tarjeta "ver creativo".
  return (
    <div className={className}>
      <a href={url} target="_blank" rel="noopener noreferrer" className={`${box} flex aspect-video items-center justify-center gap-2`} style={{ background: 'var(--wash)', color: 'var(--ink-2)' }}>
        <ExternalLink size={18} aria-hidden="true" /> <span className="text-sm font-semibold">Ver creativo</span>
      </a>
    </div>
  )
}
