import { exec as execCallback } from "child_process"
import "dotenv/config"
import express from "express"
import { applicationDefault, initializeApp } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { getFirestore } from "firebase-admin/firestore"
import path from "path"
import { fileURLToPath } from "url"
import { promisify } from "util"


// Constants
const PORT = 5050
const SCRIPT_DESTINATION = path.join(fileURLToPath(import.meta.url), "../../user-script/index.js")
const SCRIPT_SOURCE_PATH = scriptId => `script-source/${scriptId}.js`
const exec = promisify(execCallback)


// Firebase setup
initializeApp({
    credential: applicationDefault(),
    storageBucket: "little-scripts-391918.appspot.com",
})


// Express setup
const app = express()
app.use(express.json())


/**
 * @typedef {object} ScriptRunRequestBody
 * 
 * @property {string} [scriptId] The ID of the script. Also the name of the script's source file. Either use this or `sourceUrl`.
 * @property {string} [sourceUrl] The URL of the script's source file. Must be a Google Storage URL. If included, `scriptId` is ignored.
 * @property {string} [scriptRunId] The ID of the script run. Used to store the script's output and the run's status.
 */

app.post("/", async (req, res) => {

    const encodedMessage = req.body?.message?.data

    if (!encodedMessage)
        return res.status(400).send("Bad Request: Missing PubSub payload")

    /** @type {ScriptRunRequestBody} */
    const messageContent = JSON.parse(
        Buffer.from(encodedMessage, "base64").toString().trim()
    )

    let file
    if (messageContent.sourceUrl) {
        const { host: bucketName, pathname: filePath } = new URL(messageContent.sourceUrl)
        file = getStorage().bucket(bucketName).file(filePath.slice(1))
    }
    else {
        file = getStorage().bucket().file(SCRIPT_SOURCE_PATH(messageContent.scriptId))
    }

    await file.download({
        destination: SCRIPT_DESTINATION,
    })

    const { stdout, stderr } = await exec(`node ${SCRIPT_DESTINATION}`)

    if (messageContent.scriptRunId) {
        // WILO: fixing permissions for this
        await getFirestore().collection("script-runs").doc(messageContent.scriptRunId).set({
            stdout,
            stderr,
            status: "COMPLETED",
        }, { merge: true })

        return res.status(204).send()
    }

    res.send({
        stdout,
        stderr,
    })
})

app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})