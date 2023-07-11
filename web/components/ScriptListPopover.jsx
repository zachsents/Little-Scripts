import { Center, Loader, Popover, ScrollArea, Stack, Text } from "@mantine/core"
import { fire } from "@web/modules/firebase"
import { collection, query, where } from "firebase/firestore"
import { TbScript } from "react-icons/tb"
import { useFirestoreCollectionData, useUser } from "reactfire"
import { SCRIPT_COLLECTION } from "shared"
import ScriptItem from "./ScriptRowItem"
import { useDisclosure } from "@mantine/hooks"

export default function ScriptListPopover({ children }) {

    const { data: user } = useUser()

    const [opened, handlers] = useDisclosure(false)

    const { data: scripts, status } = useFirestoreCollectionData(query(
        collection(fire.db, SCRIPT_COLLECTION),
        where("owner", "==", user?.uid ?? "none"),
    ), {
        idField: "id",
    })

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
