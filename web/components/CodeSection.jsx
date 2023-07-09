import { Button, Group, Select, Tabs, Text, Tooltip } from "@mantine/core"
import MonacoEditor from "@monaco-editor/react"
import { useMainStore } from "@web/modules/store"
import { useState } from "react"
import { TbCodeDots, TbFileText } from "react-icons/tb"
import { modals } from "@mantine/modals"


export default function CodeSection() {

    const editorTab = useMainStore(s => s.editorTab)
    const setEditorTab = useMainStore(s => s.setEditorTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)


    const code = useMainStore(s => s.code)
    const isCodeDirty = useMainStore(s => s.isCodeDirty)
    const _saveCode = useMainStore(s => s.saveCode)
    const setCodeDirty = useMainStore(s => s.setCodeDirty)

    const [workingCode, setWorkingCode] = useState(code)

    const save = () => {
        _saveCode(workingCode)
    }

    const discard = () => {
        setWorkingCode(code)
        setCodeDirty(false)
    }

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
                    <Tabs.Tab value="logs" icon={<TbFileText />}>Logs</Tabs.Tab>
                </Group>

                <Tooltip label="View Billing">
                    <Group
                        className="cursor-pointer"
                        onClick={() => setConfigTab("billing")}
                    >
                        <Text size="sm" color="dimmed">Cost Per Run</Text>
                        <Text>$0.01</Text>
                    </Group>
                </Tooltip>
            </Tabs.List>

            <Tabs.Panel value="code" className={editorTab === "code" && "flex"}>
                <Group px="xs" py="xxs" bg="gray.0" position="right">
                    {isCodeDirty ?
                        <Group spacing="xs">
                            <Text size="xs" color="dimmed">Changes</Text>
                            <Button
                                compact size="sm"
                                onClick={save}
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
                <Group px="xs" py="xxs" bg="gray.0" position="right">
                    <Select
                        size="sm"
                        data={["December 2, 2022", "December 1, 2022", "November 30, 2022"]}
                        placeholder="Select a run"
                    />
                </Group>
            </Tabs.Panel>

        </Tabs>
    )
}
