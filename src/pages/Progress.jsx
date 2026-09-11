import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useData } from '../context/data'
import { formatDuration } from '../lib/format'
import { metricLabel, metricUnit, progressSeries } from '../lib/stats'

export default function Progress() {
  const { exercises, workouts } = useData()
  const navigate = useNavigate()
  const active = exercises.filter((ex) => !ex.archived)
  const loggedIds = new Set(
    workouts.flatMap((w) => (w.exercises || []).map((e) => e.exerciseId)),
  )
  const [exerciseId, setExerciseId] = useState('')
  const selectedId =
    exerciseId || active.find((ex) => loggedIds.has(ex.id))?.id || active[0]?.id || ''

  const exercise = exercises.find((ex) => ex.id === selectedId) || active[0]
  const exerciseIdKey = exercise?.id
  const exerciseType = exercise?.type
  const series =
    exerciseIdKey && exerciseType
      ? progressSeries(workouts, exerciseIdKey, exerciseType).map((row) => ({
          ...row,
          label: format(parseISO(row.date), 'MMM d'),
        }))
      : []

  const latest = series[series.length - 1]

  function formatTick(value) {
    if (!exercise) return value
    if (exercise.type === 'hold') return formatDuration(value)
    return value
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Progress</h1>
      </header>

      {active.length === 0 ? (
        <p className="empty">Add exercises to the library first.</p>
      ) : (
        <>
          <label className="field">
            <span>Exercise</span>
            <select
              value={exercise?.id || ''}
              onChange={(e) => setExerciseId(e.target.value)}
            >
              {active.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </label>

          {exercise ? (
            <p className="muted">
              {metricLabel(exercise.type)} · {metricUnit(exercise.type)}
            </p>
          ) : null}

          {latest ? (
            <div className="metric-readout tabular">
              {exercise.type === 'hold' ? formatDuration(latest.value) : latest.value}
              {exercise.type === 'weighted' ? ' lb' : exercise.type === 'reps' ? ' reps' : ''}
            </div>
          ) : null}

          {series.length === 0 ? (
            <p className="empty">No logs for this movement yet.</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer>
                <LineChart
                  data={series}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  onClick={(state) => {
                    const id = state?.activePayload?.[0]?.payload?.workoutId
                    if (id) navigate(`/workout/${id}`)
                  }}
                >
                  <CartesianGrid stroke="#2c3140" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#8b90a0" tick={{ fill: '#8b90a0', fontSize: 12 }} />
                  <YAxis
                    stroke="#8b90a0"
                    tick={{ fill: '#8b90a0', fontSize: 12 }}
                    tickFormatter={formatTick}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#12141a',
                      border: '1px solid #2c3140',
                      borderRadius: 12,
                    }}
                    formatter={(value) => [formatTick(value), metricLabel(exercise.type)]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6a1b9a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6a1b9a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
