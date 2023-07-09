import { Group, Stack } from "@mantine/core"
import CodeSection from "@web/components/CodeSection"
import ConfigSection from "@web/components/ConfigSection"
import CreateHeader from "@web/components/CreateHeader"


export default function CreatePage() {
    return (
        <Stack spacing="xs" className="grow max-h-screen">
            <CreateHeader />
            <Group className="grow px-md pb-md" spacing="xs" align="stretch">
                <ConfigSection />
                <CodeSection />
            </Group>
        </Stack>
    )
}