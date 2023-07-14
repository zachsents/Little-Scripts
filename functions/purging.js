import { onSchedule } from "firebase-functions/v2/scheduler"
import { auth, db } from "./init.js"
import { SCRIPT_COLLECTION, STRIPE_CUSTOMERS_COLLECTION } from "shared"


export const purgeGhostUsers = onSchedule("every day 00:00", () => _purgeGhostUsers())


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