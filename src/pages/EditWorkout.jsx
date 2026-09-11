import { Navigate, useParams } from 'react-router-dom'
import WorkoutForm from '../components/WorkoutForm'
import { useData } from '../context/data'

export default function EditWorkout() {
  const { id } = useParams()
  const { exercises, workouts, ready } = useData()
  const workout = workouts.find((w) => w.id === id)

  if (!ready) return null
  if (!workout) return <Navigate to="/history" replace />

  return <WorkoutForm exercises={exercises} existing={workout} initialDate={workout.date} />
}
