import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { durationInputValue, emptySet, parseDuration } from '../lib/format'
import { DAY_TEMPLATES, DAY_LABEL } from '../lib/constants'
import { useData } from '../context/data'
import { createWorkout, updateWorkout } from '../services/workouts'
import { deleteMedia, uploadMedia } from '../services/media'
import ExercisePicker from './ExercisePicker'
import MediaThumb from './MediaThumb'

function newEntry(exercise) {
  return {
    key: crypto.randomUUID(),
    exerciseId: exercise.id,
    name: exercise.name,
    type: exercise.type,
    sets: [emptySet(exercise.type)],
    mediaUrl: null,
    mediaType: null,
    mediaPath: null,
    file: null,
    previewUrl: null,
    removeMedia: false,
  }
}

function fromWorkout(workout) {
  return {
    date: workout.date,
    notes: workout.notes || '',
    entries: (workout.exercises || []).map((entry) => ({
      key: crypto.randomUUID(),
      exerciseId: entry.exerciseId,
      name: entry.name,
      type: entry.type,
      sets: entry.sets?.length ? entry.sets.map((s) => ({ ...s })) : [emptySet(entry.type)],
      mediaUrl: entry.mediaUrl || null,
      mediaType: entry.mediaType || null,
      mediaPath: entry.mediaPath || null,
      file: null,
      previewUrl: null,
      removeMedia: false,
    })),
  }
}

function serializeSets(sets, type) {
  return sets
    .map((set) => {
      if (type === 'hold') {
        const durationSec = Number(set.durationSec)
        if (!durationSec) return null
        return { reps: null, durationSec, weight: null }
      }
      if (type === 'weighted') {
        const reps = Number(set.reps)
        const weight = Number(set.weight)
        if (!reps && !weight) return null
        return {
          reps: Number.isFinite(reps) ? reps : null,
          durationSec: null,
          weight: Number.isFinite(weight) ? weight : null,
        }
      }
      const reps = Number(set.reps)
      if (!reps) return null
      return { reps, durationSec: null, weight: null }
    })
    .filter(Boolean)
}

function mediaFields(exerciseLogs) {
  const media = exerciseLogs.find((e) => e.mediaUrl)
  const image = exerciseLogs.find((e) => e.mediaUrl && e.mediaType === 'image')
  return {
    hasMedia: Boolean(media),
    thumbnailUrl: image?.mediaUrl || null,
  }
}

function entriesHaveData(entries) {
  return entries.some((entry) =>
    (entry.sets || []).some(
      (set) => set.reps || set.durationSec || set.weight || set.durationInput,
    ),
  )
}

export default function WorkoutForm({ exercises, initialDate, existing, initialDay }) {
  const navigate = useNavigate()
  const { templates } = useData()
  const [date, setDate] = useState(existing?.date || initialDate)
  const [notes, setNotes] = useState(existing?.notes || '')
  const [entries, setEntries] = useState(() =>
    existing ? fromWorkout(existing).entries : [],
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(existing?.day || null)
  const entriesRef = useRef(entries)
  const autoApplied = useRef(Boolean(existing))

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  useEffect(() => {
    return () => {
      entriesRef.current.forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      })
    }
  }, [])

  const activeExercises = useMemo(
    () => exercises.filter((ex) => !ex.archived),
    [exercises],
  )

  function applyDay(dayId, { force = false } = {}) {
    const tpl = templates.find((t) => t.id === dayId)
    const ids = tpl?.exerciseIds || []
    if (!ids.length) return false
    if (!force && entriesHaveData(entries)) {
      const ok = window.confirm('Replace the exercises on this log with this day?')
      if (!ok) return false
    }
    entries.forEach((entry) => {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl)
    })
    const byId = Object.fromEntries(exercises.map((ex) => [ex.id, ex]))
    const next = ids.map((id) => byId[id]).filter(Boolean).map((ex) => newEntry(ex))
    setEntries(next)
    setSelectedDay(dayId)
    return true
  }

  useEffect(() => {
    if (existing || autoApplied.current || !initialDay) return
    const tpl = templates.find((t) => t.id === initialDay)
    if (!tpl) return
    autoApplied.current = true
    setSelectedDay(initialDay)
    const ids = tpl.exerciseIds || []
    if (!ids.length) return
    const byId = Object.fromEntries(exercises.map((ex) => [ex.id, ex]))
    setEntries(ids.map((id) => byId[id]).filter(Boolean).map((ex) => newEntry(ex)))
  }, [existing, initialDay, templates, exercises])

  function addExercise(ex) {
    setEntries((prev) => [...prev, newEntry(ex)])
    setPickerOpen(false)
  }

  function updateEntry(key, patch) {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)))
  }

  function removeEntry(key) {
    setEntries((prev) => {
      const found = prev.find((e) => e.key === key)
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl)
      return prev.filter((e) => e.key !== key)
    })
  }

  function updateSet(key, index, patch) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e
        const sets = e.sets.map((s, i) => (i === index ? { ...s, ...patch } : s))
        return { ...e, sets }
      }),
    )
  }

  function addSet(key, type) {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, sets: [...e.sets, emptySet(type)] } : e)),
    )
  }

  function removeSet(key, index) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e
        const sets = e.sets.filter((_, i) => i !== index)
        return { ...e, sets: sets.length ? sets : [emptySet(e.type)] }
      }),
    )
  }

  function onFile(key, file) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.key !== key) return e
        if (e.previewUrl) URL.revokeObjectURL(e.previewUrl)
        return {
          ...e,
          file,
          previewUrl: file ? URL.createObjectURL(file) : null,
          removeMedia: false,
        }
      }),
    )
  }

  async function handleSave() {
    setError(null)
    const prepared = entries
      .map((entry) => ({
        ...entry,
        sets: serializeSets(entry.sets, entry.type),
      }))
      .filter((entry) => entry.sets.length)

    if (!prepared.length) {
      setError('Add at least one set before saving.')
      return
    }

    setSaving(true)
    try {
      const payloadExercises = prepared.map((entry) => ({
        exerciseId: entry.exerciseId,
        name: entry.name,
        type: entry.type,
        sets: entry.sets,
        mediaUrl: entry.removeMedia ? null : entry.mediaUrl,
        mediaType: entry.removeMedia ? null : entry.mediaType,
        mediaPath: entry.removeMedia ? null : entry.mediaPath,
      }))

      const base = {
        date,
        notes: notes.trim(),
        day: selectedDay || null,
        exercises: payloadExercises,
        ...mediaFields(payloadExercises),
      }

      const id = existing?.id || (await createWorkout(base))
      if (existing?.id) await updateWorkout(existing.id, base)

      const nextExercises = [...payloadExercises]
      const toDelete = []

      for (let i = 0; i < prepared.length; i += 1) {
        const entry = prepared[i]
        if (entry.removeMedia && entry.mediaPath) toDelete.push(entry.mediaPath)
        if (!entry.file) continue
        if (entry.mediaPath) toDelete.push(entry.mediaPath)
        const uploaded = await uploadMedia(id, i, entry.file)
        nextExercises[i] = {
          ...nextExercises[i],
          mediaUrl: uploaded.url,
          mediaType: uploaded.mediaType,
          mediaPath: uploaded.path,
        }
      }

      await Promise.all(toDelete.map((path) => deleteMedia(path)))

      await updateWorkout(id, {
        exercises: nextExercises,
        ...mediaFields(nextExercises),
      })

      navigate(`/workout/${id}`)
    } catch (err) {
      setError(err.message || 'Could not save workout')
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{existing ? 'Edit session' : 'Log session'}</h1>
      </div>

      <label className="field">
        <span>Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {existing ? null : (
        <>
          <div className="library-row" style={{ marginBottom: 10 }}>
            <span className="field-label">Day type</span>
            <Link to="/templates" className="tiny">
              Edit my days
            </Link>
          </div>
          <div className="day-picks">
            {DAY_TEMPLATES.map((day) => {
              const tpl = templates.find((t) => t.id === day.id)
              const count = tpl?.exerciseIds?.length || 0
              return (
                <button
                  type="button"
                  key={day.id}
                  className={`day-pick${selectedDay === day.id ? ' on' : ''}`}
                  onClick={() => {
                    if (!count) {
                      navigate(`/templates`)
                      return
                    }
                    applyDay(day.id)
                  }}
                >
                  <span>{day.name.replace(' day', '')}</span>
                  <span className="day-pick-sub">
                    {count ? `${count} ex` : 'Set up'}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedDay && !(templates.find((t) => t.id === selectedDay)?.exerciseIds?.length) ? (
            <p className="empty" style={{ padding: '8px 0 16px' }}>
              {DAY_LABEL[selectedDay]} has no exercises yet.{' '}
              <Link to="/templates">Set it up</Link>
            </p>
          ) : null}
        </>
      )}

      {entries.length === 0 && !existing ? (
        <p className="empty" style={{ padding: '4px 0 18px' }}>
          Pick a day to load your exercises, or add one below.
        </p>
      ) : null}

      <div className="list">
        {entries.map((entry) => (
          <article className="exercise-block" key={entry.key}>
            <div className="exercise-head">
              <div>
                <h3>{entry.name}</h3>
                <span className="type-badge">{entry.type}</span>
              </div>
              <button
                type="button"
                className="icon-btn danger"
                aria-label="Remove exercise"
                onClick={() => removeEntry(entry.key)}
              >
                ×
              </button>
            </div>

            {entry.sets.map((set, i) => (
              <div className={`set-row ${entry.type}`} key={`${entry.key}-${i}`}>
                <span className="set-i">{i + 1}</span>
                {entry.type === 'hold' ? (
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="0:30 or 30"
                    value={set.durationInput ?? durationInputValue(set.durationSec)}
                    onChange={(e) =>
                      updateSet(entry.key, i, {
                        durationInput: e.target.value,
                        durationSec: parseDuration(e.target.value),
                      })
                    }
                    aria-label={`Set ${i + 1} duration`}
                  />
                ) : null}
                {entry.type === 'reps' ? (
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Reps"
                    value={set.reps ?? ''}
                    onChange={(e) =>
                      updateSet(entry.key, i, {
                        reps: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    aria-label={`Set ${i + 1} reps`}
                  />
                ) : null}
                {entry.type === 'weighted' ? (
                  <>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      placeholder="Reps"
                      value={set.reps ?? ''}
                      onChange={(e) =>
                        updateSet(entry.key, i, {
                          reps: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      aria-label={`Set ${i + 1} reps`}
                    />
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="lb"
                      value={set.weight ?? ''}
                      onChange={(e) =>
                        updateSet(entry.key, i, {
                          weight: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      aria-label={`Set ${i + 1} weight`}
                    />
                  </>
                ) : null}
                <button
                  type="button"
                  className="set-remove"
                  aria-label="Remove set"
                  onClick={() => removeSet(entry.key, i)}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="file-btn"
              onClick={() => addSet(entry.key, entry.type)}
            >
              + Add set
            </button>

            <div className="media-row">
              <MediaThumb
                url={entry.previewUrl || (!entry.removeMedia && entry.mediaUrl)}
                type={
                  entry.file
                    ? entry.file.type.startsWith('video/')
                      ? 'video'
                      : 'image'
                    : entry.mediaType
                }
              />
              <label className="file-btn">
                {entry.previewUrl || (entry.mediaUrl && !entry.removeMedia)
                  ? 'Replace media'
                  : 'Add photo / video'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={(e) => onFile(entry.key, e.target.files?.[0] || null)}
                />
              </label>
              {(entry.previewUrl || (entry.mediaUrl && !entry.removeMedia)) && (
                <button
                  type="button"
                  className="tiny"
                  onClick={() => {
                    onFile(entry.key, null)
                    updateEntry(entry.key, { removeMedia: true })
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ marginTop: 14 }}
        onClick={() => setPickerOpen(true)}
      >
        Add exercise
      </button>

      <label className="field" style={{ marginTop: 16 }}>
        <span>Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
      </label>

      {error ? <div className="error-banner">{error}</div> : null}

      <button
        type="button"
        className="btn btn-primary btn-block sticky-save"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save workout'}
      </button>

      {pickerOpen ? (
        <ExercisePicker
          exercises={activeExercises}
          onPick={addExercise}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  )
}
