import { Timestamp, collection, doc, limit, orderBy, query, where } from "firebase/firestore"
import { createContext, useContext } from "react"
import { useFirestoreCollectionData, useFirestoreDocData } from "reactfire"
import { fire, useStorageFileContent } from "."
import { useScriptIdFromRouter } from "../util"
import { SCRIPT_COLLECTION, SCRIPT_RUN_COLLECTION, TRIGGER_COLLECTION, getLastBillingCycleStartDate } from "shared"
import { useFirestoreCount } from "./use-count-query"
import { useRouter } from "next/router"
import { useEffect } from "react"


const scriptContext = createContext({
    script: null,
    status: null,
})


export function ScriptProvider({ children }) {

    const router = useRouter()

    const scriptId = useScriptIdFromRouter()
    const scriptDocRef = doc(fire.db, SCRIPT_COLLECTION, scriptId ?? "placeholder")

    const { data: scriptData, status: scriptStatus } = useFirestoreDocData(scriptDocRef, {
        idField: "id",
    })

    useEffect(() => {
        if (scriptId && scriptStatus === "success" && !scriptData)
            router.replace("/")
    }, [scriptId, scriptData, scriptStatus])

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
                ref: scriptDocRef,
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