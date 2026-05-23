import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

// 그룹 프로필 가져오기
export async function getGroupProfile(groupId, userId) {
  const ref_ = doc(db, 'groups', groupId, 'memberProfiles', userId)
  const snap = await getDoc(ref_)
  return snap.exists() ? snap.data() : null
}

// 그룹 프로필 저장
export async function saveGroupProfile(groupId, userId, { name, photoURL }) {
  const ref_ = doc(db, 'groups', groupId, 'memberProfiles', userId)
  await setDoc(ref_, { name, photoURL, updatedAt: Date.now() }, { merge: true })
}

// 그룹 프로필 사진 업로드
export async function uploadGroupPhoto(groupId, userId, file) {
  const storageRef = ref(storage, `groupAvatars/${groupId}/${userId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// 내 그룹 프로필 구독
export function subscribeGroupProfile(groupId, userId, callback) {
  const ref_ = doc(db, 'groups', groupId, 'memberProfiles', userId)
  return onSnapshot(ref_, snap => {
    callback(snap.exists() ? snap.data() : null)
  })
}

// 그룹 전체 멤버 프로필 구독
export function subscribeAllGroupProfiles(groupId, callback) {
  const col = collection(db, 'groups', groupId, 'memberProfiles')
  return onSnapshot(col, snap => {
    const profiles = {}
    snap.docs.forEach(d => { profiles[d.id] = d.data() })
    callback(profiles)
  })
}
