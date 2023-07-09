import { Anchor, Group } from "@mantine/core"
import Brand from "./Brand"

export default function CreateHeader() {

    return (
        <div className="px-xl py-xs">
            <Group position="apart" className="w-full">
                <Group>
                    <Brand />
                    <Anchor href="/create">Create New Script</Anchor>
                    <Anchor href="/create">About</Anchor>
                    <Anchor href="/create">Pricing</Anchor>
                </Group>

                <Group>
                    <Anchor href="/create">Sign In</Anchor>
                </Group>
            </Group>
        </div>
    )
}
