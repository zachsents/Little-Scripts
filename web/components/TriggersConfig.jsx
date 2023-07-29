import { Button, Group, Loader, Popover, ScrollArea, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { fire, useScript } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { TriggerInfo } from "@web/modules/triggers"
import { addDoc, collection, doc } from "firebase/firestore"
import { TbArrowUp, TbPlus } from "react-icons/tb"
import { useQuery } from "react-query"
import { TRIGGER_COLLECTION, TRIGGER_TYPE } from "shared"
import ConfigPanel from "./ConfigPanel"
import TriggerConfigCard from "./TriggerConfigCard"
import { logEvent } from "firebase/analytics"


export default function TriggersConfig() {

    const { script } = useScript()

    const [popoverOpened, popover] = useDisclosure(false)

    return (
        <ConfigPanel title="Triggers" rightSection={
            <Popover
                shadow="sm" withinPortal
                opened={popoverOpened} onOpen={popover.open} onClose={popover.close}
            >
                <Popover.Target>
                    <Button
                        compact leftIcon={<TbPlus />}
                        onClick={popover.open}
                    >
                        New Trigger
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <Stack w="20rem" spacing="sm">
                        <Text color="dimmed" size="sm">Select a trigger type</Text>

                        <ScrollArea.Autosize mah="20rem" offsetScrollbars scrollbarSize={6}>
                            <Stack spacing={0}>
                                {Object.values(TRIGGER_TYPE)
                                    .filter(type => TriggerInfo[type].allowMultiple || !script?.triggers?.some(t => t.type === type))
                                    .map(type =>
                                        <TriggerTypeButton
                                            type={type}
                                            onCreate={popover.close}
                                            key={type}
                                        />
                                    )}
                            </Stack>
                        </ScrollArea.Autosize>
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        }>
            <Stack>
                {script?.triggers?.map(trigger =>
                    <TriggerConfigCard trigger={trigger} key={trigger.id} />
                )}

                {!script?.triggers?.length &&
                    <Text color="dimmed" size="sm" align="center">
                        No triggers. Create one! <TbArrowUp />
                    </Text>}
            </Stack>
        </ConfigPanel>
    )
}


function TriggerTypeButton({ type, onCreate }) {

    const triggerInfo = TriggerInfo[type]

    const { script } = useScript()
    const setSelectedTrigger = useMainStore(s => s.setSelectedTrigger)

    const createQuery = useQuery({
        queryKey: ["create-trigger", type],
        queryFn: async () => {
            const newDocRef = await addDoc(collection(fire.db, TRIGGER_COLLECTION), {
                type,
                script: doc(fire.db, "scripts", script.id),
            })
            setSelectedTrigger(newDocRef.id)
            onCreate?.()
            logEvent(fire.analytics, "create_trigger", { type })
        },
        enabled: false,
    })

    return (
        <button
            onClick={createQuery.refetch}
            className="px-lg py-xs rounded border-none bg-transparent cursor-pointer bg- hover:bg-gray-100 dark:hover:bg-dark-500"
            disabled={createQuery.isFetching}
        >
            <Group noWrap>
                {createQuery.isFetching ?
                    <Loader size="xs" /> :
                    <triggerInfo.icon />}
                <Stack spacing={0} align="flex-start" className="flex-1">
                    <Text ta="left" fw="bold">
                        {triggerInfo.name}
                    </Text>
                    <Text ta="left" size="sm" color="dimmed">
                        {triggerInfo.description}
                    </Text>
                </Stack>
            </Group>
        </button>
    )
}