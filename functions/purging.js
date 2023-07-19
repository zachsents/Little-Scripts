import { onSchedule } from "firebase-functions/v2/scheduler"
import { SCRIPT_COLLECTION, STRIPE_CUSTOMERS_COLLECTION, STRIPE_FREE_PRICE_ID, TRIGGER_COLLECTION } from "shared"
import { auth, db } from "./init.js"


export const purgeGhostUsers = onSchedule("every day 01:00", () => _purgeGhostUsers())


async function _purgeGhostUsers(nextPageToken) {

    const { users, pageToken } = await auth.listUsers(1000, nextPageToken)

    const usersToDelete = []

    await Promise.all(
        users.map(async user => {
            const scriptCount = await db.collection(SCRIPT_COLLECTION)
                .where("owner", "==", user.uid)
                .count().get()
                .then(snapshot => snapshot.data().count)

            if (scriptCount == 0)
                usersToDelete.push(user.uid)
        })
    )

    await auth.deleteUsers(usersToDelete)

    const batch = db.batch()
    usersToDelete.forEach(
        uid => batch.delete(db.collection(STRIPE_CUSTOMERS_COLLECTION).doc(uid))
    )
    await batch.commit()

    if (pageToken)
        await _purgeGhostUsers(pageToken)
}


export const purgeTriggerlessScripts = onSchedule("every day 00:00", async () => {

    const scriptsSnapshot = await db.collection(SCRIPT_COLLECTION).get()
    const batch = db.batch()

    await Promise.all(
        scriptsSnapshot.docs.map(async scriptDoc => {
            const triggerCount = await db.collection(TRIGGER_COLLECTION)
                .where("script", "==", scriptDoc.ref)
                .count().get()
                .then(snapshot => snapshot.data().count)

            if (triggerCount != 0)
                return

            const subscriptionSnapshot = await db.collectionGroup("subscriptions").where("metadata.scriptId", "==", scriptDoc.id).get()

            if (subscriptionSnapshot.docs[0].data().items[0].plan.id != STRIPE_FREE_PRICE_ID)
                return

            batch.delete(scriptDoc.ref)
        })
    )

    await batch.commit()
}) 