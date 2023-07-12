import { PubSub } from "@google-cloud/pubsub"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"
import { setGlobalOptions } from "firebase-functions/v2"


initializeApp()

export const db = getFirestore()
db.settings({
    ignoreUndefinedProperties: true,
})

setGlobalOptions({
    maxInstances: 10,
})
export const functions = getFunctions()
export const storage = getStorage()

export const pubsub = new PubSub()