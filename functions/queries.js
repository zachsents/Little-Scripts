import { SCRIPT_RUN_COLLECTION, getLastBillingCycleStartDate } from "shared"
import { db } from "./init.js"
import { Timestamp } from "firebase-admin/firestore"


export async function countExistingRuns(scriptRef) {
    const query = await db.collection(SCRIPT_RUN_COLLECTION)
        .where("script", "==", scriptRef)
        .where("startedAt", ">=", Timestamp.fromDate(getLastBillingCycleStartDate()))
        .count().get()

    return query.data().count
}