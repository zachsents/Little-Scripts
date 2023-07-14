import { ActionIcon, Group, Stack, Text, Title, Tooltip } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import { TriggerInfo, useSelectedTrigger } from "@web/modules/triggers"
import { useDeleteTrigger } from "@web/modules/util"
import { TbArrowLeft, TbTrash } from "react-icons/tb"
import ConfigPanel from "./ConfigPanel"

export default function SelectedTriggerConfig() {

    const trigger = useSelectedTrigger()
    const triggerInfo = TriggerInfo[trigger.type]

    const setSelectedTrigger = useMainStore(s => s.setSelectedTrigger)

    const [confirmDelete, deleteQuery] = useDeleteTrigger(trigger.id)

    return (
        <ConfigPanel title={
            <Group spacing="xs">
                <Tooltip label="Go back">
                    <ActionIcon onClick={() => setSelectedTrigger(null)}>
                        <TbArrowLeft />
                    </ActionIcon>
                </Tooltip>
                <Title order={4}>Configure Trigger</Title>
            </Group>
        }>
            <Stack spacing="xl">
                <Group noWrap className="bg-gray-100 rounded px-lg py-xs" position="apart">
                    <Group noWrap>
                        <triggerInfo.icon />
                        <Text fw="bold" color={triggerInfo.color}>{triggerInfo.name}</Text>
                    </Group>

                    <Tooltip label="Delete Trigger" withinPortal>
                        <ActionIcon
                            onClick={confirmDelete} loading={deleteQuery.isFetching}
                            className="hover:bg-gray-200"
                        >
                            <TbTrash />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <triggerInfo.config trigger={trigger} />
            </Stack>
        </ConfigPanel>
    )
}
