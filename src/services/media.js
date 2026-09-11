import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

export async function uploadMedia(workoutId, entryIndex, file) {
  const safeName = file.name.replace(/[^\w.-]+/g, '_')
  const path = `media/${workoutId}/${entryIndex}/${Date.now()}_${safeName}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
  return { url, path, mediaType }
}

export async function deleteMedia(path) {
  if (!path) return
  try {
    await deleteObject(ref(storage, path))
  } catch (err) {
    if (err?.code !== 'storage/object-not-found') throw err
  }
}
