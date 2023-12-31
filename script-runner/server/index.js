import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import express from "express"
import morgan from "morgan"
import fetch from "node-fetch"
import { PubSub } from "@google-cloud/pubsub"
import { FirestoreDataConverter } from "@zachsents/firestore-data-converter"
import "dotenv/config"
import { glob } from "glob"


// Constants
const PORT = 5050
const USER_SCRIPT_DIR = "/home/ls-user/script"
const USER_SCRIPT_INDEX_FILE = path.join(USER_SCRIPT_DIR, "index.js")
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
 * @property {string} sourceDownloadUrl The URL to download the script's source code from.
 * @property {string} logUploadUrl The URL to upload the script's logs to.
 */

app.post("/:scriptRunId", async (req, res) => {

    // console.debug("Recevied request\nHeaders:", req.headers, "\nBody:", req.body)
    console.debug(`Recevied script run request: ${req.params.scriptRunId},`, req.body)
    const scriptRunId = req.params.scriptRunId

    /** @type {ScriptRunRequestBody} */
    const requestBody = req.body?.data
    const { sourceDownloadUrl, logUploadUrl, triggerData } = requestBody

    const sourceCode = await fetch(sourceDownloadUrl).then(res => res.text())
    await fs.writeFile(USER_SCRIPT_INDEX_FILE, sourceCode)

    await fs.writeFile(
        path.join(USER_SCRIPT_DIR, "triggerData.json"),
        JSON.stringify(triggerData)
    )

    const logs = `Script running at ${new Date().toISOString()}\n\n`

    const result = await new Promise(resolve => {
        exec("node .", {
            cwd: USER_SCRIPT_DIR,
            uid: 1001,
            gid: 1001,
            env: {
                SCRIPT_RUN_ID: scriptRunId,
            },
        }, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr })
        })
    })

    await fetch(logUploadUrl, {
        method: "PUT",
        body: logs + result.stdout,
        headers: {
            "Content-Type": "text/plain",
        },
    })

    const responses = {}

    const responseFiles = await glob("*.response.json", {
        cwd: USER_SCRIPT_DIR,
        absolute: true,
    })

    await Promise.all(
        responseFiles.map(async responseFile => {
            const content = JSON.parse(await fs.readFile(responseFile, "utf-8"))
            const key = path.basename(responseFile, ".response.json")
            responses[key] = content
        })
    )

    const finishMessage = result.error ? {
        scriptRunId,
        status: "FAILED",
        runtimeError: new FirestoreDataConverter().toFirestore(result.error),
        stderr: result.stderr,
    } : {
        scriptRunId,
        status: "COMPLETED",
        responses,
    }

    await pubsub.topic(FINISH_SCRIPT_RUN_TOPIC).publishMessage({
        json: finishMessage,
    })

    res.status(204).send()
})


app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})