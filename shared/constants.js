
export const RUN_STATUS = {
    RUNNING: "RUNNING",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    SCHEDULED: "SCHEDULED",
    PENDING_SCHEDULING: "PENDING_SCHEDULING",
}


export const TRIGGER_TYPE = {
    MANUAL: "trigger.manual",
    RECURRING_SCHEDULE: "trigger.recurring-schedule",
}


export const BASE_URL = process.env.NODE_ENV === "production" ? "https://littlescript.io" : "http://localhost:3000"


export const SCRIPT_RUN_COLLECTION = "script-runs"
export const TRIGGER_COLLECTION = "triggers"
export const SCRIPT_COLLECTION = "scripts"
export const USER_COLLECTION = "users"

export const STRIPE_CUSTOMERS_COLLECTION = "stripe-customers"
export const STRIPE_PRODUCTS_COLLECTION = "stripe-products"


export const SOURCE_FILE_PATH = scriptId => `scripts/${scriptId}/source.js`
export const LOG_FILE_PATH = (scriptId, scriptRunId) => `scripts/${scriptId}/runs/${scriptRunId}/log.txt`

export const SIGNED_URL_EXPIRATION = 15 * 60 * 1000 // 15 minutes

export const MAX_FREE_RUNS = 100
export const COST_PER_RUN = 0.01


export function isStatusFinished(status) {
    return status === RUN_STATUS.COMPLETED || status === RUN_STATUS.FAILED || status === RUN_STATUS.CANCELLED
}