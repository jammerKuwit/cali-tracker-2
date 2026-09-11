import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { DAY_TEMPLATES } from '../lib/constants'
import { db } from '../firebase'

const templatesCol = collection(db, 'templates')
const ORDER = DAY_TEMPLATES.map((d) => d.id)

export async function seedTemplatesIfMissing() {
  await Promise.all(
    DAY_TEMPLATES.map(async (day) => {
      const ref = doc(db, 'templates', day.id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          name: day.name,
          exerciseIds: [],
          createdAt: serverTimestamp(),
        })
      }
    }),
  )
}

export function subscribeTemplates(onData, onError) {
  return onSnapshot(
    templatesCol,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))
      onData(rows.filter((row) => ORDER.includes(row.id)))
    },
    onError,
  )
}

export async function setTemplateExercises(id, exerciseIds) {
  await updateDoc(doc(db, 'templates', id), {
    exerciseIds,
    updatedAt: serverTimestamp(),
  })
}
