import { Link } from 'react-router-dom'
import { useData } from '../context/data'
import { DAY_TEMPLATES } from '../lib/constants'
import { currentStreak, formatLong, todayISO, toISO, weekDays, weekdayLetter } from '../lib/dates'
import { trainedDateSet } from '../lib/stats'

export default function Home() {
  const { workouts, templates } = useData()
  const today = todayISO()
  const dates = trainedDateSet(workouts)
  const streak = currentStreak(dates)
  const todayWorkouts = workouts.filter((w) => w.date === today)
  const last = workouts[0]
  const week = weekDays()
  const daysReady = templates.some((t) => (t.exerciseIds || []).length)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="wordmark">CALI</div>
          <p className="kicker">{formatLong(today)}</p>
        </div>
        <div className="streak">
          <div className="streak-n tabular">{streak}</div>
          <div className="streak-l">Streak</div>
        </div>
      </header>

      {todayWorkouts.length ? (
        <div className="cta-row">
          <Link className="cta" to={`/workout/${todayWorkouts[0].id}`}>
            <span className="cta-title">Open today</span>
            <span className="cta-sub">
              {todayWorkouts.length} session{todayWorkouts.length === 1 ? '' : 's'} logged
            </span>
          </Link>
        </div>
      ) : null}

      <h2 className="section-label">{todayWorkouts.length ? 'Log another' : 'Log today'}</h2>
      <div className="cta-row">
        {DAY_TEMPLATES.map((day) => {
          const tpl = templates.find((t) => t.id === day.id)
          const count = tpl?.exerciseIds?.length || 0
          return (
            <Link
              key={day.id}
              className={count ? 'cta cta-day' : 'btn btn-ghost btn-block'}
              to={count ? `/log?date=${today}&day=${day.id}` : '/templates'}
            >
              {count ? (
                <>
                  <span className="cta-title">{day.name}</span>
                  <span className="cta-sub">{count} exercises ready</span>
                </>
              ) : (
                `Set up ${day.name.toLowerCase()}`
              )}
            </Link>
          )
        })}
      </div>
      <Link to="/templates" className="tiny" style={{ display: 'inline-block', marginTop: 10 }}>
        {daysReady ? 'Edit my days' : 'Choose exercises for each day first'}
      </Link>

      <h2 className="section-label">This week</h2>
      <div className="week-strip">
        {week.map((day) => {
          const iso = toISO(day)
          const on = dates.has(iso)
          return (
            <div key={iso} className={`week-day${iso === today ? ' is-today' : ''}`}>
              <span className="week-l">{weekdayLetter(day)}</span>
              <span className={`week-dot${on ? ' on' : ''}`} />
            </div>
          )
        })}
      </div>

      <h2 className="section-label">Last session</h2>
      {last ? (
        <Link className="card card-link" to={`/workout/${last.id}`}>
          <strong>{formatLong(last.date)}</strong>
          <p className="muted" style={{ marginTop: 6 }}>
            {(last.exercises || []).map((e) => e.name).slice(0, 3).join(' · ') || 'Workout'}
            {(last.exercises || []).length > 3 ? '…' : ''}
            {' · '}
            {(last.exercises || []).length} ex
          </p>
        </Link>
      ) : (
        <p className="empty">No sessions yet. Set up a day, then log it.</p>
      )}
    </div>
  )
}
