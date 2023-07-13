import { Center, Group, Loader, Stack } from "@mantine/core"
import { openContextModal } from "@mantine/modals"
import CodeSection from "@web/components/CodeSection"
import ConfigSection from "@web/components/ConfigSection"
import CreateHeader from "@web/components/CreateHeader"
import { ScriptProvider, useScript } from "@web/modules/firebase"
import { useSyncRouterToStore } from "@web/modules/store/sync-router-to-store"
import { useIsClient, useScriptIdFromRouter } from "@web/modules/util"
import { useRouter } from "next/router"
import { useEffect } from "react"


export default function ScriptPage() {

    const scriptId = useScriptIdFromRouter()

    useSyncRouterToStore("tab", s => s.setConfigTab)

    const router = useRouter()
    useEffect(() => {
        if (router.query.billing == "success") {
            openContextModal({
                modal: "upgrade",
                title: "You've been upgraded!",
                innerProps: {
                    initialStep: 2,
                },
                onClose: () => {
                    router.replace({
                        pathname: router.pathname,
                        query: { scriptId },
                    }, undefined, { shallow: true })
                }
            })
        }
    }, [router.query.billing])

    return scriptId ?
        <ScriptProvider>
            <Stack spacing="xs" className="grow max-h-screen">
                <CreateHeader />
                <ScriptPageContent />
            </Stack>
        </ScriptProvider> :
        <Center className="grow">
            <Loader />
        </Center>
}


function ScriptPageContent() {

    const { isLoaded } = useScript()

    // Fixes hydration mismatch error
    const isClient = useIsClient()
    if (!isClient) return null

    return isLoaded ?
        <Group noWrap className="grow px-md pb-md" spacing="xs" align="stretch">
            <ConfigSection />
            <div className="flex-1">
                <CodeSection />
            </div>
        </Group> :
        <Center className="grow">
            <Loader />
        </Center>
}