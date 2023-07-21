import fs from "fs"
import path from "path"

const triggerData = JSON.parse(
    fs.readFileSync(path.join(process.env.PWD, "triggerData.json"), "utf-8")
)

export const Request = triggerData.request

export class Response {

    statusCode = 200
    response = ""

    static status(statusCode) {
        return new Response().status(statusCode)
    }

    static send(body) {
        return new Response().send(body)
    }

    status(statusCode) {
        this.statusCode = statusCode
        return this
    }

    send(body) {
        this.body = body

        const response = {
            statusCode: this.statusCode,
            body: this.body,
        }

        try {
            var fileContent = JSON.stringify(response)
        } catch (err) {
            throw new Error(`Response must be serializable to JSON. Invalid response: ${response}`)
        }

        fs.writeFileSync(path.join(process.env.PWD, "url.response.json"), fileContent)
    }
}