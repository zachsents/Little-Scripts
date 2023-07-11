import "../styles/globals.css"
import "@web/modules/firebase"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { QueryClient, QueryClientProvider } from "react-query"
import { Notifications } from "@mantine/notifications"
import { mantineTheme } from "@web/theme"
import LoginModal from "@web/components/LoginModal"
import { AuthProvider, FirebaseAppProvider, FirestoreProvider } from "reactfire"
import { fire } from "@web/modules/firebase"


const queryClient = new QueryClient()


export default function MyApp({ Component, pageProps }) {
    return (
        <FirebaseAppProvider firebaseApp={fire.app}>
            <AuthProvider sdk={fire.auth}>
                <FirestoreProvider sdk={fire.db}>
                    <QueryClientProvider client={queryClient}>
                        <MantineProvider theme={mantineTheme} withNormalizeCSS withGlobalStyles withCSSVariables>
                            <ModalsProvider modals={modals}>
                                {/* This wrapper makes the footer stick to the bottom of the page */}
                                <div className="min-h-screen flex flex-col">
                                    <Component {...pageProps} />
                                </div>
                                <Notifications autoClose={3000} />
                            </ModalsProvider>
                        </MantineProvider>
                    </QueryClientProvider>
                </FirestoreProvider>
            </AuthProvider>
        </FirebaseAppProvider>
    )
}

const modals = {
    "login": LoginModal,
}