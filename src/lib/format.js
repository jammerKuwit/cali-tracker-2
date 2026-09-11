export function formatDuration(sec) {
  if (sec == null || Number.isNaN(sec)) return '—'
  const s = Math.max(0, Math.round(Number(sec)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m === 0) return `${r}s`
  return `${m}:${String(r).padStart(2, '0')}`
}

export function parseDuration(str) {
  const t = String(str ?? '').trim()
  if (!t) return null
  if (t.includes(':')) {
    const [m, s] = t.split(':')
    const minutes = Number.parseInt(m, 10)
    const seconds = Number.parseInt(s, 10)
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
    return minutes * 60 + seconds
  }
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function durationInputValue(sec) {
  if (sec == null || sec === '') return ''
  const s = Math.max(0, Math.round(Number(sec)))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m === 0) return String(r)
  return `${m}:${String(r).padStart(2, '0')}`
}

export function formatSet(set, type) {
  if (type === 'hold') return formatDuration(set.durationSec)
  if (type === 'weighted') {
    const reps = set.reps ?? '—'
    const weight = set.weight ?? '—'
    return `${reps} × ${weight} lb`
  }
  return `${set.reps ?? '—'} reps`
}

export function formatSetsLine(sets, type) {
  if (!sets?.length) return 'No sets'
  return sets.map((set) => formatSet(set, type)).join('  ·  ')
}

export function emptySet(type) {
  if (type === 'hold') return { reps: null, durationSec: null, weight: null }
  if (type === 'weighted') return { reps: null, durationSec: null, weight: null }
  return { reps: null, durationSec: null, weight: null }
}
