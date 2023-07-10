import { Button, Group } from "@mantine/core"
import { useMainStore } from "@web/modules/store"
import React from "react"

export default function ConfigButtons({ cancelProps, saveProps }) {

    const setSelectedTrigger = useMainStore(s => s.setSelectedTrigger)

    return (
        <Group grow mt="xs">
            <Button
                variant="subtle" color="red" type="button"
                onClick={() => setSelectedTrigger(null)}
                {...cancelProps}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                {...saveProps}
            >
                Save
            </Button>
        </Group>
    )
}
