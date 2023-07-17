import { collection, query, where } from "firebase/firestore"
import { useFirestoreCollectionData, useUser } from "reactfire"
import { SCRIPT_COLLECTION, STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { fire, useFirestoreCount } from "."


export function useMyScripts() {
    const { data: user } = useUser()

    const { data: subscriptions } = useFirestoreCollectionData(query(
        collection(fire.db, STRIPE_CUSTOMERS_COLLECTION, user?.uid ?? "placeholder", "subscriptions"),
        where("status", "==", "active")
    ), {
        idField: "id",
    })

    const { data: scripts, ...scriptsQuery } = useFirestoreCollectionData(query(
        collection(fire.db, SCRIPT_COLLECTION),
        where("owner", "==", user?.uid ?? "placeholder"),
    ), {
        idField: "id",
    })

    scripts?.forEach(script => {
        script.subscription = subscriptions?.find(sub => sub.metadata.scriptId == script.id)
    })

    return {
        data: scripts,
        ...scriptsQuery,
    }
}


export function useScriptCount() {
    const { data: user } = useUser()

    return useFirestoreCount(user?.uid && query(
        collection(fire.db, SCRIPT_COLLECTION),
        where("owner", "==", user.uid),
    ), {
        queryKey: `script-count-${user?.uid}`,
    })
}