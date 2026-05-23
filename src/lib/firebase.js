import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBodQCqpr2SdxYz46sjTV-iZusyt4lD1E4",
  authDomain: "reelread-442cb.firebaseapp.com",
  databaseURL: "https://reelread-442cb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "reelread-442cb",
  storageBucket: "reelread-442cb.firebasestorage.app",
  messagingSenderId: "895605932985",
  appId: "1:895605932985:web:33fe3167f50172eaef6c68",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
