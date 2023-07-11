import { Center } from "@mantine/core"
import LoginForm from "@web/components/LoginForm"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useUser } from "reactfire"


export default function LoginPage() {

    const router = useRouter()
    const { data: user } = useUser()

    useEffect(() => {
        if (user)
            router.push("/scripts")
    }, [user])

    return (
        <Center className="w-screen h-screen">
            <LoginForm redirectOnLogin="/scripts" />
        </Center>
    )
}
