import { Link } from 'react-router-dom'
import { useData } from '../context/data'
import { DAY_TEMPLATES } from '../lib/constants'
import { currentStreak, formatLong, todayISO } from '../lib/dates'
import { trainedDateSet } from '../lib/stats'

export default function Home() {
  const { workouts, templates } = useData()
  const today = todayISO()
  const dates = trainedDateSet(workouts)
  const streak = currentStreak(dates)

  return (
    <div className="page home-page">
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

      <div className="cta-row home-days">
        {DAY_TEMPLATES.map((day) => {
          const tpl = templates.find((t) => t.id === day.id)
          const count = tpl?.exerciseIds?.length || 0
          return (
            <Link
              key={day.id}
              className={count ? 'cta cta-day' : 'btn btn-ghost btn-block'}
              to={count ? `/log?date=${today}&day=${day.id}` : '/exercises'}
            >
              {count ? (
                <>
                  <span className="cta-title">{day.name.replace(' day', '').toUpperCase()}</span>
                  <span className="cta-sub">{count} exercises ready</span>
                </>
              ) : (
                `Set up ${day.name.toLowerCase()}`
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
