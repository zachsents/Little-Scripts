import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth"


const firebaseConfig = {
    apiKey: "AIzaSyDFBwo7vY5CjRVes7I_CnNpXwn4XjWCMPQ",
    authDomain: "little-scripts-391918.firebaseapp.com",
    projectId: "little-scripts-391918",
    storageBucket: "little-scripts-391918.appspot.com",
    messagingSenderId: "324658456713",
    appId: "1:324658456713:web:dda95b0384a21c3cab3e58",
    measurementId: "G-LCEPZM1XE5"
}


// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = global.window && getAnalytics(app)
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)

export const fire = {
    app,
    analytics,
    db,
    storage,
    auth,
}

// Authenticate anonymously if not already authenticated
onAuthStateChanged(auth, async (user) => {
    if (user === undefined)
        return

    if (!user) {
        await signInAnonymously(auth)
    }
})


export * from "./use-script"
export * from "./storage"