import { Anchor, Group, Text } from "@mantine/core"
import { TbScript } from "react-icons/tb"


export default function Brand({ size = "xl" }) {

    return (
        <Anchor href="/" className="group text-primary-500 hover:no-underline">
            <Group fz={size} spacing="0.5em">
                <TbScript className="group-hover:fill-primary-50 group-hover:scale-125 transition" />
                <Text fw="bold" className="group-hover:text-primary transition">LittleScript</Text>
            </Group>
        </Anchor>
    )
}
