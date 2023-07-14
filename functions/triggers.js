import { onRequest } from "firebase-functions/v2/https"
import { db } from "./init.js"
import { RUN_STATUS, SCRIPT_RUN_COLLECTION, TRIGGER_COLLECTION, isStatusFinished } from "shared"


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

    await new Promise(resolve => {
        scriptRunRef.onSnapshot(snapshot => {
            if (isStatusFinished(snapshot.data().status))
                resolve()
        })
    })

    res.status(204).send()
})


async function beginUrlTrigger(req) {

    const { t: triggerId, ...reqQuery } = req.query

    const triggerRef = db.collection(TRIGGER_COLLECTION).doc(triggerId)
    const trigger = await triggerRef.get().then(doc => doc.data())

    return db.collection(SCRIPT_RUN_COLLECTION).add({
        script: trigger.script,
        trigger: triggerRef,
        status: RUN_STATUS.PENDING,
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