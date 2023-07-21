import { Button, Group } from "@mantine/core"
import { TbHeart } from "react-icons/tb"
import Brand from "./Brand"
import NavLink from "./NavLink"
import ScriptListPopover from "./ScriptListPopover"


export default function CreateHeader() {

    return (
        <div className="px-xl py-xs">
            <Group position="apart" className="w-full">
                <Group>
                    <Brand />

                    <NavLink href="/#features" color="dimmed">
                        Features
                    </NavLink>
                    <NavLink href="/#pricing" color="dimmed">
                        Pricing
                    </NavLink>
                </Group>

                <Group mr="xl">
                    <Button
                        component="a" href="https://forms.gle/ZFsNpxXLxjkDQ3J4A" target="_blank"
                        leftIcon={<TbHeart />}
                    >
                        Leave Feedback
                    </Button>
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
