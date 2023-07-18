import { Button, Center, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import ScriptItem from "@web/components/ScriptRowItem"
import { useUserReady } from "@web/modules/firebase/auth"
import { useMyScripts } from "@web/modules/firebase/use-my-scripts"
import Link from "next/link"
import { TbPlus, TbScript } from "react-icons/tb"


export default function ScriptsPage() {

    const isUserReady = useUserReady()

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1" py="lg">
                <Stack align="center">
                    <Title order={2}>My Scripts</Title>

                    {isUserReady ?
                        <ScriptsPageInner /> :
                        <Center>
                            <Loader size="xs" />
                        </Center>}

                    <Button
                        component={Link} href="/create"
                        leftIcon={<TbPlus />}
                    >
                        Create New Script
                    </Button>
                </Stack>
            </Center>
        </Stack>
    )
}


function ScriptsPageInner() {

    const { data: scripts, status } = useMyScripts()

    return status == "loading" ?
        <Center>
            <Loader size="xs" />
        </Center> :
        scripts?.length > 0 ?
            <SimpleGrid miw="20rem" cols={scripts.length > 5 ? 2 : 1}>
                {scripts?.map(script =>
                    <ScriptItem script={script} icon={TbScript} key={script.id} />
                )}
            </SimpleGrid> :
            <Text color="dimmed" size="sm" align="center">
                No scripts
            </Text>
}
