import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const workoutsCol = collection(db, 'workouts')

export function subscribeWorkouts(onData, onError) {
  const q = query(workoutsCol, orderBy('date', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        const at = a.loggedAt?.toMillis?.() ?? 0
        const bt = b.loggedAt?.toMillis?.() ?? 0
        return bt - at
      })
      onData(rows)
    },
    onError,
  )
}

export async function createWorkout(data) {
  const ref = await addDoc(workoutsCol, {
    ...data,
    loggedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateWorkout(id, data) {
  await updateDoc(doc(db, 'workouts', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteWorkoutDoc(id) {
  await deleteDoc(doc(db, 'workouts', id))
}
