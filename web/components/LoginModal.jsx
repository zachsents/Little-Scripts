import { Stack } from "@mantine/core"
import LoginForm from "./LoginForm"

export default function LoginModal({ context, id }) {
    return (
        <Stack mb="lg">
            <LoginForm onLogin={() => context.closeModal(id)} />
        </Stack>
    )
}
