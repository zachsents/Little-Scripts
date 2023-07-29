import { Button, Group, Space, Switch, Text, Tooltip } from "@mantine/core"
import { useColorScheme } from "@web/modules/color-scheme"
import { TbHeart, TbMoonStars, TbSun } from "react-icons/tb"
import Brand from "./Brand"
import NavLink from "./NavLink"
import ScriptListPopover from "./ScriptListPopover"


export default function CreateHeader() {

    const [colorScheme, setColorScheme] = useColorScheme()

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
                    <Tooltip label={<Group>
                        <Text>{`Switch to ${colorScheme === "dark" ? "light" : "dark"} mode`}</Text>
                        <Text color="dimmed">Ctrl + J</Text>
                    </Group>}>
                        <div>
                            <Switch
                                size="md"
                                checked={colorScheme === "dark"}
                                onChange={event => setColorScheme(event.currentTarget.checked ? "dark" : "light")}
                                color="gray"
                                onLabel={<TbMoonStars className="text-md text-blue" />}
                                offLabel={<TbSun className="text-md text-yellow" />}
                            />
                        </div>
                    </Tooltip>
                    <Space w="1rem" />
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
