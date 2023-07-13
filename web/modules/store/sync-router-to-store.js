import { useRouter } from "next/router"
import { useMainStore } from "."
import { useEffect } from "react"


export function useSyncRouterToStore(param, setterSelector, transform = x => x) {

    const router = useRouter()

    const setter = useMainStore(setterSelector)

    useEffect(() => {
        if (router.query[param]) {
            setter(transform(router.query[param]))
            removeParam(router, param)
        }
    }, [router.query[param]])
}


function removeParam(router, param) {

    const params = new URLSearchParams(router.query)
    params.delete(param)

    router.replace({
        pathname: router.pathname,
        query: params.toString()
    }, undefined, { shallow: true })
}