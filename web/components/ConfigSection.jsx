import { Tabs, Tooltip } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import { TbChartLine, TbReportMoney, TbRun } from "react-icons/tb"
import BillingConfig from "./BillingConfig"
import TriggersConfig from "./TriggersConfig"
import ConfigPanel from "./ConfigPanel"


const ICON_SIZE = "1.5rem"


export default function ConfigSection() {

    const configTab = useMainStore(s => s.configTab)
    const setConfigTab = useMainStore(s => s.setConfigTab)

    return (
        <Tabs
            orientation="vertical" variant="pills"
            value={configTab} onTabChange={setConfigTab}
            classNames={{
                tab: "aspect-square p-xs",
                panel: "pl-md",
            }}
            w="22rem"
        >
            <Tabs.List>
                <TabHandle label="Triggers" icon={TbRun} />
                <TabHandle label="Billing" icon={TbReportMoney} />
                <TabHandle label="Usage" icon={TbChartLine} />
            </Tabs.List>

            <Tabs.Panel value="triggers">
                <TriggersConfig />
            </Tabs.Panel>

            <Tabs.Panel value="billing">
                <BillingConfig />
            </Tabs.Panel>

            <Tabs.Panel value="usage">
                <ConfigPanel title="Usage">

                </ConfigPanel>
            </Tabs.Panel>


        </Tabs>
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
