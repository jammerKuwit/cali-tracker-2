import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/data'
import { DAY_LABEL } from '../lib/constants'
import { formatLong } from '../lib/dates'
import { formatSet } from '../lib/format'
import { deleteMedia } from '../services/media'
import { deleteWorkoutDoc } from '../services/workouts'

export default function WorkoutDetail() {
  const { id } = useParams()
  const { workouts, ready } = useData()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const workout = workouts.find((w) => w.id === id)

  if (!ready) return null
  if (!workout) return <Navigate to="/history" replace />

  async function handleDelete() {
    if (!window.confirm('Delete this workout?')) return
    setBusy(true)
    try {
      const paths = (workout.exercises || []).map((e) => e.mediaPath).filter(Boolean)
      await Promise.all(paths.map((p) => deleteMedia(p)))
      await deleteWorkoutDoc(workout.id)
      navigate('/history')
    } catch (err) {
      setBusy(false)
      window.alert(err.message || 'Could not delete')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Session</h1>
          <p className="kicker">
            {formatLong(workout.date)}
            {workout.day && DAY_LABEL[workout.day] ? ` · ${DAY_LABEL[workout.day]}` : ''}
          </p>
        </div>
      </header>

      {(workout.exercises || []).map((entry, i) => (
        <article className="card" key={`${entry.exerciseId}-${i}`}>
          <div className="exercise-head" style={{ marginBottom: 0 }}>
            <div>
              <h3>{entry.name}</h3>
              <span className="type-badge">{entry.type}</span>
            </div>
          </div>
          <ul className="detail-sets">
            {(entry.sets || []).map((set, idx) => (
              <li key={idx}>
                Set {idx + 1} — {formatSet(set, entry.type)}
              </li>
            ))}
          </ul>
          {entry.mediaUrl ? (
            <div className="detail-media">
              {entry.mediaType === 'video' ? (
                <video src={entry.mediaUrl} controls playsInline />
              ) : (
                <img src={entry.mediaUrl} alt="" />
              )}
            </div>
          ) : null}
        </article>
      ))}

      {workout.notes ? (
        <p className="card muted" style={{ marginTop: 12 }}>
          {workout.notes}
        </p>
      ) : null}

      <div className="actions">
        <Link className="btn btn-ghost btn-block" to={`/workout/${workout.id}/edit`}>
          Edit
        </Link>
        <button
          type="button"
          className="btn btn-blaze btn-block"
          onClick={handleDelete}
          disabled={busy}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
