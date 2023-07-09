import { ActionIcon, Group, Menu, Stack, Text, Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import { TbClock, TbDots, TbPencil, TbTrash } from "react-icons/tb"

export default function TriggerConfigCard() {

    const confirmDelete = () => modals.openConfirmModal({
        title: "Are you sure you want to delete this trigger?",
        labels: { confirm: "Delete", cancel: "Keep it" },
        confirmProps: { color: "red" },
        onConfirm: () => console.log("TO DO: Delete Trigger"),
    })

    return (
        <Group position="apart" pr="xs">
            <Tooltip label="Edit Trigger" position="right" withinPortal>
                <Group className="grow px-lg py-xs rounded-lg bg-gray-50 cursor-pointer hover:text-primary transition-colors">
                    <TbClock />
                    <Stack spacing={0}>
                        <Text fw={500}>Schedule</Text>
                        <Text fz="sm" color="dimmed">Every 30 minutes</Text>
                    </Stack>
                </Group>
            </Tooltip>
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
                    <Menu.Item icon={<TbPencil />}>
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
