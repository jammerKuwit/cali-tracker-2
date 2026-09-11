import { useEffect, useMemo, useState } from 'react'
import { seedExercisesIfEmpty, subscribeExercises } from '../services/exercises'
import { seedTemplatesIfMissing, subscribeTemplates } from '../services/templates'
import { subscribeWorkouts } from '../services/workouts'
import { DataContext } from './data'

export function DataProvider({ children }) {
  const [exercises, setExercises] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [templates, setTemplates] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubEx = () => {}
    let unsubWo = () => {}
    let unsubTpl = () => {}
    let cancelled = false

    async function start() {
      try {
        await seedExercisesIfEmpty()
        await seedTemplatesIfMissing()
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to seed data')
      }

      unsubEx = subscribeExercises(
        (rows) => {
          if (!cancelled) {
            setExercises(rows)
            setReady(true)
          }
        },
        (err) => {
          if (!cancelled) {
            setError(err.message)
            setReady(true)
          }
        },
      )

      unsubWo = subscribeWorkouts(
        (rows) => {
          if (!cancelled) setWorkouts(rows)
        },
        (err) => {
          if (!cancelled) setError(err.message)
        },
      )

      unsubTpl = subscribeTemplates(
        (rows) => {
          if (!cancelled) setTemplates(rows)
        },
        (err) => {
          if (!cancelled) setError(err.message)
        },
      )
    }

    start()
    return () => {
      cancelled = true
      unsubEx()
      unsubWo()
      unsubTpl()
    }
  }, [])

  const value = useMemo(
    () => ({ exercises, workouts, templates, ready, error }),
    [exercises, workouts, templates, ready, error],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
