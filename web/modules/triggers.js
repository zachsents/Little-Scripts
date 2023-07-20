import { Button, CopyButton, Stack } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import ConfigButtons from "@web/components/ConfigButtons"
import ScheduleBuilder from "@web/components/ScheduleBuilder"
import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore"
import { TbCheck, TbClock, TbCopy, TbHandClick, TbLink, TbRun, TbWebhook } from "react-icons/tb"
import { useQuery } from "react-query"
import { ASYNC_TRIGGER_URL, RUN_STATUS, SCRIPT_RUN_COLLECTION, SYNC_TRIGGER_URL, TRIGGER_COLLECTION, TRIGGER_TYPE, isStatusFinished } from "shared"
import { fire, useScript } from "./firebase"
import { useMainStore } from "./store"
import { useQueryWithPayload } from "./util"
import { INTERVAL_UNITS } from "./util/scheduling"
import { logEvent } from "firebase/analytics"


export const TriggerInfo = {
    [TRIGGER_TYPE.MANUAL]: {
        name: "Manual",
        description: "Triggered manually.",
        renderSubtitle: () => "Click to run",
        icon: TbHandClick,
        color: "dark",
        allowMultiple: false,
        config: ({ trigger }) => {

            const runQuery = useQuery({
                queryKey: ["run-trigger", trigger.id],
                queryFn: async () => {
                    const newDocRef = await addDoc(collection(fire.db, SCRIPT_RUN_COLLECTION), {
                        script: trigger.script,
                        trigger: doc(fire.db, TRIGGER_COLLECTION, trigger.id),
                        status: RUN_STATUS.PENDING,
                    })

                    console.debug("Script run created:", newDocRef.id)
                    logEvent(fire.analytics, "run_script_manually", { scriptId: trigger.script.id })

                    return new Promise(resolve => {
                        const unsubscribe = onSnapshot(newDocRef, snapshot => {
                            const data = snapshot.data()
                            if (isStatusFinished(data?.status)) {
                                console.debug(data)
                                unsubscribe()
                                resolve()
                            }
                        })
                    })
                },
                enabled: false,
            })

            return (
                <Stack>
                    <Button
                        leftIcon={<TbRun />}
                        onClick={() => runQuery.refetch()}
                        loading={runQuery.isFetching}
                    >
                        Run Script
                    </Button>
                </Stack>
            )
        },
    },
    [TRIGGER_TYPE.RECURRING_SCHEDULE]: {
        name: "Schedule",
        description: "Triggered on a recurring schedule.",
        icon: TbClock,
        renderSubtitle: ({ trigger }) => {

            if (!trigger?.schedule)
                return "Click to configure"

            return `Every ${trigger.schedule.interval} ${INTERVAL_UNITS(trigger.schedule.interval != 1).find(x => x.value === trigger.schedule.intervalUnit).label}`
        },
        color: "dark",
        allowMultiple: true,
        config: ({ trigger }) => {

            const setSelectedTrigger = useMainStore(s => s.setSelectedTrigger)

            const [saveNewSchedule, saveQuery] = useQueryWithPayload(async newSchedule => {
                await updateDoc(doc(fire.db, TRIGGER_COLLECTION, trigger.id), {
                    schedule: newSchedule,
                })
            }, {
                queryKey: ["save-trigger", trigger.id],
                onSuccess: () => {
                    setSelectedTrigger(null)
                    notifications.show({
                        title: "Trigger saved!",
                    })
                }
            })

            return (
                <ScheduleBuilder
                    initial={trigger.schedule}
                    onSubmit={saveNewSchedule}
                >
                    <ConfigButtons
                        saveProps={{
                            loading: saveQuery.isFetching,
                        }}
                    />
                </ScheduleBuilder>
            )
        },
    },
    [TRIGGER_TYPE.ASYNC_URL]: {
        name: "Webhook (Async URL)",
        description: "Triggered by a request to a URL. Responds as soon as the request is received.",
        renderSubtitle: () => "Click to view details",
        icon: TbWebhook,
        color: "dark",
        allowMultiple: false,
        config: ({ trigger }) => {

            const url = ASYNC_TRIGGER_URL + trigger.id

            return (
                <Stack spacing="xs">
                    <CopyButton value={url}>
                        {({ copied, copy }) => (
                            <Button
                                variant="subtle"
                                leftIcon={copied ? <TbCheck /> : <TbCopy />}
                                onClick={copy}
                            >
                                {copied ? "Copied!" : "Copy URL"}
                            </Button>
                        )}
                    </CopyButton>
                    <pre className="bg-gray-50 text-xs rounded-sm whitespace-pre-wrap break-all font-mono p-xs">
                        {url}
                    </pre>
                </Stack>
            )
        },
    },
    [TRIGGER_TYPE.SYNC_URL]: {
        name: "Request (Sync URL)",
        description: "Triggered by a request to a URL. Responds after the script has finished running.",
        renderSubtitle: () => "Click to view details",
        icon: TbLink,
        color: "dark",
        allowMultiple: false,
        config: ({ trigger }) => {

            const url = SYNC_TRIGGER_URL + trigger.id

            return (
                <Stack spacing="xs">
                    <CopyButton value={url}>
                        {({ copied, copy }) => (
                            <Button
                                variant="subtle"
                                leftIcon={copied ? <TbCheck /> : <TbCopy />}
                                onClick={copy}
                            >
                                {copied ? "Copied!" : "Copy URL"}
                            </Button>
                        )}
                    </CopyButton>
                    <pre className="bg-gray-50 text-xs rounded-sm whitespace-pre-wrap break-all font-mono p-xs">
                        {url}
                    </pre>
                </Stack>
            )
        },
    }
}


export function useSelectedTrigger() {

    const { script } = useScript()
    const selectedTriggerId = useMainStore(s => s.selectedTrigger)

    return script?.triggers?.find(trigger => trigger.id === selectedTriggerId)
}