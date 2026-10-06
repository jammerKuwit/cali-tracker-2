import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABEL, EXERCISE_TYPES } from '../lib/constants'
import { useVisualViewport } from '../lib/useVisualViewport'

export default function ExercisePicker({
  exercises,
  onPick,
  onClose,
  excludeIds = [],
  title = 'Add exercise',
}) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const viewport = useVisualViewport()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises
      .filter((ex) => !ex.archived)
      .filter((ex) => !excludeIds.includes(ex.id))
      .filter((ex) => (type === 'all' ? true : ex.type === type))
      .filter((ex) => (q ? ex.name.toLowerCase().includes(q) : true))
  }, [exercises, query, type, excludeIds])

  return (
    <div
      className="overlay"
      onClick={onClose}
      role="presentation"
      style={{
        top: viewport.offsetTop,
        height: viewport.height,
      }}
    >
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Choose exercise"
      >
        <div className="sheet-head">
          <h2 className="page-title" style={{ fontSize: 26 }}>
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <input
          className="input search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" style={{ marginBottom: 8 }}>
          <button
            type="button"
            className={`chip${type === 'all' ? ' on' : ''}`}
            onClick={() => setType('all')}
          >
            All
          </button>
          {EXERCISE_TYPES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`chip${type === t.id ? ' on' : ''}`}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="sheet-results">
          {filtered.length === 0 ? (
            <p className="empty">No exercises match.</p>
          ) : (
            filtered.map((ex) => (
              <button
                type="button"
                key={ex.id}
                className="picker-row"
                onClick={() => onPick(ex)}
              >
                <span>
                  <strong>{ex.name}</strong>
                  <div className="tiny">
                    {CATEGORY_LABEL[ex.category]} · {ex.type}
                  </div>
                </span>
                <span className="type-badge">{ex.type}</span>
              </button>
            ))
          )}
          <Link
            to="/exercises"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 16, marginBottom: 12 }}
          >
            Manage exercises
          </Link>
        </div>
      </div>
    </div>
  )
}
