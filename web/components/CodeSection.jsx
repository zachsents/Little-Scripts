import { Button, Center, Group, Stack, Table, Tabs, Text, Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import { Prism } from "@mantine/prism"
import MonacoEditor from "@monaco-editor/react"
import { fire, useScript, useSetStorageFileContent } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { useEffect, useState } from "react"
import { TbBrandNpm, TbCodeDots, TbPackages, TbRun } from "react-icons/tb"
import { COST_PER_RUN, SOURCE_FILE_PATH } from "shared"
import LogsSection from "./LogsSection"
import BetterScroll from "./BetterScroll"
import { logEvent } from "firebase/analytics"


const dependencies = {
    "axios": "^1.4.0",
    "googleapis": "^121.0.0",
    "lodash": "^4.17.21",
    "node-fetch": "^3.3.1",
    "openai": "^3.3.0",
    "puppeteer": "^20.8.1",
    "xvfb": "^0.4.0"
}


export default function CodeSection() {

    const editorTab = useMainStore(s => s.editorTab)
    const setEditorTab = useMainStore(s => s.setEditorTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)

    const { script } = useScript()
    const code = script?.sourceCode || ""

    const [workingCode, setWorkingCode] = useState(code)

    const isCodeDirty = useMainStore(s => s.isCodeDirty)
    const setCodeDirty = useMainStore(s => s.setCodeDirty)

    const [_save, saveQuery] = useSetStorageFileContent(SOURCE_FILE_PATH(script?.id), workingCode)

    const save = async () => {
        await _save()
        setCodeDirty(false)

        logEvent(fire.analytics, "save_script", { scriptId: script?.id })
        if (script?.sourceCode == null)
            logEvent(fire.analytics, "save_script_first_time", { scriptId: script?.id })
    }

    const discard = () => {
        setWorkingCode(code)
        setCodeDirty(false)
    }

    useEffect(discard, [code])

    const confirmDiscard = () => modals.openConfirmModal({
        title: "Are you sure you want to discard your changes?",
        labels: { confirm: "Discard", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: discard,
    })


    return (
        <Tabs
            value={editorTab} onTabChange={setEditorTab}
            className="h-full flex flex-col"
            classNames={{
                tabsList: "justify-between",
                panel: "flex-1 flex-col",
            }}
        >
            <Tabs.List>
                <Group spacing={0}>
                    <Tabs.Tab value="code" icon={<TbCodeDots />}>Code</Tabs.Tab>
                    <Tabs.Tab value="logs" icon={<TbRun />}>Runs</Tabs.Tab>
                    <Tabs.Tab value="dependencies" icon={<TbPackages />}>Dependencies</Tabs.Tab>
                </Group>

                <Group spacing="xl">
                    <Tooltip label="View Billing">
                        <Group
                            className="cursor-pointer"
                            onClick={() => setConfigTab("billing")}
                        >
                            <Text size="sm" color="dimmed">Cost Per Run</Text>
                            <Text>${COST_PER_RUN}</Text>
                        </Group>
                    </Tooltip>
                </Group>
            </Tabs.List>

            <Tabs.Panel value="code" className={editorTab === "code" && "flex"}>
                <Group px="xs" py="xxs" bg="gray.0" position="right">
                    {isCodeDirty ?
                        <Group spacing="xs">
                            <Text size="xs" color="dimmed">Changes</Text>
                            <Button
                                compact size="sm"
                                onClick={save}
                                loading={saveQuery.isFetching}
                            >
                                Save
                            </Button>
                            <Button
                                compact size="sm" color="red"
                                onClick={confirmDiscard}
                            >
                                Discard
                            </Button>
                        </Group> :
                        <Text size="xs" color="dimmed">All changes saved.</Text>}
                </Group>

                <div className="flex-1">
                    <MonacoEditor
                        height="100%"
                        language="javascript"
                        theme="light"
                        value={workingCode}
                        onChange={newCode => {
                            setWorkingCode(newCode)
                            setCodeDirty()
                        }}
                    />
                </div>
            </Tabs.Panel>

            <Tabs.Panel value="logs" className={editorTab === "logs" && "flex"}>
                <LogsSection />
            </Tabs.Panel>

            <Tabs.Panel value="dependencies" className={editorTab === "dependencies" && "flex"}>
                <BetterScroll>
                    <Group p="xl" spacing="xl" align="flex-start">
                        <Table className="flex-1">
                            <thead>
                                <tr>
                                    <th>Package Name</th>
                                    <th>Version</th>
                                    <th>View on NPM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(dependencies).map(([name, version]) => {

                                    const exactVersion = version.match(/[\d.]+/)?.[0]

                                    return (
                                        <tr key={name}>
                                            <td>{name}</td>
                                            <td className="font-mono">{version}</td>
                                            <td className="flex">
                                                <a
                                                    className="group text-red text-3xl hover:scale-125 transition-transform"
                                                    href={`https://npmjs.com/package/${name}${exactVersion ? `/v/${exactVersion}` : ""}`}
                                                    target="_blank" rel="noreferrer"
                                                >
                                                    <Center px="xl">
                                                        <TbBrandNpm className="stroke-[1.5] group-hover:fill-red-100 transition-colors" />
                                                    </Center>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>

                        <Stack w="35%">
                            <Text>
                                These are the dependencies that are available to your script. You can use them by importing them in your code:
                            </Text>
                            <div >
                                <Prism language="javascript">
                                    {`import puppeteer from "puppeteer"\nimport axios from "axios"`}
                                </Prism>
                            </div>
                            <Text size="sm" color="dimmed">
                                In the future, you will be able to add your own dependencies!
                            </Text>
                        </Stack>
                    </Group>
                </BetterScroll>
            </Tabs.Panel>
        </Tabs>
    )
}
