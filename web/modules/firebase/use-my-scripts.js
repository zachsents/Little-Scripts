import { collection, query, where } from "firebase/firestore"
import { useFirestoreCollectionData, useUser } from "reactfire"
import { SCRIPT_COLLECTION } from "shared"
import { fire } from "."

export function useMyScripts() {
    const { data: user } = useUser()

    return useFirestoreCollectionData(query(
        collection(fire.db, SCRIPT_COLLECTION),
        where("owner", "==", user?.uid ?? "none"),
    ), {
        idField: "id",
    })
}