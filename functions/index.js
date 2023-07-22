import { FieldValue, Timestamp } from "firebase-admin/firestore"
import logger from "firebase-functions/logger"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { HttpsError, onCall } from "firebase-functions/v2/https"
import { onMessagePublished } from "firebase-functions/v2/pubsub"
import { onTaskDispatched } from "firebase-functions/v2/tasks"
import { Stripe } from "stripe"
import { db, functions, storage, stripeKey } from "./init.js"

import { FINISH_SCRIPT_RUN_TOPIC, LOG_FILE_PATH, MAX_FREE_RUNS, RUN_SCRIPT_QUEUE, RUN_STATUS, SCRIPT_COLLECTION, SCRIPT_RUNNER_ERROR_TOPIC, SCRIPT_RUNNER_URL, SCRIPT_RUN_COLLECTION, SERVICE_ERROR_REMAPS, SIGNED_URL_EXPIRATION, SOURCE_FILE_PATH, STARTER_CODE, STRIPE_FREE_PRICE_ID, TRIGGER_COLLECTION, TRIGGER_TYPE } from "shared"
import { getStripeCustomerId, getSubscriptionForScript, getUsageForScript } from "./stripe.js"
import { getNextDateFromSchedule, getStartDateFromSchedule } from "./util/scheduling.js"


/**
 * @typedef {object} ScriptRun
 *
 * @property {string} status
 * @property {import("firebase-admin/firestore").DocumentReference} script
 * @property {import("firebase-admin/firestore").DocumentReference} trigger
 * @property {object} triggerData Data passed into the script run from the trigger
 *
 * @property {import("firebase-admin/firestore").Timestamp} queuedAt
 * @property {import("firebase-admin/firestore").Timestamp} startedAt
 * @property {import("firebase-admin/firestore").Timestamp} scheduledAt
 * @property {import("firebase-admin/firestore").Timestamp} completedAt
 * @property {import("firebase-admin/firestore").Timestamp} scheduledFor
 *
 * @property {string} [cancelReason] Only present for status `CANCELLED`
 */


/**
 * @typedef {object} Trigger
 *
 * @property {string} type
 * @property {import("firebase-admin/firestore").DocumentReference} script
 *
 * @property {import("./util/scheduling.js").RecurringSchedule} schedule The schedule for recurring schedules. Only valid for type `trigger.recurring-schedule`.
 */


export const onScriptRunWritten = onDocumentWritten({
    document: `${SCRIPT_RUN_COLLECTION}/{scriptRunId}`,
    secrets: [stripeKey],
}, async event => {

    if (!event.data.after.exists)
        return

    /** @type {ScriptRun} */
    const scriptRun = event.data.after.data()

    if (scriptRun.status === RUN_STATUS.PENDING) {

        const stripe = new Stripe(stripeKey.value())
        const subscription = await getSubscriptionForScript(stripe, scriptRun.script.id)
        const isOnFreePlan = subscription.items.data[0].price.id === STRIPE_FREE_PRICE_ID

        if (isOnFreePlan) {
            const usage = await getUsageForScript(stripe, scriptRun.script.id)

            if (usage.total_usage >= MAX_FREE_RUNS) {
                logger.info(`Free tier run limit reached (${event.data.after.id})`)

                await db.collection(SCRIPT_RUN_COLLECTION).doc(event.data.after.id)
                    .update({
                        status: RUN_STATUS.FAILED,
                        failedAt: FieldValue.serverTimestamp(),
                        failureReason: "Free tier run limit reached",
                    })

                return
            }
        }

        await stripe.subscriptionItems.createUsageRecord(
            subscription.items.data[0].id,
            { quantity: 1 }
        )

        logger.info(`Beginning script run (${event.data.after.id})`)

        await db.collection(SCRIPT_RUN_COLLECTION).doc(event.data.after.id).update({
            status: RUN_STATUS.RUNNING,
            startedAt: FieldValue.serverTimestamp(),
        })

        const [sourceDownloadUrl] = await storage.bucket().file(SOURCE_FILE_PATH(scriptRun.script.id)).getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + SIGNED_URL_EXPIRATION,
        })

        const [logUploadUrl] = await storage.bucket().file(LOG_FILE_PATH(scriptRun.script.id, event.data.after.id)).getSignedUrl({
            version: "v4",
            action: "write",
            expires: Date.now() + SIGNED_URL_EXPIRATION,
            contentType: "text/plain",
        })

        await functions.taskQueue(RUN_SCRIPT_QUEUE).enqueue({
            sourceDownloadUrl,
            logUploadUrl,
            triggerData: scriptRun.triggerData ?? {},
        }, {
            uri: `${SCRIPT_RUNNER_URL}/${event.data.after.id}`,
        })
    }

    if (scriptRun.status === RUN_STATUS.PENDING_SCHEDULING) {
        await functions.taskQueue("runScheduledScript").enqueue({
            scriptRunId: event.data.after.id,
        }, {
            scheduleTime: scriptRun.scheduledFor.toDate(),
        })

        logger.info(`Scheduled script run (${event.data.after.id}) for ${scriptRun.scheduledFor.toDate().toISOString()}`)

        await db.collection(SCRIPT_RUN_COLLECTION).doc(event.data.after.id).update({
            status: RUN_STATUS.SCHEDULED,
            scheduledAt: FieldValue.serverTimestamp(),
        })
    }
})


export const runScheduledScript = onTaskDispatched(async ({ data }) => {

    const scriptRunRef = db.collection(SCRIPT_RUN_COLLECTION).doc(data.scriptRunId)
    /** @type {ScriptRun} */
    const scriptRun = await scriptRunRef.get().then(doc => doc.data())

    if (scriptRun.status !== RUN_STATUS.SCHEDULED)
        return

    await scriptRunRef.update({
        status: RUN_STATUS.PENDING,
        queuedAt: FieldValue.serverTimestamp(),
    })

    /** @type {Trigger} */
    const trigger = await scriptRun.trigger?.get().then(doc => doc.data())

    if (trigger?.type === TRIGGER_TYPE.RECURRING_SCHEDULE) {
        await db.collection(SCRIPT_RUN_COLLECTION).add({
            script: scriptRun.script,
            trigger: scriptRun.trigger,
            status: RUN_STATUS.PENDING_SCHEDULING,
            scheduledFor: Timestamp.fromDate(
                getNextDateFromSchedule(trigger.schedule, scriptRun.scheduledFor.toDate())
            ),
        })
    }
})


export const onTriggerWrite = onDocumentWritten(`${TRIGGER_COLLECTION}/{triggerId}`, async event => {

    /** @type {Trigger} */
    const beforeTrigger = event.data.before.data()

    /** @type {Trigger} */
    const afterTrigger = event.data.after.data()

    const type = afterTrigger?.type ?? beforeTrigger?.type

    if (type === TRIGGER_TYPE.RECURRING_SCHEDULE) {
        if (beforeTrigger) {
            const futureScriptRunsSnapshot = await db.collection(SCRIPT_RUN_COLLECTION)
                .where("trigger", "==", event.data.before.ref)
                .where("scheduledFor", ">", Timestamp.now())
                .get()

            const batch = db.batch()

            futureScriptRunsSnapshot.docs.forEach(scriptRunDoc => {
                batch.update(scriptRunDoc.ref, {
                    status: RUN_STATUS.CANCELLED,
                    cancelReason: afterTrigger ? "Trigger changed" : "Trigger deleted",
                })
            })

            await batch.commit()
        }

        if (afterTrigger && afterTrigger.schedule) {
            await db.collection(SCRIPT_RUN_COLLECTION).add({
                script: afterTrigger.script,
                trigger: event.data.after.ref,
                status: RUN_STATUS.PENDING_SCHEDULING,
                scheduledFor: Timestamp.fromDate(
                    getStartDateFromSchedule(afterTrigger.schedule)
                ),
            })
        }
    }
})


export const onScriptRunFinished = onMessagePublished(FINISH_SCRIPT_RUN_TOPIC, async event => {

    const { scriptRunId, status, ...data } = event.data.message.json
    const scriptRunRef = db.collection(SCRIPT_RUN_COLLECTION).doc(scriptRunId)

    if (status === RUN_STATUS.COMPLETED) {
        logger.info(`Script run completed (${event.data.message.json.scriptRunId})`)

        await scriptRunRef.update({
            status: RUN_STATUS.COMPLETED,
            completedAt: FieldValue.serverTimestamp(),
            ...data,
        })

        return
    }

    if (status === RUN_STATUS.FAILED) {
        logger.info(`Script run failed (${event.data.message.json.scriptRunId})`)

        await scriptRunRef.update({
            status: RUN_STATUS.FAILED,
            failedAt: FieldValue.serverTimestamp(),
            failureReason: "Runtime error",
            ...data,
        })

        return
    }
})


export const onScriptRunnerError = onMessagePublished(SCRIPT_RUNNER_ERROR_TOPIC, async event => {

    const scriptRunId = new URL(event.data.message.json.httpRequest.requestUrl).pathname.slice(1)

    let errorText = event.data.message.json.textPayload

    logger.info(`Service Error caused script run to fail (${scriptRunId})\n"${errorText}"`)

    const matchingRemap = SERVICE_ERROR_REMAPS.find(remap => errorText.includes(remap.includeText))
    if (matchingRemap)
        errorText = matchingRemap.remapTo

    await db.collection(SCRIPT_RUN_COLLECTION).doc(scriptRunId).update({
        status: RUN_STATUS.FAILED,
        failedAt: FieldValue.serverTimestamp(),
        failureReason: "Service error",
        stderr: errorText,
    })
})


export const onRequestCreateScript = onCall({
    secrets: [stripeKey],
}, async (req) => {

    if (!req.auth?.uid)
        throw new HttpsError("unauthenticated", "You must be signed in to create a script")

    const scriptDocRef = db.collection(SCRIPT_COLLECTION).doc()

    const stripe = new Stripe(stripeKey.value())
    const customerId = await getStripeCustomerId(req)
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
            { price: STRIPE_FREE_PRICE_ID },
        ],
        collection_method: "charge_automatically",
        metadata: {
            scriptId: scriptDocRef.id,
        },
    })

    await scriptDocRef.set({
        name: req.data.name,
        createdAt: FieldValue.serverTimestamp(),
        owner: req.auth.uid,
    })

    await storage.bucket().file(SOURCE_FILE_PATH(scriptDocRef.id)).save(STARTER_CODE)

    return {
        scriptId: scriptDocRef.id,
        subscriptionId: subscription.id,
    }
})


export const onRequestDeleteScript = onCall({
    secrets: [stripeKey],
}, async (req) => {

    if (!(await ownsScript(req.auth.uid, req.data.scriptId)))
        throw new HttpsError("permission-denied", "You do not own this script")

    const stripe = new Stripe(stripeKey.value())

    const subscriptionId = await getSubscriptionForScript(stripe, req.data.scriptId, false)
    await stripe.subscriptions.cancel(subscriptionId, {
        invoice_now: true,
    })

    const scriptRef = db.collection(SCRIPT_COLLECTION).doc(req.data.scriptId)

    const triggerDocs = await db.collection(TRIGGER_COLLECTION)
        .where("script", "==", scriptRef)
        .get()
        .then(snapshot => snapshot.docs)

    const batch = db.batch()
    triggerDocs.forEach(doc => batch.delete(doc.ref))
    batch.delete(scriptRef)
    await batch.commit()
})


export * from "./purging.js"
export * from "./stripe.js"
export * from "./triggers.js"
export * from "./reporting.js"


export function ownsScript(uid, scriptId) {
    return db.collection(SCRIPT_COLLECTION).doc(scriptId).get()
        .then(doc => doc.data()?.owner === uid)
}