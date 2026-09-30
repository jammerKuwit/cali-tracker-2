const PREFIX = 'cali-log-draft'

export function draftKey({ date, workoutId }) {
  return workoutId ? `${PREFIX}:edit:${workoutId}` : `${PREFIX}:new:${date}`
}

export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

export function saveDraft(key, { date, notes, selectedDay, entries }) {
  const payload = {
    date,
    notes,
    selectedDay,
    entries: (entries || []).map((entry) => ({
      key: entry.key,
      exerciseId: entry.exerciseId,
      name: entry.name,
      type: entry.type,
      sets: entry.sets,
      mediaUrl: entry.mediaUrl || null,
      mediaType: entry.mediaType || null,
      mediaPath: entry.mediaPath || null,
      removeMedia: Boolean(entry.removeMedia),
    })),
    savedAt: Date.now(),
  }
  localStorage.setItem(key, JSON.stringify(payload))
}

export function clearDraft(key) {
  localStorage.removeItem(key)
}
