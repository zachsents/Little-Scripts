import { FieldValue } from "firebase-admin/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { RUN_STATUS, SCRIPT_RUN_COLLECTION, TRIGGER_COLLECTION, isStatusFinished } from "shared"
import { db } from "./init.js"


export const onRequestAsyncUrlTrigger = onRequest({
    cors: false,
}, async (req, res) => {
    await beginUrlTrigger(req)
    res.status(202).send()
})


export const onRequestSyncUrlTrigger = onRequest({
    cors: false,
}, async (req, res) => {

    const scriptRunRef = await beginUrlTrigger(req)

    const { statusCode, body } = await new Promise(resolve => {
        scriptRunRef.onSnapshot(snapshot => {
            const data = snapshot.data()
            if (isStatusFinished(data.status))
                resolve(data.responses.url ?? {
                    statusCode: 204,
                    body: undefined,
                })
        })
    })

    res.status(statusCode).send(body)
})


async function beginUrlTrigger(req) {

    const { t: triggerId, ...reqQuery } = req.query

    const triggerRef = db.collection(TRIGGER_COLLECTION).doc(triggerId)
    const trigger = await triggerRef.get().then(doc => doc.data())

    return db.collection(SCRIPT_RUN_COLLECTION).add({
        script: trigger.script,
        trigger: triggerRef,
        status: RUN_STATUS.PENDING,
        queuedAt: FieldValue.serverTimestamp(),
        triggerData: {
            request: {
                method: req.method,
                headers: req.headers,
                query: reqQuery,
                body: req.body,
            }
        }
    })
}