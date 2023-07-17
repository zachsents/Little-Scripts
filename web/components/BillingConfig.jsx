import { ActionIcon, Badge, Button, Center, Divider, Group, Loader, Menu, Progress, Stack, Table, Text, Tooltip } from "@mantine/core"
import { openConfirmModal, openContextModal } from "@mantine/modals"
import { fire, useScript } from "@web/modules/firebase"
import { TbArrowBigDownLines, TbArrowBigUpLines, TbDots } from "react-icons/tb"
import { COST_PER_RUN, MAX_FREE_RUNS, PLAN, PRICE_ID_PLAN } from "shared"
import ConfigPanel from "./ConfigPanel"
import { useQuery } from "react-query"
import { httpsCallable } from "firebase/functions"
import { logEvent } from "firebase/analytics"


const BADGE_COLORS = {
    [PLAN.FREE]: "primary",
    [PLAN.LITTLE]: "orange",
}

const shortDateFormat = {
    month: "short",
    day: "numeric",
}


export default function BillingConfig() {

    const { script, isLoaded } = useScript()
    const plan = PRICE_ID_PLAN[script?.subscription?.items[0].price.id]

    return (
        <ConfigPanel title="Billing">
            {isLoaded ?
                <Stack spacing="xl">
                    {plan == PLAN.FREE && <>
                        <ManagePlanSection />
                        <UsageSection />
                    </>}

                    {plan == PLAN.LITTLE && <>
                        <UsageSection />
                        <ManagePlanSection />
                    </>}
                </Stack> :
                <Center py="xl">
                    <Loader />
                </Center>}
        </ConfigPanel>
    )
}


function BillingSection({ title, children }) {

    return (
        <Stack spacing="sm">
            <Divider
                label={title} labelPosition="center"
                labelProps={{ color: "dimmed" }}
            />

            {children}
        </Stack>
    )
}


function ManagePlanSection() {

    const { script } = useScript()
    const price = script.subscription.items[0].price
    const plan = PRICE_ID_PLAN[price.id]

    const openUpgradeModal = () => openContextModal({
        modal: "upgrade",
        title: "Upgrade Script",
    })

    const downgradeQuery = useQuery({
        queryKey: ["downgrade-plan", script.id],
        queryFn: async () => {
            await httpsCallable(fire.functions, "onRequestChangePlanForScript")({
                scriptId: script.id,
                plan: PLAN.FREE,
            })

            logEvent(fire.analytics, "downgrade_plan", { scriptId: script.id })
        },
        enabled: false,
    })

    const openDowngradeModal = () => openConfirmModal({
        title: "Are you sure you want to downgrade?",
        children: <Stack spacing="xs" align="center">
            <Text>You won&apos;t have unlimited runs anymore.</Text>
            <Text size="xs" color="dimmed">
                You&apos;ll be billed for usage prior to the downgrade.
            </Text>
        </Stack>,
        labels: { confirm: "I'm sure", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: downgradeQuery.refetch,
    })

    return (
        <BillingSection title="Manage Plan">
            <Group position="apart">
                <Group>
                    <Text color="dimmed">Current Plan</Text>
                    <Badge color={BADGE_COLORS[plan]}>
                        {price.metadata.name}
                    </Badge>
                </Group>

                {plan == PLAN.LITTLE &&
                    <Menu shadow="xs" position="bottom-end" withinPortal>
                        <Menu.Target>
                            <ActionIcon loading={downgradeQuery.isFetching}>
                                <TbDots />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item icon={<TbArrowBigDownLines />} onClick={openDowngradeModal}>
                                Downgrade to Free
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>}
            </Group>

            {plan == PLAN.FREE &&
                <Button
                    leftIcon={<TbArrowBigUpLines />} color="orange"
                    onClick={openUpgradeModal}
                >
                    Upgrade
                </Button>}
        </BillingSection>
    )
}


function UsageSection() {

    const { script } = useScript()
    const plan = PRICE_ID_PLAN[script.subscription.items[0].price.id]

    const freeRunsUsed = Math.min(script.usage.total_usage, MAX_FREE_RUNS)
    const billableRuns = Math.max(0, script.usage.total_usage - MAX_FREE_RUNS)

    /** @type {Date} */
    const periodStart = script.subscription.current_period_start.toDate()
    const formattedPeriodStart = periodStart.toLocaleDateString(undefined, shortDateFormat)
    /** @type {Date} */
    const periodEnd = script.subscription.current_period_end.toDate()
    const formattedPeriodEnd = periodEnd.toLocaleDateString(undefined, shortDateFormat)

    return (
        <BillingSection title="Usage">

            <Stack spacing="xxs">
                <Text>
                    <span className="text-primary font-bold">{freeRunsUsed} / {MAX_FREE_RUNS}</span>
                    {" "}free runs used
                </Text>
                <Progress value={freeRunsUsed / MAX_FREE_RUNS * 100} />
            </Stack>

            {/* <Button
                leftIcon={<TbChartLine />} compact size="xs" color="gray" variant="subtle"
                onClick={() => setConfigTab("usage")}
            >
                View Detailed Usage
            </Button> */}

            <Group noWrap position="apart">
                <Text size="sm" color="dimmed">Current Period</Text>
                <Text size="sm">
                    {formattedPeriodStart} - {formattedPeriodEnd}
                </Text>
            </Group>

            {plan == PLAN.LITTLE &&
                <Table>
                    <tbody>
                        <tr>
                            <td className="font-bold">Total Runs</td>
                            <td className="text-end">{script.usage.total_usage}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">Billable Runs</td>
                            <td className="text-end">{billableRuns}</td>
                        </tr>
                        <Tooltip
                            label={`Will be billed to the attached account on ${formattedPeriodEnd}`}
                            withinPortal position="right" withArrow
                        >
                            <tr>
                                <td className="font-bold">Balance</td>
                                <td className="text-end text-orange font-bold">${(billableRuns * COST_PER_RUN).toFixed(2)}</td>
                            </tr>
                        </Tooltip>
                    </tbody>
                </Table>}
        </BillingSection>
    )
}