import { Badge, Button, Group, Progress, Stack, Table, Text, Tooltip } from "@mantine/core"
import { useScript } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { TbArrowBigUpLines, TbChartLine } from "react-icons/tb"
import { COST_PER_RUN, MAX_FREE_RUNS, getLastBillingCycleStartDate, getNextBillingCycleStartDate } from "shared"
import ConfigPanel from "./ConfigPanel"


export default function BillingConfig() {


    const setConfigTab = useMainStore(s => s.setConfigTab)

    const { script } = useScript()
    const freeRunsUsed = Math.min(script.runCount, MAX_FREE_RUNS)
    const billableRuns = Math.max(0, script.runCount - MAX_FREE_RUNS)

    return (
        <ConfigPanel title="Billing">
            <Stack spacing="xl">
                <Group>
                    <Text color="dimmed">Current Plan</Text>
                    <Badge>Free</Badge>
                </Group>

                <Stack spacing="xs">
                    <Text color="dimmed" fz="sm">Change Plan</Text>
                    <Button leftIcon={<TbArrowBigUpLines />} color="orange">
                        Upgrade to Pay as You Go
                    </Button>
                </Stack>

                <Stack spacing="xs">
                    <Text color="dimmed" fz="sm">Free Usage</Text>
                    <Stack spacing="xxs">
                        <div>
                            <Text>
                                <span className="text-primary font-bold">{freeRunsUsed} / {MAX_FREE_RUNS}</span>
                                {" "}free runs used
                            </Text>

                            <Text size="xs" color="dimmed">Since {getLastBillingCycleStartDate().toLocaleDateString(undefined, {
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

                    <Text size="xs" color="dimmed">Resets {getNextBillingCycleStartDate().toLocaleDateString(undefined, {
                        dateStyle: "medium",
                    })}</Text>
                </Stack>
            </Stack>

        </ConfigPanel>
    )
}
