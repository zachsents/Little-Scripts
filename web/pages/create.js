import { Center, Loader, Stack, Text } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire } from "@web/modules/firebase"
import { useUserReady } from "@web/modules/firebase/auth"
import { logEvent } from "firebase/analytics"
import { httpsCallable } from "firebase/functions"
import { useRouter } from "next/router"
import { useQuery } from "react-query"
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator"


const randomName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    style: "capital",
    length: 2,
})


export default function CreatePage() {

    const router = useRouter()
    const isUserReady = useUserReady()

    useQuery({
        queryKey: ["create-script"],
        queryFn: async () => {

            const { data: { scriptId } } = await httpsCallable(fire.functions, "onRequestCreateScript")({
                name: randomName(),
            })

            logEvent(fire.analytics, "create_script", { scriptId })

            router.replace(`/script/${scriptId}`)
        },
        enabled: isUserReady,
        retry: false,
        retryOnMount: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1">
                <Stack align="center">
                    <Loader />
                    <Text size="sm" ta="center">
                        Creating script...
                    </Text>
                </Stack>
            </Center>
        </Stack>
    )
}
