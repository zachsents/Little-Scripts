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
const exec = promisify(execCallback)


// Firebase setup
initializeApp({
    credential: applicationDefault(),
})


// Express setup
const app = express()
app.use(express.json())


/**
 * @typedef {object} ScriptRunRequestBody
 * 
 * @property {string} sourceUrl The URL of the script's source file. Must be a Google Storage URL.
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

    // TO DO: download script file from script document in Firestore -- make optional.
    // not sure if I want to do this yet for the sake of decoupling

    const { host: bucketName, pathname: filePath } = new URL(messageContent.sourceUrl)
    await getStorage().bucket(bucketName).file(filePath.slice(1)).download({
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