import { useSearchParams } from 'react-router-dom'
import WorkoutForm from '../components/WorkoutForm'
import { useData } from '../context/data'
import { todayISO } from '../lib/dates'

export default function Log() {
  const { exercises } = useData()
  const [params] = useSearchParams()
  const date = params.get('date') || todayISO()
  const day = params.get('day') || undefined

  return <WorkoutForm exercises={exercises} initialDate={date} initialDay={day} />
}
