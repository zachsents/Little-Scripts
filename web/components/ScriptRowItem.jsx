import { Group, Text } from "@mantine/core"
import Link from "next/link"
import { TbFile, TbScript } from "react-icons/tb"


const Icons = {
    paid: <TbScript className="text-xl fill-yellow" />,
    free: <TbFile className="text-xl stroke-dark-300" />,
}


export default function ScriptItem({ script, onOpen }) {

    const icon = Icons[script.subscription ? "paid" : "free"]

    return (
        <Link href={`/script/${script.id}`} className="no-underline" onClick={onOpen} key={script.id}>
            <Group className="group hover:bg-gray-50 cursor-pointer base-border rounded px-lg py-sm text-dark" position="apart">
                <Group>
                    {icon}
                    <div className="group-hover:text-primary">
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