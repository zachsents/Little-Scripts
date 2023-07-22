import { DocumentReference } from "firebase-admin/firestore"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { SCRIPT_COLLECTION, SCRIPT_RUN_COLLECTION, SOURCE_FILE_PATH, STARTER_CODE, TRIGGER_COLLECTION } from "shared"
import { db, storage } from "./init.js"


export const generateScriptReport = onSchedule("every day 20:00", async () => {

    const scriptsSnapshot = await db.collection(SCRIPT_COLLECTION).get()

    const records = await Promise.all(
        scriptsSnapshot.docs.map(async scriptDoc => {
            const data = {}

            Object.entries(scriptDoc.data()).forEach(([key, value]) => {
                if (value?.toDate)
                    data[key] = value.toDate().toLocaleString().replaceAll(",", "")

                if (value instanceof DocumentReference)
                    data[key] = value.id

                if (typeof value === "string")
                    data[key] = value.match(/.{0,100}/)?.[0] ?? ""

                if (typeof value === "object")
                    return

                data[key] = value
            })

            const [sourceBuffer] = await storage.bucket().file(SOURCE_FILE_PATH(scriptDoc.id)).download()
            data.hasUniqueSource = sourceBuffer.toString() != STARTER_CODE

            await db.collection(SCRIPT_RUN_COLLECTION)
                .where("script", "==", scriptDoc.ref)
                .count().get()
                .then(snap => data.runCount = snap.data().count)

            await db.collection(TRIGGER_COLLECTION)
                .where("script", "==", scriptDoc.ref)
                .count().get()
                .then(snap => data.triggerCount = snap.data().count)

            await db.collection(SCRIPT_RUN_COLLECTION)
                .where("script", "==", scriptDoc.ref)
                .orderBy("startedAt", "desc")
                .limit(1).get()
                .then(snap => data.lastRanAt = snap.docs[0]?.data().startedAt.toDate().toLocaleString().replaceAll(",", "") ?? "never")

            return data
        })
    )

    const csvData = recordsToCSV(records)

    await db.collection("outbound-mail").add({
        to: ["info@littlescript.io", "zachsents@gmail.com"],
        message: {
            subject: `[LittleScript] Script Report - ${new Date().toLocaleDateString()}`,
            text: "Here's your daily report 🔥",
            attachments: [
                {
                    filename: `script_report_${new Date().toLocaleDateString().replaceAll("/", "-")}.csv`,
                    content: csvData,
                    contentType: "text/csv",
                },
            ]
        }
    })
})


/**
 * @param {Array<Object.<string, *>>} records
 */
function recordsToCSV(records) {
    const headers = records.reduce((acc, cur) => {
        Object.keys(cur).forEach(key => {
            if (!acc.includes(key))
                acc.push(key)
        })
        return acc
    }, [])

    const titleHeaders = headers.map(
        header => header
            .replaceAll(/([A-Z])/g, " $1")
            .replace(/^./, str => str.toUpperCase())
    )
    const rows = [titleHeaders.join(",")]

    records.forEach(record => {
        const row = headers.map(header => record[header])
        rows.push(row.join(","))
    })

    return Buffer.from(rows.join("\n"))
}