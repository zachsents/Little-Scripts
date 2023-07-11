import { ActionIcon, Group, Menu, Text } from "@mantine/core"
import Link from "next/link"
import { TbArrowRight, TbDots } from "react-icons/tb"


export default function ScriptItem({ icon: Icon, script }) {
    return (
        <Link href={`/script/${script.id}`} className="no-underline" key={script.id}>
            <Group className="hover:bg-gray-50 hover:text-primary cursor-pointer base-border rounded px-lg py-sm text-dark" position="apart">
                <Group>
                    <Icon />
                    <div>
                        <Text fw={500} >
                            {script.name}
                        </Text>
                        <Text size="xs" color="dimmed">
                            Created on {script.createdAt.toDate().toLocaleDateString()}
                        </Text>
                    </div>
                </Group>

                <Menu>
                    <Menu.Target>
                        <ActionIcon className="hover:bg-gray-200" onClick={event => event.stopPropagation()}>
                            <TbDots />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<TbArrowRight />}>
                            Open
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Link>
    )
}