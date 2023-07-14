import { collection, query, where } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { useQuery } from "react-query"
import { useFirestoreCollectionData, useUser } from "reactfire"
import { STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { fire } from "../firebase"
import { useScriptIdFromRouter } from "../util"


export function useSetupIntent() {

    const { status } = useUser()

    const setupIntentQuery = useQuery({
        queryKey: ["create-setup-intent"],
        queryFn: () => httpsCallable(fire.functions, "onRequestStripeSetupIntent")(),
        enabled: status === "success",
        retryOnMount: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    return [setupIntentQuery?.data?.data, setupIntentQuery]
}


export function useSubscription() {

    const scriptId = useScriptIdFromRouter()
    const { data: user } = useUser()

    const subQuery = useFirestoreCollectionData(query(
        collection(fire.db, STRIPE_CUSTOMERS_COLLECTION, user?.uid ?? "placeholder", "subscriptions"),
        where("metadata.scriptId", "==", scriptId ?? "placeholder"),
    ), {
        idField: "id",
    })

    return [subQuery.data?.[0], subQuery]
}


export function usePaymentMethods() {

    const { data: user, status } = useUser()

    const pmQuery = useQuery({
        queryKey: ["get-payment-methods", user?.uid],
        queryFn: () => httpsCallable(fire.functions, "onRequestPaymentMethods")(),
        enabled: status === "success",
    })

    return [pmQuery?.data?.data, pmQuery]
}


export function useScriptUsage() {

    const scriptId = useScriptIdFromRouter()
    const { status } = useUser()

    const usageQuery = useQuery({
        queryKey: ["get-script-usage", scriptId],
        queryFn: () => httpsCallable(fire.functions, "onRequestScriptUsage")({
            scriptId,
        }),
        enabled: status === "success",
        refetchInterval: 10000,
    })

    return [usageQuery?.data?.data, usageQuery]
}