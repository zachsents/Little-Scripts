import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import express from "express"
import morgan from "morgan"
import fetch from "node-fetch"
import { PubSub } from "@google-cloud/pubsub"
import { FirestoreDataConverter } from "@zachsents/firestore-data-converter"
import "dotenv/config"


// Constants
const PORT = 5050
const USER_SCRIPT_PATH = "/user-script/index.js"
const FINISH_SCRIPT_RUN_TOPIC = "finish-script-run"

// PubSub setup
const pubsub = new PubSub()

// Express setup
const app = express()
app.use(express.json())
app.use(morgan("short"))


/**
 * @typedef {object} ScriptRunRequestBody
 * 
 * @property {string} scriptRunId The ID of the script run. Used to store the script's output and the run's status.
 * @property {string} sourceDownloadUrl The URL to download the script's source code from.
 * @property {string} logUploadUrl The URL to upload the script's logs to.
 */


app.post("/", async (req, res) => {

    const encodedMessage = req.body?.message?.data

    if (!encodedMessage)
        return res.status(400).send("Bad Request: Missing PubSub payload")

    /** @type {ScriptRunRequestBody} */
    const messageContent = JSON.parse(
        Buffer.from(encodedMessage, "base64").toString().trim()
    )
    const { scriptRunId, sourceDownloadUrl, logUploadUrl } = messageContent

    console.debug(messageContent)

    const sourceCode = await fetch(sourceDownloadUrl).then(res => res.text())

    await fs.writeFile(USER_SCRIPT_PATH, sourceCode)

    const result = await new Promise(resolve => {
        exec("node .", {
            cwd: path.dirname(USER_SCRIPT_PATH),
        }, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr })
        })
    })

    await fetch(logUploadUrl, {
        method: "PUT",
        body: `Script running at ${new Date().toISOString()}\n\n${result.stdout}`,
        headers: {
            "Content-Type": "text/plain",
        },
    })

    const finishMessage = result.error ? {
        scriptRunId,
        status: "FAILED",
        runtimeError: new FirestoreDataConverter().toFirestore(result.error),
        stderr: result.stderr,
    } : {
        scriptRunId,
        status: "COMPLETED",
    }

    await pubsub.topic(FINISH_SCRIPT_RUN_TOPIC).publishMessage({
        json: finishMessage,
    })

    res.status(204).send()
})


app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})