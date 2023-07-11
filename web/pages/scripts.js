import { Center, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import ScriptItem from "@web/components/ScriptRowItem"
import { useMyScripts } from "@web/modules/firebase/use-my-scripts"
import { TbScript } from "react-icons/tb"

export default function ScriptsPage() {

    const { data: scripts, status } = useMyScripts()

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1" py="lg">
                <Stack>
                    <Title order={2}>My Scripts</Title>

                    {status == "loading" ?
                        <Center>
                            <Loader size="xs" />
                        </Center> :
                        scripts?.length == 0 ?
                            <Text color="dimmed" size="sm" align="center">No scripts</Text> :
                            <SimpleGrid cols={2}>
                                {scripts?.map(script =>
                                    <ScriptItem script={script} icon={TbScript} key={script.id} />
                                )}
                            </SimpleGrid>}
                </Stack>
            </Center>
        </Stack>
    )
}
