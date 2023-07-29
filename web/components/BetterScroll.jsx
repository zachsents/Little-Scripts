import { ScrollArea } from "@mantine/core"


export default function BetterScroll({ children }) {
    return (
        <div className="flex flex-col h-full">
            <ScrollArea.Autosize
                className="grow basis-0 min-h-0 [&>div]:max-w-full"
                offsetScrollbars
                scrollbarSize={8}
                classNames={{
                    viewport: "pr-xs"
                }}
            >
                {children}
            </ScrollArea.Autosize>
        </div>
    )
}
