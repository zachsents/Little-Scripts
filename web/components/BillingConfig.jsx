import { Badge, Button, Center, Group, Loader, Progress, Stack, Table, Text, Tooltip } from "@mantine/core"
import { openContextModal } from "@mantine/modals"
import { fire, useScript } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { useBillingPortalUrl, useSubscription } from "@web/modules/stripe"
import { TbArrowBigUpLines, TbChartLine, TbTool } from "react-icons/tb"
import { COST_PER_RUN, MAX_FREE_RUNS, STRIPE_PRODUCTS_COLLECTION, getLastBillingCycleStartDate, getNextBillingCycleStartDate } from "shared"
import ConfigPanel from "./ConfigPanel"
import { useFirestoreDocData } from "reactfire"
import { doc } from "firebase/firestore"


export default function BillingConfig() {

    const setConfigTab = useMainStore(s => s.setConfigTab)

    const { script } = useScript()
    const freeRunsUsed = Math.min(script.runCount, MAX_FREE_RUNS)
    const billableRuns = Math.max(0, script.runCount - MAX_FREE_RUNS)

    const openUpgradeModal = () => openContextModal({
        modal: "upgrade",
        title: "Upgrade Script",
    })

    const [subscription, subscriptionQuery] = useSubscription()
    const hasSubscription = subscriptionQuery.isSuccess && !!subscription

    const periodStart = hasSubscription ? new Date(subscription.current_period_start * 1000) : getLastBillingCycleStartDate()
    const periodEnd = hasSubscription ? new Date(subscription.current_period_end * 1000) : getNextBillingCycleStartDate()

    const productId = subscription?.items.data[0].price.product
    const { data: plan, status: planStatus } = useFirestoreDocData(doc(fire.db, STRIPE_PRODUCTS_COLLECTION, productId ?? "placeholder"), {
        idField: "id",
    })

    const [portalUrl, portalUrlQuery] = useBillingPortalUrl()

    return (
        <ConfigPanel title="Billing">
            {subscriptionQuery.isSuccess ?
                <Stack spacing="xl">
                    <Stack spacing="xs">
                        <Group>
                            <Text color="dimmed">Current Plan</Text>
                            {planStatus === "success" ?
                                plan ?
                                    <Tooltip
                                        multiline withinPortal maw="20rem"
                                        label={plan.description}
                                    >
                                        <Badge color="orange">
                                            {plan.name.replace(/plan/i, "").trim()}
                                        </Badge>
                                    </Tooltip> :
                                    <Badge>Free</Badge> :
                                <Loader size="xs" />}
                        </Group>

                        {hasSubscription ?
                            <Button
                                leftIcon={<TbTool />}
                                component="a" href={portalUrl} loading={portalUrlQuery.isFetching}
                            >
                                Manage Plan
                            </Button> :
                            <Button
                                leftIcon={<TbArrowBigUpLines />} color="orange"
                                onClick={openUpgradeModal}
                            >
                                Upgrade
                            </Button>}
                    </Stack>

                    <Stack spacing="xs">
                        <Text color="dimmed" fz="sm">Free Usage</Text>
                        <Stack spacing="xxs">
                            <div>
                                <Text>
                                    <span className="text-primary font-bold">{freeRunsUsed} / {MAX_FREE_RUNS}</span>
                                    {" "}free runs used
                                </Text>
                                <Text size="xs" color="dimmed">Since {periodStart.toLocaleDateString(undefined, {
                                    dateStyle: "medium",
                                })}</Text>
                            </div>
                            <Progress value={freeRunsUsed / MAX_FREE_RUNS * 100} />
                        </Stack>
                        <div>
                            <Button
                                leftIcon={<TbChartLine />} compact size="xs" color="gray" variant="subtle"
                                onClick={() => setConfigTab("usage")}
                            >
                                View Detailed Usage
                            </Button>
                        </div>
                    </Stack>

                    {hasSubscription &&
                        <Stack spacing="xs">
                            <Text color="dimmed" fz="sm">Current Cycle</Text>
                            <Table>
                                <tbody>
                                    <tr>
                                        <td className="font-bold">Total Runs</td>
                                        <td className="text-end">{script.runCount}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Billable Runs</td>
                                        <td className="text-end">{billableRuns}</td>
                                    </tr>
                                    <Tooltip
                                        label="Will be billed to the attached account on Aug 1, 2023"
                                        withinPortal position="right" withArrow
                                    >
                                        <tr>
                                            <td className="font-bold">Balance</td>
                                            <td className="text-end text-orange font-bold">${billableRuns * COST_PER_RUN}</td>
                                        </tr>
                                    </Tooltip>
                                </tbody>
                            </Table>
                        </Stack>}

                    <Text size="xs" color="dimmed">Resets {periodEnd.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    })}</Text>
                </Stack> :
                <Center>
                    <Loader size="sm" />
                </Center>}
        </ConfigPanel>
    )
}
