import { Center, Loader, Stack } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire } from "@web/modules/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"


const randomName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    style: "capital",
})


export default function CreatePage() {

    const router = useRouter()

    const createScript = async () => {

        const newDocRef = await addDoc(
            collection(fire.db, "scripts"),
            {
                name: randomName(),
                createdAt: serverTimestamp(),
            }
        )

        router.replace(`/script/${newDocRef.id}`)
    }

    useEffect(() => {
        createScript()
    }, [])

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1">
                <Loader />
            </Center>
        </Stack>
    )
}
