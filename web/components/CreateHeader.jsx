import { Group, Text } from "@mantine/core"
import Link from "next/link"
import Brand from "./Brand"


export default function CreateHeader() {

    return (
        <div className="px-xl py-xs">
            <Group position="apart" className="w-full">
                <Group>
                    <Brand />

                    <NavLink href="/about" color="dimmed">
                        About
                    </NavLink>
                    <NavLink href="/pricing" color="dimmed">
                        Pricing
                    </NavLink>
                </Group>

                <Group mr="xl">
                    <NavLink href="/scripts">
                        My Scripts
                    </NavLink>
                    <NavLink href="create">
                        Create New Script
                    </NavLink>
                </Group>
            </Group>
        </div>
    )
}


function NavLink({ children, href, ...props }) {

    const textComponent =
        <Text className="cursor-pointer hover:text-primary-400 transition-colors" color="primary.7"  {...props}>
            {children}
        </Text>

    return href ?
        <Link href={href} className="no-underline">{textComponent}</Link> :
        textComponent
}