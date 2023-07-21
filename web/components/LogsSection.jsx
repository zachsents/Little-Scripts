import { ActionIcon, Button, Center, Divider, Group, Loader, Popover, SegmentedControl, Stack, Tabs, Text, Tooltip } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { useScript, useStorageFileContent } from "@web/modules/firebase"
import classNames from "classnames"
import { useEffect, useMemo, useState } from "react"
import { TbAlertCircle, TbCheck, TbFileText, TbLayoutGrid, TbList, TbLoader } from "react-icons/tb"
import { LOG_FILE_PATH, RUN_STATUS, SCRIPT_RUN_LOAD_LIMIT, isStatusFinished } from "shared"
import BetterScroll from "./BetterScroll"


export default function LogsSection() {

    const { script } = useScript()

    const [runViewerMode, setRunViewerMode] = useLocalStorage({
        key: "runViewerMode",
        defaultValue: "tile",
    })

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
                                    <Stack spacing="xs" px="md">
                                        <Group position="apart" noWrap>
                                            <Text>Runs</Text>
                                            <RunViewerModeSelector
                                                value={runViewerMode}
                                                onChange={setRunViewerMode}
                                            />
                                        </Group>

                                        <RunViewer
                                            value={selectedRunId}
                                            onChange={setSelectedRunId}
                                            mode={runViewerMode}
                                        />

                                        {script?.runs?.length == 0 &&
                                            <Text ta="center" color="dimmed" size="xs">
                                                No runs
                                            </Text>}

                                        {script?.runs?.length == SCRIPT_RUN_LOAD_LIMIT &&
                                            <Text ta="center" color="dimmed" size="xs">
                                                Only the last {SCRIPT_RUN_LOAD_LIMIT} runs are shown
                                            </Text>}
                                    </Stack>
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


function RunViewerModeSelector({ value, onChange }) {

    return (
        <SegmentedControl
            value={value}
            onChange={onChange}
            classNames={{
                label: "p-0"
            }}
            data={[
                {
                    value: "list",
                    label: <Tooltip label="List View" withinPortal>
                        <Center px="xs" py="xxxs">
                            <TbList />
                        </Center>
                    </Tooltip>,
                },
                {
                    value: "tile",
                    label: <Tooltip label="Tile View" withinPortal>
                        <Center px="xs" py="xxxs">
                            <TbLayoutGrid />
                        </Center>
                    </Tooltip>,
                },
            ]}
        />
    )
}


function RunViewer({ value, onChange, mode }) {

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
        <Stack spacing="xl">
            {runGroups.map(group =>
                <Stack spacing="xs" key={group.date}>
                    <Divider label={group.date} />

                    {mode === "list" &&
                        <Stack spacing={0}>
                            {group.runs.map(run =>
                                <RunRow
                                    run={run}
                                    selected={value == run.id}
                                    onSelect={() => onChange?.(run.id)}
                                    key={run.id}
                                />
                            )}
                        </Stack>}

                    {mode === "tile" &&
                        <Group spacing="xs">
                            {group.runs.map(run =>
                                <RunTile
                                    run={run}
                                    selected={value == run.id}
                                    onSelect={() => onChange?.(run.id)}
                                    key={run.id}
                                />
                            )}
                        </Group>}
                </Stack>
            )}
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

    return (
        <RunTooltip
            run={run} selected={selected}
            withArrow
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
        </RunTooltip>
    )
}


function RunRow({ run, onSelect, selected }) {

    const Icon = statusIcons[run.status]

    const label = run.startedAt.toDate().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })

    return (
        <RunTooltip
            run={run} selected={selected}
            position="left" withArrow
        >
            <Group
                noWrap
                className={classNames({
                    "cursor-pointer hover:bg-gray-100 px-md py-xs rounded": true,
                    "outline outline-2 outline-yellow z-10": selected,
                })}
                onClick={onSelect}
            >
                <Center c={statusColors[run.status]} className="text-xl">
                    <Icon />
                </Center>
                <Text size="sm">
                    {label}
                </Text>
            </Group>
            {/* <Button
                variant="subtle" color="gray" radius="sm" fullWidth
                className={classNames({
                    "font-normal": true,
                    "!outline !outline-4 !outline-yellow outline-offset-2": selected,
                })}
                onClick={onSelect}
            >
                {label}
            </Button> */}
        </RunTooltip>
    )
}


function RunTooltip({ run, selected, children, ...props }) {

    const duration = isStatusFinished(run.status) && ((run.completedAt || run.failedAt).toDate() - run.startedAt.toDate()) / 1000

    return (
        <Tooltip
            withinPortal multiline {...props}
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

                {selected ?
                    <Text color="yellow" ta="center">
                        Selected
                    </Text> :
                    <Text color="dimmed" ta="center">
                        Click to select
                    </Text>}
            </Stack>}
        >
            {children}
        </Tooltip>
    )
}