import { onSchedule } from "firebase-functions/v2/scheduler"
import { PRICE_ID_PLAN, SCRIPT_COLLECTION, SOURCE_FILE_PATH, STRIPE_CUSTOMERS_COLLECTION, STRIPE_FREE_PRICE_ID } from "shared"
import { auth, db, storage } from "./init.js"


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

    console.log(`Purged ${usersToDelete.length} ghost users.`)

    if (pageToken)
        await _purgeGhostUsers(pageToken)
}


export const purgeScripts = onSchedule("every day 00:00", async () => {

    const scriptsSnapshot = await db.collection(SCRIPT_COLLECTION).get()
    const batch = db.batch()
    let count = 0

    await Promise.all(
        scriptsSnapshot.docs.map(async scriptDoc => {

            const [sourceFileExists] = await storage.bucket().file(SOURCE_FILE_PATH(scriptDoc.id)).exists()
            console.debug("Script", scriptDoc.id, "source file exists:", sourceFileExists)

            if (sourceFileExists)
                return

            const planId = await db.collectionGroup("subscriptions")
                .where("metadata.scriptId", "==", scriptDoc.id).get()
                .then(snapshot => snapshot.docs[0].data().items[0].plan.id)

            console.debug("Script", scriptDoc.id, "plan:", PRICE_ID_PLAN[planId])

            if (planId != STRIPE_FREE_PRICE_ID)
                return

            batch.delete(scriptDoc.ref)
            count++
        })
    )

    console.log(`Purged ${count} scripts.`)

    await batch.commit()
}) 