import logger from "firebase-functions/logger"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { onTaskDispatched } from "firebase-functions/v2/tasks"

import { db, functions, pubsub } from "./init.js"
import { getNextDateFromSchedule, getStartDateFromSchedule } from "./util/scheduling.js"
import { MAX_FREE_RUNS, RUN_STATUS, SCRIPT_RUN_COLLECTION, TRIGGER_COLLECTION, TRIGGER_TYPE } from "shared"
import { countExistingRuns } from "./queries.js"


/**
 * @typedef {object} ScriptRun
 *
 * @property {string} status
 * @property {import("firebase-admin/firestore").DocumentReference} script
 * @property {import("firebase-admin/firestore").DocumentReference} trigger
 *
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


export const onScriptRunWritten = onDocumentWritten(`${SCRIPT_RUN_COLLECTION}/{scriptRunId}`, async event => {

    if (!event.data.after.exists)
        return

    /** @type {ScriptRun} */
    const scriptRun = event.data.after.data()

    if (scriptRun.status === RUN_STATUS.PENDING) {

        // TO DO: only do this if the script is on the free tier
        const existingRunsCount = await countExistingRuns(scriptRun.script)
        if (existingRunsCount >= MAX_FREE_RUNS) {
            logger.info(`Free tier run limit reached (${event.data.after.id})`)

            await db.collection(SCRIPT_RUN_COLLECTION).doc(event.data.after.id).update({
                status: RUN_STATUS.FAILED,
                failedAt: FieldValue.serverTimestamp(),
                failureReason: "Free tier run limit reached",
            })

            return
        }


        logger.info(`Beginning script run (${event.data.after.id})`)

        await db.collection(SCRIPT_RUN_COLLECTION).doc(event.data.after.id).update({
            status: RUN_STATUS.RUNNING,
            startedAt: FieldValue.serverTimestamp(),
        })

        await pubsub.topic("run-script").publishMessage({
            data: Buffer.from(JSON.stringify({
                scriptRunId: event.data.after.id,
                scriptId: scriptRun.script.id,
            }))
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
