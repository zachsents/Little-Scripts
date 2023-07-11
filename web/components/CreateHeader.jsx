import { Avatar, Divider, Group, Menu, Text } from "@mantine/core"
import { openContextModal } from "@mantine/modals"
import { fire } from "@web/modules/firebase"
import { signOut } from "firebase/auth"
import Link from "next/link"
import { TbLogout } from "react-icons/tb"
import { useUser } from "reactfire"
import Brand from "./Brand"
import { useMemo } from "react"
import { collection, doc } from "firebase/firestore"
import { SCRIPT_COLLECTION } from "shared"


export default function CreateHeader() {

    const { data: user } = useUser()

    const creationId = useMemo(() => doc(collection(fire.db, SCRIPT_COLLECTION)).id)

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

                    <Divider orientation="vertical" />

                    <NavLink href="/scripts">
                        My Scripts
                    </NavLink>
                    <NavLink href={`/create?id=${creationId}`}>
                        Create New Script
                    </NavLink>
                </Group>

                <Group mr="xl">
                    {user ?
                        <Menu shadow="sm" position="bottom-end">
                            <Menu.Target>
                                <Group className="cursor-pointer hover:bg-gray-100 rounded-xl pl-xl">
                                    <Text color="dimmed">
                                        Hey{" "}
                                        <Text
                                            span color="primary.7" fw={500}
                                        >
                                            {user.displayName || user.email}
                                        </Text>
                                    </Text>
                                    <Avatar
                                        radius="xl" src={user.photoURL}
                                    />
                                </Group>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item icon={<TbLogout />} onClick={() => signOut(fire.auth)}>
                                    Sign Out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu> :
                        <NavLink
                            fw={500}
                            onClick={() => openContextModal({
                                modal: "login",
                            })}
                        >
                            Sign In
                        </NavLink>}
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