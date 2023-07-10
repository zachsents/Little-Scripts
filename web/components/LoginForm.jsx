import { Button, PasswordInput, Stack, Text, TextInput, Title, useMantineTheme } from "@mantine/core"
import React from "react"
import { TbEye, TbEyeOff } from "react-icons/tb"
import { FcGoogle } from "react-icons/fc"
import { useForm } from "@mantine/form"


export default function LoginForm() {

    const theme = useMantineTheme()

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

    return (
        <form>
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

                <Button type="submit">Sign in</Button>

                <Text color="dimmed" align="center">or</Text>

                <Button
                    variant="white" color="dark"
                    leftIcon={<FcGoogle />} className="base-border hover:bg-gray-100"
                >
                    Sign in with Google
                </Button>
            </Stack>
        </form>
    )
}
