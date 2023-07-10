import { ActionIcon, Group, Loader, Menu, Overlay, Stack, Text, Tooltip } from "@mantine/core"
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
                <Group
                    className="flex-1 px-lg py-xs rounded-lg bg-gray-50 cursor-pointer hover:text-primary transition-colors relative"
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
            </Tooltip>

            {isLoading ?
                <Loader size="xs" /> :
                <Menu shadow="xs" withinPortal>
                    <Menu.Target>
                        <ActionIcon
                            onClick={event => event.stopPropagation()}
                            className="hover:bg-gray-100"
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
                </Menu>}
        </Group>
    )
}
