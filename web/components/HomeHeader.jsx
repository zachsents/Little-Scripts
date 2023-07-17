import { ActionIcon, Anchor, Button, Drawer, Group, Stack, Text } from "@mantine/core"
import { TbGridDots, TbScript } from "react-icons/tb"
import NavLink from "./NavLink"
import Link from "next/link"
import { useDisclosure } from "@mantine/hooks"


export default function HomeHeader({ firstTime }) {

    const [drawerOpened, drawerHandlers] = useDisclosure(false)

    const navLinks = <>
        <NavLink href="#features" className="md:text-white">
            Features
        </NavLink>
        <NavLink href="#pricing" className="md:text-white">
            Pricing
        </NavLink>

        <Button
            variant="white" ml="xl"
            component={Link} href="/scripts"
            className="hover:bg-primary hover:text-white transition-colors hidden md:block"
        >
            {firstTime ? "Start for Free" : "Go to Scripts"}
        </Button>

        <Button
            component={Link} href="/scripts"
            className="md:hidden"
        >
            {firstTime ? "Start for Free" : "Go to Scripts"}
        </Button>
    </>

    return (
        <div className="px-xl py-md">
            <Group position="apart" className="w-full" noWrap>
                <Group>
                    <HomeBrand />
                </Group>

                <div className="md:hidden">
                    <ActionIcon size="xl" onClick={drawerHandlers.open}>
                        <TbGridDots className="text-3xl" />
                    </ActionIcon>
                </div>

                <Drawer position="right" className="md:hidden" opened={drawerOpened} onClose={drawerHandlers.close}>
                    <Stack>
                        {navLinks}
                    </Stack>
                </Drawer>

                <Group px="xl" className="hidden md:flex">
                    {navLinks}
                </Group>
            </Group>
        </div>
    )
}


export function HomeBrand() {
    return (
        <Anchor href="/" className="text-white hover:text-primary transition-colors hover:no-underline">
            <Group noWrap fz="1.75rem" spacing="0.5em">
                <TbScript />
                <Text fw="bold">LittleScript</Text>
            </Group>
        </Anchor>
    )
}