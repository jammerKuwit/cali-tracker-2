import { useMemo, useState } from 'react'
import ExercisePicker from '../components/ExercisePicker'
import { useData } from '../context/data'
import {
  CATEGORIES,
  CATEGORY_LABEL,
  DAY_TEMPLATES,
  EXERCISE_TYPES,
} from '../lib/constants'
import { archiveExercise, createExercise } from '../services/exercises'
import { setTemplateExercises } from '../services/templates'

export default function Exercises() {
  const { exercises, templates } = useData()
  const [addingTo, setAddingTo] = useState(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('reps')
  const [category, setCategory] = useState('push')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const active = exercises.filter((exercise) => !exercise.archived)
  const archived = exercises.filter((exercise) => exercise.archived)
  const byId = useMemo(
    () => Object.fromEntries(active.map((exercise) => [exercise.id, exercise])),
    [active],
  )

  async function saveDay(dayId, exerciseIds) {
    setError(null)
    try {
      await setTemplateExercises(dayId, exerciseIds)
    } catch (err) {
      setError(err.message || 'Could not update day')
    }
  }

  function addToDay(dayId, exercise) {
    const template = templates.find((item) => item.id === dayId)
    const ids = template?.exerciseIds || []
    if (!ids.includes(exercise.id)) saveDay(dayId, [...ids, exercise.id])
    setAddingTo(null)
  }

  function removeFromDay(dayId, exerciseId) {
    const template = templates.find((item) => item.id === dayId)
    saveDay(
      dayId,
      (template?.exerciseIds || []).filter((id) => id !== exerciseId),
    )
  }

  function move(dayId, index, direction) {
    const template = templates.find((item) => item.id === dayId)
    const ids = [...(template?.exerciseIds || [])]
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= ids.length) return
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    saveDay(dayId, ids)
  }

  async function handleAdd(event) {
    event.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Exercise name is required')
      return
    }

    setSaving(true)
    try {
      await createExercise({ name, type, category })
      setName('')
    } catch (err) {
      setError(err.message || 'Could not add exercise')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(exercise) {
    if (!window.confirm(`Delete ${exercise.name} from your exercises?`)) return
    setError(null)
    try {
      await Promise.all(
        DAY_TEMPLATES.map((day) => {
          const template = templates.find((item) => item.id === day.id)
          const ids = template?.exerciseIds || []
          return ids.includes(exercise.id)
            ? setTemplateExercises(
                day.id,
                ids.filter((id) => id !== exercise.id),
              )
            : Promise.resolve()
        }),
      )
      await archiveExercise(exercise.id, true)
    } catch (err) {
      setError(err.message || 'Could not delete exercise')
    }
  }

  const addingTemplate = templates.find((item) => item.id === addingTo)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Exercises</h1>
          <p className="kicker">Manage your days and exercise library</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <h2 className="section-label">Default workout days</h2>
      {DAY_TEMPLATES.map((day) => {
        const template = templates.find((item) => item.id === day.id)
        const ids = (template?.exerciseIds || []).filter((id) => byId[id])

        return (
          <section className="card exercise-day-card" key={day.id}>
            <div className="library-row exercise-day-head">
              <h2 className="exercise-day-title">{day.name}</h2>
              <span className="tiny">{ids.length} exercises</span>
            </div>

            {ids.length ? (
              <div className="list exercise-day-list">
                {ids.map((id, index) => {
                  const exercise = byId[id]
                  return (
                    <div className="template-row" key={id}>
                      <div>
                        <strong>{exercise.name}</strong>
                        <div className="tiny">
                          {CATEGORY_LABEL[exercise.category]} · {exercise.type}
                        </div>
                      </div>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Move ${exercise.name} up`}
                          onClick={() => move(day.id, index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Move ${exercise.name} down`}
                          onClick={() => move(day.id, index, 1)}
                          disabled={index === ids.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          aria-label={`Remove ${exercise.name} from ${day.name}`}
                          onClick={() => removeFromDay(day.id, id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="muted exercise-day-empty">No default exercises yet.</p>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => setAddingTo(day.id)}
            >
              Add exercise
            </button>
          </section>
        )
      })}

      <h2 className="section-label">Add an exercise</h2>
      <form onSubmit={handleAdd} className="card exercise-create">
        <label className="field">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Tuck planche"
          />
        </label>
        <div className="exercise-create-grid">
          <label className="field">
            <span>Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              {EXERCISE_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Adding…' : 'Add exercise'}
        </button>
      </form>

      <h2 className="section-label">All exercises</h2>
      <div className="list">
        {active.map((exercise) => (
          <article className="card" key={exercise.id}>
            <div className="library-row">
              <div>
                <strong>{exercise.name}</strong>
                <div className="tiny">
                  {CATEGORY_LABEL[exercise.category]} · {exercise.type}
                </div>
              </div>
              <button
                type="button"
                className="tiny danger-text"
                onClick={() => handleDelete(exercise)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {archived.length ? (
        <>
          <h2 className="section-label">Deleted exercises</h2>
          <div className="list">
            {archived.map((exercise) => (
              <article className="card" key={exercise.id}>
                <div className="library-row">
                  <div>
                    <strong>{exercise.name}</strong>
                    <div className="tiny">Hidden from workouts</div>
                  </div>
                  <button
                    type="button"
                    className="tiny"
                    onClick={() => archiveExercise(exercise.id, false)}
                  >
                    Restore
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {addingTo ? (
        <ExercisePicker
          title={`Add to ${addingTemplate?.name || 'day'}`}
          exercises={active}
          excludeIds={addingTemplate?.exerciseIds || []}
          onPick={(exercise) => addToDay(addingTo, exercise)}
          onClose={() => setAddingTo(null)}
        />
      ) : null}
    </div>
  )
}
