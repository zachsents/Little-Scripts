import { Stack } from "@mantine/core"
import TriggerConfigCard from "./TriggerConfigCard"
import ConfigPanel from "./ConfigPanel"


export default function TriggersConfig() {
    return (
        <ConfigPanel title="Triggers">
            <Stack>
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
                <TriggerConfigCard />
            </Stack>
        </ConfigPanel>
    )
}
