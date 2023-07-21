import { ActionIcon, Button, Center, Divider, Group, Loader, Popover, Stack, Tabs, Text, Tooltip } from "@mantine/core"
import { useScript, useStorageFileContent } from "@web/modules/firebase"
import classNames from "classnames"
import { useEffect, useMemo, useState } from "react"
import { TbAlertCircle, TbCheck, TbFileText, TbLoader } from "react-icons/tb"
import { LOG_FILE_PATH, RUN_STATUS } from "shared"
import BetterScroll from "./BetterScroll"


export default function LogsSection() {

    const { script } = useScript()

    const [selectedRunId, setSelectedRunId] = useState()
    const selectedRun = script?.runs?.find(run => run.id == selectedRunId)

    const selectedRunLabel = useMemo(() => {
        if (!selectedRunId)
            return "Select a run"

        return selectedRun.startedAt.toDate().toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }) + ` - ${selectedRun.status}`
    }, [selectedRunId])

    useEffect(() => {
        console.debug("Selected run:", selectedRunId)
    }, [selectedRunId])

    const [logs, logsQuery] = useStorageFileContent(selectedRun && LOG_FILE_PATH(script.id, selectedRunId), selectedRun?.status)

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

                        <Tabs.Tab
                            value="errors" icon={<TbAlertCircle />}
                            className={!hasFailed && "text-gray"}
                        >
                            Errors
                        </Tabs.Tab>
                    </Group>

                    {/* <Select
                        value={selectedRunId}
                        onChange={setSelectedRunId}
                        size="sm" w="20rem"
                        data={runsToSelectFrom}
                        placeholder="Select a run"
                        py="xxs"
                    /> */}

                    {script?.runs &&
                        <Popover width="20rem" position="bottom-end" withinPortal shadow="sm">
                            <Popover.Target>
                                <Button
                                    variant={selectedRunId ? "outline" : "filled"}
                                    my="xxs"
                                >
                                    {selectedRunLabel}
                                </Button>
                            </Popover.Target>
                            <Popover.Dropdown px={0} h="24rem">
                                <BetterScroll>
                                    <TileRunViewer
                                        value={selectedRunId}
                                        onChange={setSelectedRunId}
                                    />
                                </BetterScroll>
                            </Popover.Dropdown>
                        </Popover>}
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


function TileRunViewer({ value, onChange }) {

    const { script } = useScript()

    const runGroups = useMemo(() => {
        const groups = {}

        script?.runs?.forEach(run => {
            const date = run.startedAt.toDate().toLocaleString(undefined, {
                dateStyle: "medium",
            })
            groups[date] ??= []
            groups[date].push(run)
        })

        Object.values(groups).forEach(group => {
            group.sort((a, b) => b.startedAt.toDate() - a.startedAt.toDate())
        })

        const groupsArr = Object.entries(groups).map(([date, runs]) => ({ date, runs }))
        groupsArr.sort((a, b) => new Date(b.date) - new Date(a.date))

        return groupsArr
    }, [script?.runs])

    return (
        <Stack spacing="xl" px="md">
            {runGroups.map(group =>
                <Stack spacing="xs" key={group.date}>
                    <Divider label={group.date} />

                    <Group spacing="xs">
                        {group.runs.map(run =>
                            <RunTile
                                run={run}
                                selected={value == run.id}
                                onSelect={() => onChange?.(run.id)}
                                key={run.id}
                            />
                        )}
                    </Group>
                </Stack>
            )}

            {runGroups.length == 0 &&
                <Text ta="center" color="dimmed" size="xs">
                    No runs
                </Text>}

            {script?.runs?.length == 100 &&
                <Text ta="center" color="dimmed" size="xs">
                    Only the last 100 runs are shown
                </Text>}
        </Stack>
    )
}


const statusColors = {
    [RUN_STATUS.RUNNING]: "blue",
    [RUN_STATUS.FAILED]: "red",
    [RUN_STATUS.COMPLETED]: "green",
}

const statusIcons = {
    [RUN_STATUS.RUNNING]: TbLoader,
    [RUN_STATUS.FAILED]: TbAlertCircle,
    [RUN_STATUS.COMPLETED]: TbCheck,
}


function RunTile({ run, onSelect, selected }) {

    const Icon = statusIcons[run.status]

    const duration = run.status == RUN_STATUS.COMPLETED && ((run.completedAt || run.failedAt).toDate() - run.startedAt.toDate()) / 1000

    return (
        <Tooltip
            withinPortal multiline
            label={<Stack miw="10rem" spacing={0}>
                <Group noWrap position="apart">
                    <Text color="dimmed">Status</Text>
                    <Text fw="bold" color={`${statusColors[run.status]}.3`}>
                        {run.status}
                    </Text>
                </Group>
                <Group noWrap position="apart">
                    <Text color="dimmed">Date</Text>
                    <Text>
                        {run.startedAt.toDate().toLocaleString(undefined, {
                            dateStyle: "short",
                        })}
                    </Text>
                </Group>
                <Group noWrap position="apart">
                    <Text color="dimmed">Time</Text>
                    <Text>
                        {run.startedAt.toDate().toLocaleString(undefined, {
                            timeStyle: "short",
                        })}
                    </Text>
                </Group>
                {duration &&
                    <Group noWrap position="apart">
                        <Text color="dimmed">Duration</Text>
                        <Text>
                            {duration.toFixed(2)} seconds
                        </Text>
                    </Group>}
                <Text color="dimmed" ta="center">
                    Click to select
                </Text>
            </Stack>}
        >
            <ActionIcon
                variant="filled" color={statusColors[run.status]} radius="sm" size="lg"
                className={classNames({
                    "aspect-square text-xl group": true,
                    "!outline !outline-4 !outline-yellow outline-offset-2": selected,
                })}
                onClick={onSelect}
            >
                <Center className="text-white opacity-60 group-hover:opacity-100">
                    <Icon />
                </Center>
            </ActionIcon>
        </Tooltip>
    )
}