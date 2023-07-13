import { Button, Center, Loader, Stack, Text } from "@mantine/core"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useScriptIdFromRouter } from "@web/modules/util"
import { useState } from "react"
import { useQuery } from "react-query"
import { BASE_URL } from "shared"


export default function PaymentInfoForm({ intent }) {

    const scriptId = useScriptIdFromRouter()

    const stripe = useStripe()
    const elements = useElements()

    const isLoadingForm = !stripe || !elements

    const [error, setError] = useState()

    const confirmQuery = useQuery({
        queryKey: ["confirm-setup-intent", intent?.id],
        queryFn: async () => {
            const result = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: `${BASE_URL}/script/${scriptId}?billing=success`,
                }
            })

            if (result.error) {
                setError(result.error.message)
                return
            }

            setError(null)
            return result.setupIntent
        },
        enabled: false,
    })

    const handleSubmit = event => {
        event.preventDefault()
        confirmQuery.refetch()
    }

    return isLoadingForm ?
        <Center>
            <Loader size="sm" />
        </Center> :
        <form onSubmit={handleSubmit}>
            <Stack>
                <PaymentElement />

                {error &&
                    <Text color="red.8" size="sm" align="center">
                        {error}
                    </Text>}

                <Button
                    type="submit" fullWidth
                    loading={confirmQuery.isFetching}
                >
                    Submit
                </Button>
            </Stack>
        </form>
}
