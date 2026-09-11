import { useState } from 'react'
import { CATEGORIES, EXERCISE_TYPES, CATEGORY_LABEL } from '../lib/constants'
import { useData } from '../context/data'
import { archiveExercise, createExercise } from '../services/exercises'

export default function Library() {
  const { exercises } = useData()
  const [name, setName] = useState('')
  const [type, setType] = useState('reps')
  const [category, setCategory] = useState('push')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const visible = exercises.filter((ex) => !ex.archived)
  const archived = exercises.filter((ex) => ex.archived)

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Name is required')
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

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Library</h1>
      </header>

      <form onSubmit={handleAdd} className="card" style={{ marginBottom: 20 }}>
        <label className="field">
          <span>New exercise</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tuck planche"
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {EXERCISE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <div className="error-banner">{error}</div> : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          Add to library
        </button>
      </form>

      {CATEGORIES.map((cat) => {
        const group = visible.filter((ex) => ex.category === cat.id)
        if (!group.length) return null
        return (
          <section key={cat.id}>
            <h2 className="section-label">{cat.label}</h2>
            {group.map((ex) => (
              <article className="card" key={ex.id}>
                <div className="library-row">
                  <div>
                    <strong>{ex.name}</strong>
                    <div className="tiny">
                      {CATEGORY_LABEL[ex.category]} · {ex.type}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="tiny"
                    onClick={() => archiveExercise(ex.id, true)}
                  >
                    Archive
                  </button>
                </div>
              </article>
            ))}
          </section>
        )
      })}

      {archived.length ? (
        <>
          <h2 className="section-label">Archived</h2>
          {archived.map((ex) => (
            <article className="card" key={ex.id}>
              <div className="library-row">
                <div>
                  <strong>{ex.name}</strong>
                  <div className="tiny">Hidden from picker</div>
                </div>
                <button type="button" className="tiny" onClick={() => archiveExercise(ex.id, false)}>
                  Restore
                </button>
              </div>
            </article>
          ))}
        </>
      ) : null}
    </div>
  )
}
