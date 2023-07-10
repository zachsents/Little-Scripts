import { collection, doc, query, where } from "firebase/firestore"
import { createContext, useContext } from "react"
import { useFirestoreCollectionData, useFirestoreDocData } from "reactfire"
import { fire, useStorageFileContent } from "."
import { useScriptIdFromRouter } from "../util"


const scriptContext = createContext({
    script: null,
    status: null,
})


export function ScriptProvider({ children }) {

    const scriptId = useScriptIdFromRouter()
    const scriptDocRef = doc(fire.db, "scripts", scriptId ?? "placeholder")

    const { data: scriptData, status: scriptStatus } = useFirestoreDocData(scriptDocRef, {
        idField: "id",
    })

    const [sourceCode] = useStorageFileContent(`script-source/${scriptId}.js`)

    const { data: triggers, status: triggersStatus } = useFirestoreCollectionData(query(
        collection(fire.db, "triggers"),
        where("script", "==", scriptDocRef)
    ), {
        idField: "id",
    })

    const { data: runs, status: runsStatus } = useFirestoreCollectionData(query(
        collection(fire.db, "script-runs"),
        where("script", "==", scriptDocRef)
    ), {
        idField: "id",
    })

    return (
        <scriptContext.Provider value={{
            script: {
                ...scriptData,
                sourceCode,
                triggers,
                runs,
            },
            isLoaded: scriptStatus === "success" &&
                triggersStatus === "success" &&
                runsStatus === "success" &&
                sourceCode !== undefined,
        }}>
            {children}
        </scriptContext.Provider>
    )
}


export function useScript() {
    return useContext(scriptContext)
}