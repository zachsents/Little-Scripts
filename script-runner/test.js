import { NodeVM } from "vm2"
import util from "util"

const vm = new NodeVM({
    console: "redirect",
    sandbox: {
    },
    require: {
        external: true,
        builtin: [],
    },
    env: {},
})

let logs = []
const logLevels = ["debug", "log", "info", "warn", "error"]
const prefixLength = Math.max(...logLevels.map(level => level.length))

logLevels.forEach(level => {
    vm.on(`console.${level}`, (...args) => {

        logs.push(`${" ".repeat(prefixLength - level.length)}[${level}] ${args.map(arg => {
            if (typeof arg === "string")
                return arg

            return util.inspect(arg)
        }).join(" ")}`)
    })
})

vm.run(`
console.log("Hello world!")
console.debug("Hello debug!")
console.info("Hello info!", 5, { a: 1, b: {c:4}, d: [1, 2, 3] })
console.log("Hello world again!")
`)


console.log(logs.join("\n"))