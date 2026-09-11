import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSameMonth } from 'date-fns'
import { useData } from '../context/data'
import {
  formatMonthTitle,
  monthGrid,
  shiftMonth,
  toISO,
  todayISO,
  weekdayLetter,
} from '../lib/dates'

export default function CalendarPage() {
  const { workouts } = useData()
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => new Date())
  const today = todayISO()

  const byDate = useMemo(() => {
    const map = new Map()
    for (const workout of workouts) {
      const list = map.get(workout.date) || []
      list.push(workout)
      map.set(workout.date, list)
    }
    return map
  }, [workouts])

  const days = monthGrid(cursor)

  function onDay(iso, list) {
    if (list?.length) {
      navigate(`/workout/${list[0].id}`)
      return
    }
    navigate(`/log?date=${iso}`)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Calendar</h1>
      </header>

      <div className="cal-nav">
        <button type="button" className="icon-btn" onClick={() => setCursor(shiftMonth(cursor, -1))} aria-label="Previous month">
          ‹
        </button>
        <h2>{formatMonthTitle(cursor)}</h2>
        <button type="button" className="icon-btn" onClick={() => setCursor(shiftMonth(cursor, 1))} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="cal-weekdays">
        {days.slice(0, 7).map((d) => (
          <span key={toISO(d)}>{weekdayLetter(d)}</span>
        ))}
      </div>

      <div className="cal-grid">
        {days.map((day) => {
          const iso = toISO(day)
          const list = byDate.get(iso)
          const trained = Boolean(list?.length)
          const thumb = list?.find((w) => w.thumbnailUrl)?.thumbnailUrl
          const inMonth = isSameMonth(day, cursor)
          return (
            <button
              type="button"
              key={iso}
              className={`cal-cell${trained ? ' trained' : ''}${iso === today ? ' today' : ''}${inMonth ? '' : ' out'}`}
              onClick={() => onDay(iso, list)}
            >
              <span>{day.getDate()}</span>
              {thumb ? (
                <img className="cal-thumb" src={thumb} alt="" />
              ) : trained ? (
                <span className="cal-pip" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
