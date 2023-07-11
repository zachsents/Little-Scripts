import { modals } from "@mantine/modals"
import { fire, useScript } from "@web/modules/firebase"
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { SCRIPT_COLLECTION, TRIGGER_COLLECTION } from "shared"


export function useScriptIdFromRouter() {
    const router = useRouter()
    return router.query.scriptId
}


export function useIsClient() {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => setIsClient(true), [])
    return isClient
}


export function useDeleteTrigger(triggerId) {
    const deleteQuery = useQuery({
        queryKey: ["delete-trigger", triggerId],
        queryFn: () => deleteDoc(doc(fire.db, TRIGGER_COLLECTION, triggerId)),
        enabled: false,
    })

    const confirmDelete = () => modals.openConfirmModal({
        title: "Are you sure you want to delete this trigger?",
        labels: { confirm: "Delete", cancel: "Keep it" },
        confirmProps: { color: "red" },
        onConfirm: deleteQuery.refetch,
    })

    return [confirmDelete, deleteQuery]
}


export function useDeleteScript() {

    const router = useRouter()
    const { script } = useScript()

    const deleteQuery = useQuery({
        queryKey: ["delete-script", script?.id],
        queryFn: async () => {
            const scriptDocRef = doc(fire.db, SCRIPT_COLLECTION, script?.id)

            const triggersSnapshot = await getDocs(query(
                collection(fire.db, TRIGGER_COLLECTION),
                where("script", "==", scriptDocRef)
            ))

            const batch = writeBatch(fire.db)
            triggersSnapshot.docs.forEach(doc => batch.delete(doc.ref))
            batch.delete(scriptDocRef)
            await batch.commit()
            router.push("/scripts")
        },
        enabled: false,
    })

    const confirmDelete = () => modals.openConfirmModal({
        title: "Are you sure you want to delete this script?",
        labels: { confirm: "Delete", cancel: "Keep it" },
        confirmProps: { color: "red" },
        onConfirm: deleteQuery.refetch,
    })

    return [confirmDelete, deleteQuery]
}


export function syncType(value, type, truthy, falsy) {
    if ((typeof value === type && value !== null) || (value === null && type == "null"))
        return typeof truthy === "function" ? truthy(value) : truthy

    return typeof falsy === "function" ? falsy(value) : falsy
}


export function useQueryWithPayload(fn, options = {}) {

    const [data, setData] = useState()

    const query = useQuery({
        queryFn: () => fn(data),
        enabled: false,

        ...options,
    })

    useEffect(() => {
        if (data !== undefined)
            query.refetch()
    }, [data])

    return [setData, query]
}