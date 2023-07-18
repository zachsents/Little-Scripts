import { Button, Center, Loader, Popover, ScrollArea, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useMyScripts } from "@web/modules/firebase/use-my-scripts"
import ScriptItem from "./ScriptRowItem"
import { TbPlus } from "react-icons/tb"
import { useUserReady } from "@web/modules/firebase/auth"


export default function ScriptListPopover({ children, ...props }) {

    const isUserReady = useUserReady()

    return isUserReady ?
        <ScriptListPopoverInner {...props}>{children}</ScriptListPopoverInner> :
        children
}


function ScriptListPopoverInner({ children, tab }) {

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
                                        <ScriptItem
                                            script={script}
                                            onOpen={handlers.close}
                                            tab={tab}
                                            key={script.id}
                                        />
                                    )}

                            <Button leftIcon={<TbPlus />}>
                                Create a Script
                            </Button>
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    )
}