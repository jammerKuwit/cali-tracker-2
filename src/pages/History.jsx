import { Link } from 'react-router-dom'
import MediaThumb from '../components/MediaThumb'
import { useData } from '../context/data'
import { DAY_LABEL } from '../lib/constants'
import { formatMedium } from '../lib/dates'
import { firstMedia } from '../lib/stats'

export default function History() {
  const { workouts } = useData()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">History</h1>
      </header>

      {workouts.length === 0 ? (
        <p className="empty">No workouts logged yet.</p>
      ) : (
        workouts.map((workout) => {
          const media = firstMedia(workout)
          const names = (workout.exercises || []).map((e) => e.name)
          return (
            <Link key={workout.id} className="card card-link" to={`/workout/${workout.id}`}>
              <div className="library-row">
                <div>
                  <strong>{formatMedium(workout.date)}</strong>
                  {workout.day && DAY_LABEL[workout.day] ? (
                    <span className="type-badge" style={{ marginLeft: 8 }}>
                      {DAY_LABEL[workout.day]}
                    </span>
                  ) : null}
                  <p className="muted" style={{ marginTop: 6 }}>
                    {names.slice(0, 4).join(' · ') || 'Workout'}
                    {names.length > 4 ? '…' : ''}
                  </p>
                  <p className="tiny" style={{ marginTop: 6 }}>
                    {(workout.exercises || []).length} exercises
                  </p>
                </div>
                <MediaThumb url={media?.url} type={media?.type} small />
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
