import { Center, Group, Loader, Select, Tabs, Text } from "@mantine/core"
import { useScript, useStorageFileContent } from "@web/modules/firebase"
import { useEffect, useState } from "react"
import { TbAlertCircle, TbFileText } from "react-icons/tb"
import { LOG_FILE_PATH, RUN_STATUS } from "shared"
import BetterScroll from "./BetterScroll"


export default function LogsSection() {

    const { script } = useScript()

    const [selectedRunId, setSelectedRunId] = useState()
    const selectedRun = script?.runs?.find(run => run.id == selectedRunId)

    const runsToSelectFrom = script?.runs
        .map(run => ({
            value: run.id,
            label: run.startedAt.toDate().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            }) + ` - ${run.status}`,
        }))

    useEffect(() => {
        console.debug("Selected run:", selectedRunId)
    }, [selectedRunId])

    const [logs, logsQuery] = useStorageFileContent(selectedRun && LOG_FILE_PATH(script.id, selectedRunId))

    const hasFailed = selectedRun?.status === RUN_STATUS.FAILED

    return (
        <>
            <Tabs defaultValue="logs" variant="outline" classNames={{
                root: "grow flex flex-col",
                tabsList: "px-xs bg-gray-50 justify-between items-end",
                tab: "data-[active=true]:bg-white",
                panel: "p-xs grow",
            }}>
                <Tabs.List>
                    <Group spacing={0} align="flex-end">
                        <Tabs.Tab
                            value="logs" icon={<TbFileText />}
                        >
                            Logs
                        </Tabs.Tab>

                        {/* <Tabs.Tab
                            value="return" icon={<TbArrowForward />}
                            className={!hasReturnValue && "text-gray"}
                        >
                            Return Value
                        </Tabs.Tab> */}

                        <Tabs.Tab
                            value="errors" icon={<TbAlertCircle />}
                            className={!hasFailed && "text-gray"}
                        >
                            Errors
                        </Tabs.Tab>
                    </Group>

                    <Select
                        value={selectedRunId}
                        onChange={setSelectedRunId}
                        size="sm" w="20rem"
                        data={runsToSelectFrom}
                        placeholder="Select a run"
                        py="xxs"
                    />
                </Tabs.List>

                {logsQuery.isLoading ?
                    <Center py="xl">
                        <Loader />
                    </Center> :
                    selectedRun ?
                        <>
                            <Tabs.Panel value="logs">
                                <BetterScroll>
                                    <pre className="text-sm whitespace-pre-wrap">
                                        {logs}
                                    </pre>
                                    <Text size="xs" color="dimmed" align="center">End of logs</Text>
                                </BetterScroll>
                            </Tabs.Panel>

                            {/* <Tabs.Panel value="return">
                                <BetterScroll>
                                    {hasReturnValue ?
                                        <pre>
                                            {JSON.stringify(selectedRun.returnValue, null, 2)}
                                        </pre> :
                                        <Text size="sm" color="dimmed" align="center" py="lg">No return value</Text>}
                                </BetterScroll>
                            </Tabs.Panel> */}

                            <Tabs.Panel value="errors">
                                <BetterScroll>
                                    {hasFailed ?
                                        <div>
                                            <p className="font-bold font-mono text-red-800 bg-gray-100 px-md py-xxs rounded">{selectedRun?.failureReason}</p>

                                            <pre className="text-sm text-red-800 whitespace-pre-wrap">
                                                {selectedRun.stderr}
                                            </pre>
                                        </div> :
                                        <Text size="sm" color="dimmed" align="center" py="lg">No errors</Text>}
                                </BetterScroll>
                            </Tabs.Panel>
                        </> :
                        <Text color="dimmed" size="sm" align="center" py="xl">
                            No run selected
                        </Text>}
            </Tabs>
        </>
    )
}
