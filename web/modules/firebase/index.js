import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
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


// if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
//     // connectFunctionsEmulator(functions, "localhost", functionsEmulatorPort)
//     if (!db._settingsFrozen)
//         connectFirestoreEmulator(db, "localhost", 8080)
// }


onAuthStateChanged(auth, user => {
    if (user === undefined)
        return

    if (!user)
        signInAnonymously(auth)
})


export const fire = {
    app,
    analytics,
    db,
    storage,
    auth,
}

export * from "./storage"
export * from "./update-or-create"
export * from "./use-count-query"
export * from "./use-script"

