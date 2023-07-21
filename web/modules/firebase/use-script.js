import { collection, doc, limit, orderBy, query, where } from "firebase/firestore"
import { useRouter } from "next/router"
import { createContext, useContext, useEffect } from "react"
import { useFirestoreCollectionData, useFirestoreDocData } from "reactfire"
import { SCRIPT_COLLECTION, SCRIPT_RUN_COLLECTION, SCRIPT_RUN_LOAD_LIMIT, SOURCE_FILE_PATH, TRIGGER_COLLECTION } from "shared"
import { fire, useStorageFileContent } from "."
import { useScriptIdFromRouter } from "../util"
import { useScriptUsage, useSubscription } from "../stripe"


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

    const [sourceCode] = useStorageFileContent(scriptId && SOURCE_FILE_PATH(scriptId))

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
        limit(SCRIPT_RUN_LOAD_LIMIT),
    ), {
        idField: "id",
    })

    const [subscription, subscriptionQuery] = useSubscription()
    const [usage, usageQuery] = useScriptUsage()

    return (
        <scriptContext.Provider value={{
            script: {
                ...scriptData,
                ref: scriptDocRef,
                sourceCode,
                triggers,
                runs,
                subscription,
                usage,
            },
            isLoaded: scriptStatus === "success" &&
                triggersStatus === "success" &&
                runsStatus === "success" &&
                subscriptionQuery.status === "success" &&
                usageQuery.isSuccess &&
                sourceCode !== undefined,
        }}>
            {children}
        </scriptContext.Provider >
    )
}


export function useScript() {
    return useContext(scriptContext)
}