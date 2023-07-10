import { Stack, Tabs, Text, Title, Tooltip } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import { TbChartLine, TbReportMoney, TbRun } from "react-icons/tb"
import BillingConfig from "./BillingConfig"
import TriggersConfig from "./TriggersConfig"
import ConfigPanel from "./ConfigPanel"
import { useScript } from "@web/modules/firebase"
import { useSelectedTrigger } from "@web/modules/triggers"
import SelectedTriggerConfig from "./SelectedTriggerConfig"


const ICON_SIZE = "1.5rem"


export default function ConfigSection() {

    const { script } = useScript()

    const configTab = useMainStore(s => s.configTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)

    const selectedTrigger = useSelectedTrigger()

    return (
        <Stack w="22rem">
            <Title order={3} className="bg-gray-100 rounded-lg px-lg py-xs">
                {script?.name}
            </Title>

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
