import { Center, Loader, Stack } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire } from "@web/modules/firebase"
import { httpsCallable } from "firebase/functions"
import { useRouter } from "next/router"
import { useQuery } from "react-query"
import { useUser } from "reactfire"
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator"


const randomName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    style: "capital",
    length: 2,
})


export default function CreatePage() {

    const router = useRouter()
    const { status: userStatus } = useUser()

    useQuery({
        queryKey: ["create-script", router.query.idemp],
        queryFn: async () => {
            const { data: { scriptId } } = await httpsCallable(fire.functions, "onRequestCreateScript")({
                name: randomName(),
            })

            router.replace(`/script/${scriptId}`)
        },
        enabled: userStatus === "success",
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
                <Loader />
            </Center>
        </Stack>
    )
}
