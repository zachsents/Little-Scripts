import { Center, Loader, Popover, ScrollArea, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useMyScripts } from "@web/modules/firebase/use-my-scripts"
import { TbScript } from "react-icons/tb"
import ScriptItem from "./ScriptRowItem"

export default function ScriptListPopover({ children }) {

    const [opened, handlers] = useDisclosure(false)
    const { data: scripts, status } = useMyScripts()

    return (
        <Popover
            shadow="sm" withinPortal
            opened={opened} onOpen={handlers.open} onClose={handlers.close}
        >
            <Popover.Target>
                <div onClick={handlers.toggle}>
                    {children}
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack w="20rem" spacing="sm">
                    <Text color="dimmed" size="sm">All Scripts</Text>

                    <ScrollArea.Autosize mah="20rem" offsetScrollbars scrollbarSize={6}>
                        <Stack spacing="xs">
                            {status == "loading" ?
                                <Center>
                                    <Loader size="xs" />
                                </Center> :
                                scripts?.length == 0 ?
                                    <Text color="dimmed" size="sm" align="center">No scripts</Text> :
                                    scripts?.map(script =>
                                        <ScriptItem script={script} icon={TbScript} onOpen={handlers.close} key={script.id} />
                                    )}
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}
