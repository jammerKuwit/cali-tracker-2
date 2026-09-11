import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { SEED_EXERCISES } from '../data/seedExercises'
import { db } from '../firebase'

const exercisesCol = collection(db, 'exercises')

export async function seedExercisesIfEmpty() {
  const snap = await getDocs(exercisesCol)
  if (!snap.empty) return

  const batch = writeBatch(db)
  for (const exercise of SEED_EXERCISES) {
    const { id, ...rest } = exercise
    batch.set(doc(db, 'exercises', id), {
      ...rest,
      weightUnit: rest.weightUnit || 'lb',
      archived: false,
      createdAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

export function subscribeExercises(onData, onError) {
  const q = query(exercisesCol, orderBy('name'))
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    },
    onError,
  )
}

export async function createExercise({ name, type, category, weightUnit = 'lb' }) {
  const payload = {
    name: name.trim(),
    type,
    category,
    weightUnit: type === 'weighted' ? weightUnit : 'lb',
    archived: false,
    createdAt: serverTimestamp(),
  }
  const ref = await addDoc(exercisesCol, payload)
  return ref.id
}

export async function archiveExercise(id, archived = true) {
  await updateDoc(doc(db, 'exercises', id), { archived })
}
