import { ActionIcon, Alert, Group, Menu, Overlay, Stack, Text, Tooltip } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import { TriggerInfo } from "@web/modules/triggers"
import { useDeleteTrigger } from "@web/modules/util"
import { TbDots, TbPencil, TbTrash } from "react-icons/tb"


export default function TriggerConfigCard({ trigger }) {

    const triggerInfo = TriggerInfo[trigger.type]

    const setSelectedTrigger = useMainStore(s => s.setSelectedTrigger)

    const [confirmDelete, deleteQuery] = useDeleteTrigger(trigger.id)

    const isLoading = deleteQuery.isFetching

    return (
        <Group position="apart" pr="xs" className={isLoading && "pointer-events-none"} noWrap>
            <Tooltip label="Edit Trigger" position="right" withinPortal>
                <Alert color="gray" className="group flex-1 px-lg py-xs rounded-lg cursor-pointer relative">
                    <Group
                        className="group-hover:text-primary transition-colors"
                        onClick={() => setSelectedTrigger(trigger.id)}
                        noWrap
                    >
                        <triggerInfo.icon />
                        <Stack spacing={0}>
                            <Text fw={500}>{triggerInfo.name}</Text>
                            {triggerInfo.renderSubtitle &&
                                <Text fz="sm" color="dimmed">
                                    <triggerInfo.renderSubtitle trigger={trigger} />
                                </Text>}
                        </Stack>
                        {isLoading &&
                            <Overlay className="rounded-lg" opacity={0.2} />}
                    </Group>
                </Alert>
            </Tooltip>

            <Menu shadow="xs" withinPortal>
                <Menu.Target>
                    <ActionIcon
                        onClick={event => event.stopPropagation()}
                        loading={isLoading}
                    >
                        <TbDots />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item icon={<TbPencil />} onClick={() => setSelectedTrigger(trigger.id)}>
                        Edit
                    </Menu.Item>
                    <Menu.Item icon={<TbTrash />} color="red" onClick={confirmDelete}>
                        Delete
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    )
}
