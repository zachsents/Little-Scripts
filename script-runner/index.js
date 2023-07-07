import "dotenv/config"
import express from "express"
import { applicationDefault, initializeApp } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { NodeVM } from "vm2"


// Constants
const PORT = 5050
const SCRIPT_SOURCE_PATH = scriptId => `script-source/${scriptId}.js`
const ALLOWED_MODULES = JSON.parse(await fs.readFile(path.join(fileURLToPath(import.meta.url), "../allowed-dependencies.json")))


// Firebase setup
initializeApp({
    credential: applicationDefault(),
    storageBucket: "little-scripts-391918.appspot.com",
})
const db = getFirestore()


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

    const fileContents = await file.download()

    const promises = []

    const vm = new NodeVM({
        console: "inherit",
        sandbox: {
            LittleScript: {
                waitFor: promise => {
                    promises.push(promise)
                },
                // TO DO: add functions to return values, store values, etc.
            },
        },
        require: {
            external: ALLOWED_MODULES,
            builtin: [],
        },
        env: {},
    })

    vm.run(`
LittleScript.waitFor((async function() {
    ${fileContents.toString()}
})())
    `, "user-script.js")

    await Promise.all(promises)

    if (messageContent.scriptRunId) {
        await db.collection("script-runs").doc(messageContent.scriptRunId).set({
            status: "COMPLETED",
            completedAt: FieldValue.serverTimestamp(),
        }, { merge: true })

        return res.status(204).send()
    }

    res.status(204).send()
})

app.listen(PORT, () => {
    console.log(`Container ready to receive requests on ${PORT}`)
})