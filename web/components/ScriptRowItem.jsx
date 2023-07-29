import { Group, Text } from "@mantine/core"
import Link from "next/link"
import { TbFile, TbScript } from "react-icons/tb"
import { PLAN, PRICE_ID_PLAN } from "shared"


const Icons = {
    [PLAN.FREE]: <TbFile className="text-xl stroke-dark-300" />,
    [PLAN.LITTLE]: <TbScript className="text-xl fill-yellow" />,
}


export default function ScriptItem({ script, onOpen, tab }) {

    const plan = PRICE_ID_PLAN[script.subscription.items[0].price.id]
    const icon = Icons[plan]

    return (
        <Link href={`/script/${script.id}${tab ? `?tab=${tab}` : ""}`} className="no-underline" onClick={onOpen} key={script.id}>
            <Group className="group hover:bg-gray-50 dark:hover:bg-dark-500 cursor-pointer base-border rounded px-lg py-sm text-dark dark:text-gray-300" position="apart">
                <Group>
                    {icon}
                    <div className="group-hover:text-primary">
                        <Text fw={500}>
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