import { ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { useHotkeys } from "@mantine/hooks"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import UpgradeModal from "@web/components/UpgradeModal"
import { useColorScheme } from "@web/modules/color-scheme"
import "@web/modules/firebase"
import { fire } from "@web/modules/firebase"
import { mantineTheme } from "@web/theme"
import { signInAnonymously } from "firebase/auth"
import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { AuthProvider, FirebaseAppProvider, FirestoreProvider, useUser } from "reactfire"
import "../styles/globals.css"


const queryClient = new QueryClient()


export default function MyApp({ Component, pageProps }) {

    const [colorScheme, toggleColorScheme] = useColorScheme()

    useHotkeys([
        ["mod+J", () => toggleColorScheme()]
    ])

    useEffect(() => {
        if (colorScheme === "dark")
            global.document.querySelector("html").classList.add("dark")
        else
            global.document.querySelector("html").classList.remove("dark")
    }, [colorScheme])

    return (
        <FirebaseAppProvider firebaseApp={fire.app}>
            <AuthProvider sdk={fire.auth}>
                <FirestoreProvider sdk={fire.db}>
                    <QueryClientProvider client={queryClient}>
                        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                            <MantineProvider theme={{ colorScheme, ...mantineTheme }} withNormalizeCSS withGlobalStyles withCSSVariables>
                                <ModalsProvider modals={modals}>
                                    {/* This wrapper makes the footer stick to the bottom of the page */}
                                    <div className="min-h-screen flex flex-col">
                                        <Component {...pageProps} />
                                    </div>
                                    <Notifications autoClose={3000} />
                                    <AnonymousLogin />
                                </ModalsProvider>
                            </MantineProvider>
                        </ColorSchemeProvider>
                    </QueryClientProvider>
                </FirestoreProvider>
            </AuthProvider>
        </FirebaseAppProvider>
    )
}

const modals = {
    "upgrade": UpgradeModal,
}


function AnonymousLogin() {

    const { user, status } = useUser()

    useEffect(() => {
        if (status == "success" && !user) {
            signInAnonymously(fire.auth)
        }
    }, [status])
}