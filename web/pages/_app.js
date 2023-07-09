import "../styles/globals.css"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { QueryClient, QueryClientProvider } from "react-query"
import { Notifications } from "@mantine/notifications"
import { mantineTheme } from "@web/theme"

const queryClient = new QueryClient()


export default function MyApp({ Component, pageProps }) {
    return (
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
    )
}


const modals = {

}