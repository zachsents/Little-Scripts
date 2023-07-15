import { Anchor, Button, Group, Text } from "@mantine/core"
import { TbScript } from "react-icons/tb"
import NavLink from "./NavLink"
import Link from "next/link"


export default function HomeHeader() {
    return (
        <div className="px-xl py-md">
            <Group position="apart" className="w-full">
                <Group>
                    <Anchor href="/" className="text-white hover:text-primary transition-colors hover:no-underline">
                        <Group fz="1.75rem" spacing="0.5em">
                            <TbScript />
                            <Text fw="bold">LittleScript</Text>
                        </Group>
                    </Anchor>
                </Group>

                <Group px="xl">
                    <NavLink href="/about" color="white">
                        About
                    </NavLink>
                    <NavLink href="/pricing" color="white">
                        Pricing
                    </NavLink>

                    <Button
                        variant="white" ml="xl"
                        component={Link} href="/scripts"
                        className="hover:bg-primary hover:text-white transition-colors"
                    >
                        Start for Free
                    </Button>
                </Group>
            </Group>
        </div>
    )
}
