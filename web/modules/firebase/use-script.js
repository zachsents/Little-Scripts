import { Timestamp, collection, doc, limit, orderBy, query, where } from "firebase/firestore"
import { createContext, useContext } from "react"
import { useFirestoreCollectionData, useFirestoreDocData } from "reactfire"
import { fire, useStorageFileContent } from "."
import { useScriptIdFromRouter } from "../util"
import { SCRIPT_COLLECTION, SCRIPT_RUN_COLLECTION, TRIGGER_COLLECTION, getLastBillingCycleStartDate } from "shared"
import { useFirestoreCount } from "./use-count-query"


const scriptContext = createContext({
    script: null,
    status: null,
})


export function ScriptProvider({ children }) {

    const scriptId = useScriptIdFromRouter()
    const scriptDocRef = doc(fire.db, SCRIPT_COLLECTION, scriptId ?? "placeholder")

    const { data: scriptData, status: scriptStatus } = useFirestoreDocData(scriptDocRef, {
        idField: "id",
    })

    const [sourceCode] = useStorageFileContent(scriptId && `script-source/${scriptId}.js`)

    const { data: triggers, status: triggersStatus } = useFirestoreCollectionData(query(
        collection(fire.db, TRIGGER_COLLECTION),
        where("script", "==", scriptDocRef)
    ), {
        idField: "id",
    })

    const { data: runs, status: runsStatus } = useFirestoreCollectionData(query(
        collection(fire.db, SCRIPT_RUN_COLLECTION),
        where("script", "==", scriptDocRef),
        orderBy("startedAt", "desc"),
        limit(100),
    ), {
        idField: "id",
    })

    const [existingRunsCount, existingRunsCountQuery] = useFirestoreCount(query(
        collection(fire.db, SCRIPT_RUN_COLLECTION),
        where("script", "==", scriptDocRef),
        where("startedAt", ">=", Timestamp.fromDate(getLastBillingCycleStartDate()))
    ), {
        queryKey: scriptId,
    })

    return (
        <scriptContext.Provider value={{
            script: {
                ...scriptData,
                sourceCode,
                triggers,
                runs,
                runCount: existingRunsCount,
            },
            isLoaded: scriptStatus === "success" &&
                triggersStatus === "success" &&
                runsStatus === "success" &&
                existingRunsCountQuery.isSuccess &&
                sourceCode !== undefined,
        }}>
            {children}
        </scriptContext.Provider>
    )
}


export function useScript() {
    return useContext(scriptContext)
}