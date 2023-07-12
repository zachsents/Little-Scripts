import "dotenv/config"
import express from "express"
import { applicationDefault, initializeApp } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import util from "util"
import { NodeVM } from "vm2"
import { FirestoreDataConverter } from "@zachsents/firestore-data-converter"


// Constants
const PORT = 5050
const SCRIPT_SOURCE_PATH = scriptId => `script-source/${scriptId}.js`
const ALLOWED_MODULES = JSON.parse(await fs.readFile(path.join(fileURLToPath(import.meta.url), "../allowed-dependencies.json")))
const LOG_LEVELS = ["debug", "log", "info", "warn", "error"]
const LOG_PREFIX_LENGTH = Math.max(...LOG_LEVELS.map(level => level.length))


// Firebase setup
initializeApp({
    credential: applicationDefault(),
    storageBucket: "little-scripts-391918.appspot.com",
})
const db = getFirestore()
db.settings({
    ignoreUndefinedProperties: true,
})
const storage = getStorage()


// Express setup
const app = express()
app.use(express.json())


/**
 * @typedef {object} ScriptRunRequestBody
 * 
 * @property {string} [scriptId] The ID of the script. Also the name of the script's source file. Either use this or `sourceUrl`.
 * @property {string} [sourceUrl] The URL of the script's source file. Must be a Google Storage URL. If included, `scriptId` is ignored.
 * @property {string} scriptRunId The ID of the script run. Used to store the script's output and the run's status.
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
        file = storage.bucket(bucketName).file(filePath.slice(1))
    }
    else {
        file = storage.bucket().file(SCRIPT_SOURCE_PATH(messageContent.scriptId))
    }

    const fileContents = await file.download()

    let executionPromise
    let returnValue
    let runtimeError
    const promises = []

    const vm = new NodeVM({
        console: "redirect",
        sandbox: {
            LittleScript: {
                waitFor: promise => {
                    promises.push(promise)
                },
                // TO DO: add functions to return values, store values, etc.
            },
            _wrapper: (promise) => {
                executionPromise = promise
                    .then(result => (returnValue = result))
                    .catch(err => {
                        runtimeError = Object.fromEntries(Object.getOwnPropertyNames(err).map(key => [key, err[key]]))
                    })
            }
        },
        require: {
            external: ALLOWED_MODULES,
            builtin: ["*"],
        },
        env: {},
    })

    const logStream = storage.bucket().file(`script-run-logs/${messageContent.scriptRunId}.log`).createWriteStream()
    const logsFinishedUploading = new Promise(resolve => logStream.on("finish", resolve))
    logStream.write(`Script running at ${new Date().toISOString()}\n\n`)

    LOG_LEVELS.forEach(level => {
        vm.on(`console.${level}`, (...args) => {

            const prefix = `${" ".repeat(LOG_PREFIX_LENGTH - level.length)}[${level}]`

            const formattedArgs = args.map(arg => {
                if (typeof arg === "string")
                    return arg

                return util.inspect(arg)
            })

            logStream.write(`${prefix} ${formattedArgs.join(" ")}\n`)
        })
    })

    vm.run(`
_wrapper((async function() {
    ${fileContents.toString()}
})())
    `, "user-script.js")

    await Promise.all([executionPromise, ...promises])

    logStream.end()
    await logsFinishedUploading

    const documentUpdate = runtimeError ? {
        status: "FAILED",
        failedAt: FieldValue.serverTimestamp(),
        failureReason: "Runtime error",
        runtimeError,
    } : {
        status: "COMPLETED",
        completedAt: FieldValue.serverTimestamp(),
        returnValue,
    }

    await db.collection("script-runs").doc(messageContent.scriptRunId)
        .withConverter(new FirestoreDataConverter())
        .set(documentUpdate, { merge: true })

    res.status(204).send()
})

app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})