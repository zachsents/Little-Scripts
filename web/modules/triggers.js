import { Button, Stack } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import ConfigButtons from "@web/components/ConfigButtons"
import ScheduleBuilder from "@web/components/ScheduleBuilder"
import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore"
import { TbClock, TbHandClick, TbRun } from "react-icons/tb"
import { useQuery } from "react-query"
import { RUN_STATUS, TRIGGER_TYPE, isStatusFinished } from "shared"
import { fire, useScript } from "./firebase"
import { useMainStore } from "./store"
import { useQueryWithPayload } from "./util"
import { INTERVAL_UNITS } from "./util/scheduling"


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
                    const newDocRef = await addDoc(collection(fire.db, "script-runs"), {
                        script: trigger.script,
                        trigger: doc(fire.db, "triggers", trigger.id),
                        status: RUN_STATUS.PENDING,
                    })

                    console.debug("Script run created:", newDocRef.id)

                    return new Promise(resolve => {
                        onSnapshot(newDocRef, snapshot => {
                            const data = snapshot.data()
                            if (isStatusFinished(data.status)) {
                                console.debug(data)
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
                await updateDoc(doc(fire.db, "triggers", trigger.id), {
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
}


export function useSelectedTrigger() {

    const { script } = useScript()
    const selectedTriggerId = useMainStore(s => s.selectedTrigger)

    return script?.triggers?.find(trigger => trigger.id === selectedTriggerId)
}