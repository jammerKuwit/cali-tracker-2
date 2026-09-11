import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABEL, EXERCISE_TYPES } from '../lib/constants'

export default function ExercisePicker({
  exercises,
  onPick,
  onClose,
  excludeIds = [],
  title = 'Add exercise',
}) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises
      .filter((ex) => !ex.archived)
      .filter((ex) => !excludeIds.includes(ex.id))
      .filter((ex) => (type === 'all' ? true : ex.type === type))
      .filter((ex) => (q ? ex.name.toLowerCase().includes(q) : true))
  }, [exercises, query, type, excludeIds])

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Choose exercise"
      >
        <div className="sheet-handle" />
        <h2 className="page-title" style={{ fontSize: 26, marginBottom: 14 }}>
          {title}
        </h2>
        <input
          className="input search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="chips" style={{ marginBottom: 12 }}>
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
          to="/library"
          className="btn btn-ghost btn-block"
          style={{ marginTop: 16 }}
        >
          Manage library
        </Link>
      </div>
    </div>
  )
}
