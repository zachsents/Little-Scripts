import { Group, ScrollArea, Stack, Title } from "@mantine/core"


export default function ConfigPanel({ title, children, rightSection }) {
    return (
        <Stack className="h-full">
            <Group noWrap position="apart">
                {typeof title === "string" ?
                    <Title order={4}>{title}</Title> :
                    title}
                {rightSection}
            </Group>

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
