import { ActionIcon, Center, Container, Group, Menu, Stack, Text, Title } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire } from "@web/modules/firebase"
import { useLocalScripts } from "@web/modules/util/local-scripts"
import { doc, getDoc } from "firebase/firestore"
import Link from "next/link"
import { TbArrowRight, TbDots, TbFileDescription, TbHome, TbScript } from "react-icons/tb"
import { useQuery } from "react-query"
import { useFirestoreDocData, useUser } from "reactfire"
import { SCRIPT_COLLECTION, USER_COLLECTION } from "shared"

export default function ScriptsPage() {

    const { data: user } = useUser()

    const { data: userDoc } = useFirestoreDocData(doc(fire.db, USER_COLLECTION, user?.uid ?? "placeholder"))

    const { data: userScripts } = useQuery({
        queryKey: ["user-scripts", user, userDoc],
        queryFn: async () => {
            if (!user || !userDoc?.scripts)
                return

            const scriptsSnapshot = await Promise.all(userDoc.scripts.map(ref => getDoc(ref)))
            return scriptsSnapshot.map(doc => ({ id: doc.id, ...doc.data() }))
        },
    })

    const [localScriptIds] = useLocalScripts()

    const { data: localScripts } = useQuery({
        queryKey: ["local-scripts", localScriptIds],
        queryFn: async () => {
            if (!localScriptIds)
                return

            const scriptsSnapshot = await Promise.all(localScriptIds.map(id => getDoc(doc(fire.db, SCRIPT_COLLECTION, id))))
            return scriptsSnapshot.map(doc => ({ id: doc.id, ...doc.data() }))
        },
    })

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1">
                <Container size="sm" w="100%">
                    <Group grow>
                        {user &&
                            <Stack>
                                <Title order={2}>Your Scripts</Title>

                                {userScripts?.map(script =>
                                    <ScriptItem script={script} icon={TbScript} key={script.id} />
                                )}
                            </Stack>}

                        <Stack>
                            <Title order={3}>Local Scripts</Title>

                            {localScripts?.map(script =>
                                <ScriptItem script={script} icon={TbFileDescription} key={script.id} />
                            )}
                        </Stack>
                    </Group>
                </Container>
            </Center>
        </Stack>
    )
}


function ScriptItem({ icon: Icon, script }) {
    return (
        <Link href={`/script/${script.id}`} className="no-underline" key={script.id}>
            <Group className="hover:bg-gray-50 hover:text-primary cursor-pointer base-border rounded px-lg py-sm text-dark" position="apart">
                <Group>
                    <Icon />
                    <div>
                        <Text fw={500} >
                            {script.name}
                        </Text>
                        <Text size="xs" color="dimmed">
                            Created on {script.createdAt.toDate().toLocaleDateString()}
                        </Text>
                    </div>
                </Group>

                <Menu>
                    <Menu.Target>
                        <ActionIcon className="hover:bg-gray-200" onClick={event => event.stopPropagation()}>
                            <TbDots />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<TbArrowRight />}>
                            Open
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Link>
    )
}