import { ActionIcon, Group, Menu, Stack, Tabs, Text, Title, Tooltip } from "@mantine/core"
import { useScript } from "@web/modules/firebase"
import { useMainStore } from "@web/modules/store"
import { useSelectedTrigger } from "@web/modules/triggers"
import { useDeleteScript } from "@web/modules/util"
import { TbChartLine, TbDots, TbPencil, TbReportMoney, TbRun, TbTrash } from "react-icons/tb"
import BillingConfig from "./BillingConfig"
import ConfigPanel from "./ConfigPanel"
import SelectedTriggerConfig from "./SelectedTriggerConfig"
import TriggersConfig from "./TriggersConfig"
import { useState } from "react"
import EditableText from "./EditableText"
import { updateDoc } from "firebase/firestore"


const ICON_SIZE = "1.5rem"


export default function ConfigSection() {

    const { script } = useScript()

    const configTab = useMainStore(s => s.configTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)

    const selectedTrigger = useSelectedTrigger()

    const [confirmDelete, deleteQuery] = useDeleteScript()

    const [isRenamingTitle, setIsRenamingTitle] = useState(false)
    const rename = async newName => {
        await updateDoc(script?.ref, { name: newName })
        setIsRenamingTitle(false)
    }

    return (
        <Stack w="22rem">
            <Group className="bg-gray-100 rounded-lg px-lg py-xs" position="apart" noWrap>
                {isRenamingTitle ?
                    <EditableText
                        highlight
                        initialValue={script?.name}
                        onEdit={rename}
                        onCancel={() => setIsRenamingTitle(false)}
                        size="sm"
                    /> :
                    <Title order={3}>
                        {script?.name}
                    </Title>}

                <Menu shadow="sm">
                    <Menu.Target>
                        <ActionIcon
                            loading={deleteQuery.isFetching}
                            className="hover:bg-gray-200"
                        >
                            <TbDots />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<TbPencil />} onClick={() => setIsRenamingTitle(true)}>
                            Rename Script
                        </Menu.Item>
                        <Menu.Item icon={<TbTrash />} color="red" onClick={confirmDelete}>
                            Delete Script
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Tabs
                orientation="vertical" variant="pills"
                value={configTab} onTabChange={setConfigTab}
                className="flex-1"
                classNames={{
                    tab: "aspect-square p-xs",
                    panel: "pl-md",
                }}
            >
                <Tabs.List>
                    <TabHandle label="Triggers" icon={TbRun} />
                    <TabHandle label="Billing" icon={TbReportMoney} />
                    <TabHandle label="Usage" icon={TbChartLine} />
                </Tabs.List>

                <Tabs.Panel value="triggers">
                    {selectedTrigger ?
                        <SelectedTriggerConfig /> :
                        <TriggersConfig />}
                </Tabs.Panel>

                <Tabs.Panel value="billing">
                    <BillingConfig />
                </Tabs.Panel>

                <Tabs.Panel value="usage">
                    <ConfigPanel title="Usage">
                        <Text align="center" color="dimmed">Detailed usage coming soon</Text>
                    </ConfigPanel>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    )
}


function TabHandle({ label, value, icon: Icon }) {
    return (
        <Tooltip label={label} position="right">
            <Tabs.Tab value={value ?? label.toLowerCase()}>
                <Icon size={ICON_SIZE} />
            </Tabs.Tab>
        </Tooltip>
    )
}
