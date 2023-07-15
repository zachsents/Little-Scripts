import { defineSecret } from "firebase-functions/params"
import { setGlobalOptions } from "firebase-functions/v2"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"
import { PubSub } from "@google-cloud/pubsub"

export const stripeKey = defineSecret("firestore-stripe-payments-STRIPE_API_KEY")


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
export const auth = getAuth()

export const pubsub = new PubSub()