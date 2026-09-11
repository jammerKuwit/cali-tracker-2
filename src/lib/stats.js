export function bestMetric(sets, type) {
  if (!sets?.length) return 0
  if (type === 'hold') {
    return Math.max(0, ...sets.map((s) => Number(s.durationSec) || 0))
  }
  if (type === 'weighted') {
    return Math.max(0, ...sets.map((s) => Number(s.weight) || 0))
  }
  return Math.max(0, ...sets.map((s) => Number(s.reps) || 0))
}

export function metricLabel(type) {
  if (type === 'hold') return 'Longest hold'
  if (type === 'weighted') return 'Heaviest added'
  return 'Best set'
}

export function metricUnit(type) {
  if (type === 'hold') return 'sec'
  if (type === 'weighted') return 'lb'
  return 'reps'
}

export function progressSeries(workouts, exerciseId, type) {
  const byDate = new Map()
  for (const workout of workouts) {
    const entries = (workout.exercises || []).filter(
      (entry) => entry.exerciseId === exerciseId,
    )
    if (!entries.length) continue
    const value = Math.max(...entries.map((entry) => bestMetric(entry.sets, type)))
    const prev = byDate.get(workout.date)
    if (!prev || value > prev.value) {
      byDate.set(workout.date, {
        date: workout.date,
        value,
        workoutId: workout.id,
      })
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function trainedDateSet(workouts) {
  return new Set(workouts.map((w) => w.date))
}

export function firstMedia(workout) {
  const entry = (workout.exercises || []).find((e) => e.mediaUrl)
  if (!entry) return null
  return { url: entry.mediaUrl, type: entry.mediaType }
}
