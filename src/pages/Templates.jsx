import { useMemo, useState } from 'react'
import { useData } from '../context/data'
import { DAY_TEMPLATES } from '../lib/constants'
import { setTemplateExercises } from '../services/templates'
import ExercisePicker from '../components/ExercisePicker'

export default function Templates() {
  const { exercises, templates } = useData()
  const [addingTo, setAddingTo] = useState(null)
  const [error, setError] = useState(null)

  const byId = useMemo(
    () => Object.fromEntries(exercises.map((ex) => [ex.id, ex])),
    [exercises],
  )

  const active = exercises.filter((ex) => !ex.archived)

  async function save(id, exerciseIds) {
    setError(null)
    try {
      await setTemplateExercises(id, exerciseIds)
    } catch (err) {
      setError(err.message || 'Could not save day')
    }
  }

  function addToDay(dayId, exercise) {
    const tpl = templates.find((t) => t.id === dayId)
    const ids = [...(tpl?.exerciseIds || [])]
    if (ids.includes(exercise.id)) return
    save(dayId, [...ids, exercise.id])
    setAddingTo(null)
  }

  function removeFromDay(dayId, exerciseId) {
    const tpl = templates.find((t) => t.id === dayId)
    save(
      dayId,
      (tpl?.exerciseIds || []).filter((id) => id !== exerciseId),
    )
  }

  function move(dayId, index, dir) {
    const tpl = templates.find((t) => t.id === dayId)
    const ids = [...(tpl?.exerciseIds || [])]
    const next = index + dir
    if (next < 0 || next >= ids.length) return
    ;[ids[index], ids[next]] = [ids[next], ids[index]]
    save(dayId, ids)
  }

  const addingTpl = templates.find((t) => t.id === addingTo)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">My days</h1>
          <p className="kicker">Build your push, pull, and leg lineups</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      {DAY_TEMPLATES.map((day) => {
        const tpl = templates.find((t) => t.id === day.id)
        const ids = tpl?.exerciseIds || []
        return (
          <section className="card" key={day.id} id={day.id} style={{ marginBottom: 14 }}>
            <div className="library-row" style={{ marginBottom: 12 }}>
              <h2 className="page-title" style={{ fontSize: 22 }}>
                {day.name}
              </h2>
              <span className="tiny">
                {ids.length} exercise{ids.length === 1 ? '' : 's'}
              </span>
            </div>

            {ids.length === 0 ? (
              <p className="muted" style={{ marginBottom: 12 }}>
                No movements yet. Add the ones you always do on this day.
              </p>
            ) : (
              <div className="list" style={{ marginBottom: 12 }}>
                {ids.map((id, index) => {
                  const ex = byId[id]
                  if (!ex) return null
                  return (
                    <div className="template-row" key={id}>
                      <div>
                        <strong>{ex.name}</strong>
                        <div className="tiny">
                          {ex.category} · {ex.type}
                        </div>
                      </div>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Move up"
                          onClick={() => move(day.id, index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Move down"
                          onClick={() => move(day.id, index, 1)}
                          disabled={index === ids.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          aria-label={`Remove ${ex.name}`}
                          onClick={() => removeFromDay(day.id, id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
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

      {addingTo ? (
        <ExercisePicker
          title={`Add to ${addingTpl?.name || 'day'}`}
          exercises={active}
          excludeIds={addingTpl?.exerciseIds || []}
          onPick={(ex) => addToDay(addingTo, ex)}
          onClose={() => setAddingTo(null)}
        />
      ) : null}
    </div>
  )
}
