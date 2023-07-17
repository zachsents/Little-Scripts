import { Button, Center, Group, List, Loader, Select, Stack, Text, Tooltip } from "@mantine/core"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { usePaymentMethods, useSetupIntent } from "@web/modules/stripe"
import { useScriptIdFromRouter } from "@web/modules/util"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { TbArrowRight, TbCheck, TbCreditCard } from "react-icons/tb"
import PaymentInfoForm from "./PaymentInfoForm"
import { useQuery } from "react-query"
import { PLAN } from "shared"
import { httpsCallable } from "firebase/functions"
import { fire } from "@web/modules/firebase"
import { useRouter } from "next/router"
import { logEvent } from "firebase/analytics"


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)


export default function UpgradeFlow({ initialStep }) {


    const [step, setStep] = useState(initialStep ?? 0)
    const nextStep = () => setStep(step + 1)

    switch (step) {
        case 0:
            return <SelectPaymentMethodStep nextStep={nextStep} />
        case 1:
            return <PaymentStep />
        case 2:
            return <UpgradeSubscriptionStep nextStep={nextStep} />
        case 3:
            return <SuccessStep />
    }
}




function SelectPaymentMethodStep({ nextStep }) {

    const scriptId = useScriptIdFromRouter()

    const [paymentMethods, paymentMethodsQuery] = usePaymentMethods()
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState()

    useEffect(() => {
        if (paymentMethods?.length > 0)
            setSelectedPaymentMethod(paymentMethods[0].id)
    }, [paymentMethodsQuery.isLoading])

    return (
        <Stack spacing="xs" align="center">
            <Text ta="center" size="lg" fw="bold">Woo hoo! 🎉</Text>

            <Text ta="center">
                You&apos;re about to upgrade to the{" "}
                <Tooltip position="bottom" label="More plans will be available in the future! Stay tuned!" withinPortal>
                    <span className="font-bold text-orange-700">Little Plan</span>
                </Tooltip>.
            </Text>

            <div>
                <Text>
                    What you&apos;re getting:
                </Text>
                <List ml="xs">
                    <List.Item>
                        <span className="text-primary-700 font-bold">100 free runs</span> per month
                    </List.Item>
                    <List.Item>
                        Unlimited runs for <span className="text-primary-700 font-bold">$0.01</span> each
                    </List.Item>
                </List>
            </div>

            <Stack spacing="xs" align="center" mt="md">
                {paymentMethods?.length > 0 &&
                    <>
                        <Group>
                            <Select
                                placeholder="Choose a payment method"
                                data={paymentMethods.map(pm => ({
                                    value: pm.id, label: `${pm.card.brand.toUpperCase()} ending in ${pm.card.last4}`
                                }))}
                                value={selectedPaymentMethod}
                                onChange={setSelectedPaymentMethod}
                            />
                            <Tooltip label="Proceed with this payment method">
                                <Button component="a" href={`/script/${scriptId}?billing=success&payment_method=${selectedPaymentMethod}`}>
                                    <TbArrowRight />
                                </Button>
                            </Tooltip>
                        </Group>

                        <Text color="dimmed">or</Text>
                    </>}

                <Button
                    leftIcon={<TbCreditCard />} rightIcon={<TbArrowRight />}
                    onClick={nextStep}
                    loading={paymentMethodsQuery.isLoading}
                >
                    Add a Payment Method
                </Button>
            </Stack>
        </Stack>
    )
}


function PaymentStep() {

    const [intent, intentQuery] = useSetupIntent()

    return intentQuery.isFetching ?
        <Center>
            <Loader size="sm" />
        </Center> :
        <Elements stripe={stripePromise} options={{
            clientSecret: intent.clientSecret,
        }}>
            <Stack>
                <Text size="sm" color="dimmed">
                    You&apos;ll only be charged for the number of runs you use.
                </Text>
                <PaymentInfoForm intent={intent} />
            </Stack>
        </Elements>
}


function UpgradeSubscriptionStep({ nextStep }) {

    const router = useRouter()

    const scriptId = useScriptIdFromRouter()
    const plan = PLAN.LITTLE

    const upgradeQuery = useQuery({
        queryKey: ["upgrade-subscription", scriptId],
        queryFn: async () => {
            await httpsCallable(fire.functions, "onRequestChangePlanForScript")({
                scriptId,
                plan,
                setupIntent: router.query.setup_intent,
                paymentMethod: router.query.payment_method,
            })
            logEvent(fire.analytics, "upgrade_subscription", { scriptId, plan })
        },
        enabled: !!scriptId &&
            !!(router.query.setup_intent || router.query.payment_method),
        retryOnMount: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    useEffect(() => {
        if (upgradeQuery.isSuccess)
            nextStep()
    }, [upgradeQuery.isSuccess])

    return (
        <Stack align="center">
            <Text>Plugging in the wires...</Text>
            <Loader size="sm" />
        </Stack>
    )
}


const successTransition = { type: "spring", duration: 1, bounce: 0.6, delay: 0.2 }

function SuccessStep() {

    return (
        <Stack align="center" spacing="lg" pt="lg" pb="xs">
            <motion.div
                initial="init"
                animate="anim"
                variants={{
                    init: { scale: 0 },
                    anim: { scale: 1 },
                }}
                transition={successTransition}
                className="bg-primary rounded-full p-md aspect-square"
            >
                <motion.div
                    variants={{
                        init: { scale: 0 },
                        anim: { scale: 1 },
                    }}
                    transition={{ ...successTransition, duration: 0.7, delay: 0.6 }}
                    className="flex items-center justify-center text-3xl text-white"
                >
                    <TbCheck />
                </motion.div>
            </motion.div>

            <div className="flex flex-col items-center">
                {/* <Text size="sm" color="dimmed">
                    What are you waiting for?
                </Text> */}
                <Text>
                    Go build something awesome!
                </Text>
            </div>
        </Stack>
    )
}