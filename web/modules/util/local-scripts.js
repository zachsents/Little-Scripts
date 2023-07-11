import { useLocalStorage } from "@mantine/hooks"


export function addLocalScript(scriptId) {
    const localScripts = JSON.parse(global.localStorage.getItem("scripts") ?? "[]")
    localScripts.push(scriptId)
    global.localStorage.setItem("scripts", JSON.stringify(
        [...new Set(localScripts)]
    ))
}

export function removeLocalScript(scriptId) {
    const localScripts = JSON.parse(global.localStorage.getItem("scripts") ?? "[]")
    global.localStorage.setItem("scripts", JSON.stringify(
        [...new Set(localScripts.filter(id => id !== scriptId))]
    ))
}

export function useLocalScripts() {
    return useLocalStorage({
        key: "scripts",
        defaultValue: [],
    })
}