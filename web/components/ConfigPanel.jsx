import { ScrollArea, Stack, Title } from "@mantine/core"
import React from "react"

export default function ConfigPanel({ title, children, }) {
    return (
        <Stack className="h-full">
            <Title order={4}>{title}</Title>

            <ScrollArea.Autosize
                className="grow basis-0 min-h-0"
                offsetScrollbars
                scrollbarSize={6}
                classNames={{
                    viewport: "pr-xs"
                }}
            >
                {children}
            </ScrollArea.Autosize>
        </Stack>
    )
}
