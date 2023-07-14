import { Group } from "@mantine/core"
import Brand from "./Brand"
import NavLink from "./NavLink"
import ScriptListPopover from "./ScriptListPopover"


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
                    <ScriptListPopover>
                        <NavLink>
                            My Scripts
                        </NavLink>
                    </ScriptListPopover>
                    <NavLink href="/create">
                        Create New Script
                    </NavLink>
                </Group>
            </Group>
        </div>
    )
}
