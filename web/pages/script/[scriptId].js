import { Center, Group, Loader, Stack } from "@mantine/core"
import CodeSection from "@web/components/CodeSection"
import ConfigSection from "@web/components/ConfigSection"
import CreateHeader from "@web/components/CreateHeader"
import { ScriptProvider, useScript } from "@web/modules/firebase"
import { useIsClient } from "@web/modules/util"


export default function ScriptPage() {

    return (
        <ScriptProvider>
            <Stack spacing="xs" className="grow max-h-screen">
                <CreateHeader />
                <ScriptPageContent />
            </Stack>
        </ScriptProvider>
    )
}


function ScriptPageContent() {

    const { isLoaded } = useScript()

    // Fixes hydration mismatch error
    const isClient = useIsClient()
    if (!isClient) return null

    return isLoaded ?
        <Group className="grow px-md pb-md" spacing="xs" align="stretch">
            <ConfigSection />
            <CodeSection />
        </Group> :
        <Center className="grow">
            <Loader />
        </Center>
}