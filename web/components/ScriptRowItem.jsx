import { Group, Text } from "@mantine/core"
import Link from "next/link"


export default function ScriptItem({ icon: Icon, script, onOpen }) {
    return (
        <Link href={`/script/${script.id}`} className="no-underline" onClick={onOpen} key={script.id}>
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

                {/* <Menu shadow="xs">
                    <Menu.Target>
                        <ActionIcon className="hover:bg-gray-200" onClick={event => {
                            event.stopPropagation()
                            event.preventDefault()
                        }}>
                            <TbDots />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<TbArrowRight />}>
                            Open
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu> */}
            </Group>
        </Link>
    )
}