import { Button, Group, Tabs, Text, Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import MonacoEditor from "@monaco-editor/react"
import { useScript, useSetStorageFileContent } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { useEffect, useState } from "react"
import { TbCodeDots, TbRun } from "react-icons/tb"
import { COST_PER_RUN } from "shared"
import LogsSection from "./LogsSection"


export default function CodeSection() {

    const editorTab = useMainStore(s => s.editorTab)
    const setEditorTab = useMainStore(s => s.setEditorTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)

    const { script } = useScript()
    const code = script?.sourceCode || ""

    const [workingCode, setWorkingCode] = useState(code)

    const isCodeDirty = useMainStore(s => s.isCodeDirty)
    const setCodeDirty = useMainStore(s => s.setCodeDirty)

    const [_save, saveQuery] = useSetStorageFileContent(`script-source/${script?.id}.js`, workingCode)

    const save = async () => {
        await _save()
        setCodeDirty(false)
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
            className="flex-1 flex flex-col"
            classNames={{
                tabsList: "justify-between",
                panel: "flex-1 flex-col",
            }}
        >
            <Tabs.List>
                <Group spacing={0}>
                    <Tabs.Tab value="code" icon={<TbCodeDots />}>Code</Tabs.Tab>
                    <Tabs.Tab value="logs" icon={<TbRun />}>Runs</Tabs.Tab>
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

        </Tabs>
    )
}
