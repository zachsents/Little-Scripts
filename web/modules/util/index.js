import { modals } from "@mantine/modals"
import { fire } from "@web/modules/firebase"
import { deleteDoc, doc } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"


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
        queryFn: () => deleteDoc(doc(fire.db, "triggers", triggerId)),
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