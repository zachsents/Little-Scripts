import { collection, query, where } from "firebase/firestore"
import { useFirestoreCollectionData, useUser } from "reactfire"
import { SCRIPT_COLLECTION, STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { fire } from "."

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
        where("owner", "==", user?.uid ?? "none"),
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