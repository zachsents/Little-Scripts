import { Center, Loader, Stack } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire, updateOrCreateDoc } from "@web/modules/firebase"
import { addLocalScript } from "@web/modules/util/local-scripts"
import { arrayUnion, doc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useUser } from "reactfire"
import { SCRIPT_COLLECTION, USER_COLLECTION } from "shared"
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator"


const randomName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    style: "capital",
})


export default function CreatePage() {

    const router = useRouter()

    const { data: user, status } = useUser()

    const createScript = async () => {

        const newScriptRef = doc(fire.db, SCRIPT_COLLECTION, router.query.id)

        console.debug("Creating script", newScriptRef.id, "for user", user?.uid ?? "LOCAL")

        const batch = writeBatch(fire.db)
        batch.set(newScriptRef, {
            name: randomName(),
            createdAt: serverTimestamp(),
        })

        if (user?.uid) {
            const userDocRef = doc(fire.db, USER_COLLECTION, user?.uid)
            await updateOrCreateDoc(userDocRef, {
                scripts: arrayUnion(newScriptRef),
            }, batch)
        }
        else {
            addLocalScript(newScriptRef.id)
        }

        await batch.commit()

        router.replace(`/script/${newScriptRef.id}`)
    }

    useEffect(() => {
        if (status === "success" && router.query.id)
            createScript()
    }, [router.query.id, status])

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1">
                <Loader />
            </Center>
        </Stack>
    )
}
