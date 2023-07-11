import { Center, Loader, Stack } from "@mantine/core"
import CreateHeader from "@web/components/CreateHeader"
import { fire } from "@web/modules/firebase"
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/router"
import { useEffect, useMemo } from "react"
import { useUser } from "reactfire"
import { SCRIPT_COLLECTION } from "shared"
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator"


const randomName = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: " ",
    style: "capital",
})


export default function CreatePage() {

    const router = useRouter()
    const { data: user, status: userStatus } = useUser()

    const newScriptRef = useMemo(() => doc(collection(fire.db, SCRIPT_COLLECTION)), [])

    const createScript = async () => {

        console.debug("Creating script", newScriptRef.id)

        const success = await runTransaction(fire.db, async (t) => {
            const scriptDoc = await t.get(newScriptRef)

            if (scriptDoc.exists())
                return false

            t.set(newScriptRef, {
                name: randomName(),
                createdAt: serverTimestamp(),
                owner: user.uid,
            })

            return true
        })

        if (success)
            router.replace(`/script/${newScriptRef.id}`)
    }

    useEffect(() => {
        if (userStatus === "success" && user)
            createScript()
    }, [newScriptRef, userStatus, user])

    return (
        <Stack spacing={0} className="grow">
            <CreateHeader />
            <Center className="flex-1">
                <Loader />
            </Center>
        </Stack>
    )
}
