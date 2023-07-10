

export function getNextBillingCycleStartDate() {
    const date = new Date()
    date.setUTCMonth(date.getUTCMonth() + 1)
    date.setUTCDate(1)
    date.setUTCHours(6, 0, 0, 0)
    return date
}


export function getLastBillingCycleStartDate() {
    const date = new Date()
    date.setUTCDate(1)
    date.setUTCHours(6, 0, 0, 0)
    return date
}