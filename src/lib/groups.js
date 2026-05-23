import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, onSnapshot, orderBy, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

// 6자리 랜덤 초대코드 생성
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// 그룹 생성
export async function createGroup(user, groupName) {
  const inviteCode = generateInviteCode()
  const ref = await addDoc(collection(db, 'groups'), {
    name: groupName,
    inviteCode,
    ownerId: user.uid,
    members: [{
      uid: user.uid,
      name: user.displayName || user.email,
      photo: user.photoURL,
    }],
    createdAt: Date.now(),
  })
  return { id: ref.id, inviteCode }
}

// 초대코드로 그룹 참가
export async function joinGroupByCode(user, code) {
  const q = query(collection(db, 'groups'), where('inviteCode', '==', code.toUpperCase().trim()))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('초대 코드를 찾을 수 없어요')
  const groupDoc = snap.docs[0]
  const group = groupDoc.data()
  const already = group.members.some(m => m.uid === user.uid)
  if (already) throw new Error('이미 참가한 그룹이에요')
  await updateDoc(groupDoc.ref, {
    members: arrayUnion({
      uid: user.uid,
      name: user.displayName || user.email,
      photo: user.photoURL,
    })
  })
  return { id: groupDoc.id, ...group }
}

// 내 그룹 목록 구독
export function subscribeMyGroups(uid, callback) {
  const q = query(collection(db, 'groups'), where('members', 'array-contains-any', [{ uid }]))
  // array-contains-any는 객체 비교가 안 되므로 전체 가져와서 필터
  return onSnapshot(collection(db, 'groups'), snap => {
    const groups = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(g => g.members?.some(m => m.uid === uid))
    callback(groups)
  })
}
