import { httpsCallable } from "firebase/functions"
import { useQuery } from "react-query"
import { fire } from "../firebase"
import { useScriptIdFromRouter } from "../util"


export function useBillingPortalUrl() {

    const scriptId = useScriptIdFromRouter()

    const query = useQuery({
        queryKey: ["billing-portal-url", scriptId],
        queryFn: () => httpsCallable(fire.functions, "onRequestStripeCustomerPortalSession")({ scriptId }),
        enabled: !!scriptId,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    return [query?.data?.data, query]
}


export function useSetupIntent() {

    const query = useQuery({
        queryKey: ["create-setup-intent"],
        queryFn: () => httpsCallable(fire.functions, "onRequestStripeSetupIntent")(),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    return [query?.data?.data, query]
}


export function useCreateSubscription(intentId) {

    const scriptId = useScriptIdFromRouter()

    const query = useQuery({
        queryKey: ["create-subscription", intentId],
        queryFn: () => httpsCallable(fire.functions, "onRequestCreateStripeSubscription")({
            intentId,
            scriptId,
        }),
        enabled: !!intentId && !!scriptId,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    return query
}


export function useSubscription() {

    const scriptId = useScriptIdFromRouter()

    const query = useQuery({
        queryKey: ["subscription", scriptId],
        queryFn: () => httpsCallable(fire.functions, "onRequestSubscriptionForScript")({
            scriptId,
        }),
    })

    return [query?.data?.data, query]
}


export function usePaymentMethods() {

    const query = useQuery({
        queryKey: ["get-payment-methods"],
        queryFn: () => httpsCallable(fire.functions, "onRequestPaymentMethods")(),
    })

    return [query?.data?.data, query]
}