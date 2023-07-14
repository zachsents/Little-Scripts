
// ===== Application =====

export const BASE_URL = process.env.NODE_ENV === "production" ?
    "https://littlescript.io" :
    "http://localhost:3000"

export const FUNCTIONS_URL = process.env.NODE_ENV === "production" ?
    functionName => `https://us-central1-little-scripts-391918.cloudfunctions.net/${functionName}` :
    functionName => `http://localhost:5001/little-scripts-391918/us-central1/${functionName}`

export const MAX_FREE_RUNS = 100
export const COST_PER_RUN = 0.01
export const SIGNED_URL_EXPIRATION = 15 * 60 * 1000 // 15 minutes


// ===== Scripts =====

export const RUN_STATUS = {
    RUNNING: "RUNNING",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    SCHEDULED: "SCHEDULED",
    PENDING_SCHEDULING: "PENDING_SCHEDULING",
}

export function isStatusFinished(status) {
    return status === RUN_STATUS.COMPLETED || status === RUN_STATUS.FAILED || status === RUN_STATUS.CANCELLED
}

export const TRIGGER_TYPE = {
    MANUAL: "trigger.manual",
    RECURRING_SCHEDULE: "trigger.recurring-schedule",
    ASYNC_URL: "trigger.url-async",
    SYNC_URL: "trigger.url-sync",
}

export const SCRIPT_RUN_COLLECTION = "script-runs"
export const TRIGGER_COLLECTION = "triggers"
export const SCRIPT_COLLECTION = "scripts"
export const USER_COLLECTION = "users"

export const SOURCE_FILE_PATH = scriptId => `scripts/${scriptId}/source.js`
export const LOG_FILE_PATH = (scriptId, scriptRunId) => `scripts/${scriptId}/runs/${scriptRunId}/log.txt`

export const ASYNC_TRIGGER_URL = triggerId => process.env === "production" ?
    `${BASE_URL}/trigger/async-url?t=${triggerId}` :
    `${FUNCTIONS_URL("onRequestAsyncUrlTrigger")}?t=${triggerId}`

export const SYNC_TRIGGER_URL = triggerId => process.env === "production" ?
    `${BASE_URL}/trigger/sync-url?t=${triggerId}` :
    `${FUNCTIONS_URL("onRequestSyncUrlTrigger")}?t=${triggerId}`


// ===== Stripe =====

export const STRIPE_CUSTOMERS_COLLECTION = "stripe-customers"
export const STRIPE_PRODUCTS_COLLECTION = "stripe-products"

export const STRIPE_FREE_PRICE_ID = "price_1NTZ3dFpVzJHyi82UMmAOOMg"
export const STRIPE_LITTLE_PRICE_ID = "price_1NTZ3dFpVzJHyi82JtiiFCIB"
export const PLAN = {
    FREE: "free",
    LITTLE: "little",
}
export const PLAN_STRIPE_PRICE_ID = {
    [PLAN.FREE]: STRIPE_FREE_PRICE_ID,
    [PLAN.LITTLE]: STRIPE_LITTLE_PRICE_ID,
}
export const PRICE_ID_PLAN = {
    [STRIPE_FREE_PRICE_ID]: PLAN.FREE,
    [STRIPE_LITTLE_PRICE_ID]: PLAN.LITTLE,
}