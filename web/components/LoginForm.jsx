import { Alert, Button, PasswordInput, Stack, Text, TextInput, Title, useMantineTheme } from "@mantine/core"
import React from "react"
import { TbEye, TbEyeOff } from "react-icons/tb"
import { FcGoogle } from "react-icons/fc"
import { useForm } from "@mantine/form"
import { GoogleAuthProvider, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { fire } from "@web/modules/firebase"
import { useRouter } from "next/router"
import { useState } from "react"
import { useQuery } from "react-query"
import { useUser } from "reactfire"


const googleProvider = new GoogleAuthProvider()


export default function LoginForm({ redirectOnLogin, onLogin }) {

    const theme = useMantineTheme()
    const router = useRouter()

    const [error, setError] = useState()

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
        },
        validateInputOnBlur: true,
    })

    const submitQuery = useQuery({
        queryKey: ["submit", form.values.email, form.values.password],
        queryFn: async () => {
            try {
                const methods = await fetchSignInMethodsForEmail(fire.auth, form.values.email)
                const credential = methods.length > 0 ?
                    await signInWithEmailAndPassword(fire.auth, form.values.email, form.values.password) :
                    await createUserWithEmailAndPassword(fire.auth, form.values.email, form.values.password)

                if (redirectOnLogin)
                    router.push(redirectOnLogin)

                onLogin?.(credential)
            }
            catch (err) {
                setError(err.message.replace("Firebase: ", ""))
            }
        },
        enabled: false,
    })

    const signInWithGoogle = () => {
        signInWithPopup(fire.auth, googleProvider)
            .then(result => {
                const credential = GoogleAuthProvider.credentialFromResult(result)

                if (redirectOnLogin)
                    router.push(redirectOnLogin)

                onLogin?.(credential)
            })
            .catch(err => console.error(err))
    }

    const { data: user } = useUser()

    return user ?
        <Stack spacing="xs">
            <Text ta="center">You&apos;re signed in.</Text>
            <Text
                ta="center" size="sm" color="dimmed" className="cursor-pointer hover:text-dark transition-colors"
                onClick={() => fire.auth.signOut()}
            >
                Sign out?
            </Text>
        </Stack> :
        <form onSubmit={form.onSubmit(() => submitQuery.refetch())}>
            <Stack spacing="xl">
                <Stack spacing="xs">
                    <Title order={4} align="center">Sign in with your email</Title>
                    <Text color="dimmed" align="center" size="sm">If an account doesn&apos;t exist, one will be created.</Text>
                </Stack>

                <Stack spacing="sm">
                    <TextInput
                        type="email" placeholder="Email" required
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        placeholder="Password"
                        variant="filled" required
                        visibilityToggleIcon={({ reveal, size }) =>
                            reveal ? <TbEyeOff size={theme.fontSizes[size]} /> : <TbEye size={theme.fontSizes[size]} />
                        }
                        {...form.getInputProps("password")}
                    />
                </Stack>

                <Button type="submit" loading={submitQuery.isFetching}>Sign in</Button>

                {error &&
                    <Alert color="red">
                        <Text color="red.8">{error}</Text>
                    </Alert>}

                <Text color="dimmed" align="center">or</Text>

                <Button
                    variant="white" color="dark" type="button"
                    leftIcon={<FcGoogle />} className="base-border hover:bg-gray-100"
                    onClick={signInWithGoogle}
                >
                    Sign in with Google
                </Button>
            </Stack>
        </form>
}
