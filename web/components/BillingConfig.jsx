import { Badge, Button, Group, Progress, Stack, Table, Text, Tooltip } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import { TbArrowBigUpLines, TbChartLine } from "react-icons/tb"
import ConfigPanel from "./ConfigPanel"


export default function BillingConfig() {

    const setConfigTab = useMainStore(s => s.setConfigTab)

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
                        <Text>
                            <span className="text-primary font-bold">30 / 100</span>
                            {" "}free runs used
                        </Text>
                        <Progress value={30} />
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
                                <td className="text-end">532</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Billable Runs</td>
                                <td className="text-end">432</td>
                            </tr>
                            <Tooltip
                                label="Will be billed to the attached account on Aug 1, 2023"
                                withinPortal position="right" withArrow
                            >
                                <tr>
                                    <td className="font-bold">Balance</td>
                                    <td className="text-end text-orange font-bold">$4.32</td>
                                </tr>
                            </Tooltip>
                        </tbody>
                    </Table>

                    <Text size="xs" color="dimmed">Resets Aug 1, 2023</Text>
                </Stack>
            </Stack>

        </ConfigPanel>
    )
}
