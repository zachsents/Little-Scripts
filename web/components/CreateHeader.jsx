import { Anchor, Group, Text } from "@mantine/core"
import Brand from "./Brand"
import Link from "next/link"

export default function CreateHeader() {

    return (
        <div className="px-xl py-xs">
            <Group position="apart" className="w-full">
                <Group>
                    <Brand />
                    <Link href="/create">
                        <Text>Create New Script</Text>
                    </Link>
                    <Anchor href="/">About</Anchor>
                    <Anchor href="/">Pricing</Anchor>
                </Group>

                <Group>
                    <Link href="/login">
                        <Text>Login</Text>
                    </Link>
                </Group>
            </Group>
        </div>
    )
}
