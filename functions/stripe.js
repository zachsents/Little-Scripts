import { HttpsError, onCall } from "firebase-functions/v2/https"
import { PLAN_STRIPE_PRICE_ID, SCRIPT_COLLECTION, STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { Stripe } from "stripe"
import { ownsScript } from "./index.js"
import { db, stripeKey } from "./init.js"


export const onRequestStripeSetupIntent = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const intent = await stripe.setupIntents.create({
        payment_method_types: ["card"],
        customer: customerId,
        usage: "off_session",
    })

    return {
        id: intent.id,
        clientSecret: intent.client_secret,
    }
})


export const onRequestPaymentMethods = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
        type: "card",
    })

    return paymentMethods.data
})


export const onRequestChangePlanForScript = onCall({
    secrets: [stripeKey],
}, async (req) => {

    if (!(await ownsScript(req.auth.uid, req.data.scriptId)))
        throw new HttpsError("permission-denied", "You do not own this script")

    const stripe = new Stripe(stripeKey.value())

    let siPaymentMethod
    if (req.data.setupIntent) {
        const intent = await stripe.setupIntents.retrieve(req.data.setupIntent)
        siPaymentMethod = intent.payment_method
    }

    await changePlanForScipt(stripe, {
        scriptId: req.data.scriptId,
        plan: req.data.plan,
        paymentMethod: req.data.paymentMethod || siPaymentMethod,
    })
})


export const onRequestScriptUsage = onCall({
    secrets: [stripeKey],
}, async (req) => {

    if (!(await ownsScript(req.auth.uid, req.data.scriptId)))
        throw new HttpsError("permission-denied", "You do not own this script")

    const stripe = new Stripe(stripeKey.value())

    return getUsageForScript(stripe, req.data.scriptId)
})


/**
 * @param {{ auth: { uid: string } } | string} reqOrUid
 */
export async function getStripeCustomerId(reqOrUid) {
    const uid = typeof reqOrUid === "string" ? reqOrUid : reqOrUid.auth.uid
    const userDoc = await db.collection(STRIPE_CUSTOMERS_COLLECTION).doc(uid).get()
    return userDoc.data().stripeId
}


/**
 * @param {Stripe} stripe
 * @param {string} scriptId
 */
export async function getSubscriptionForScript(stripe, scriptId, retrieve = true) {

    const owner = await db.collection(SCRIPT_COLLECTION).doc(scriptId).get()
        .then(doc => doc.data().owner)

    const subscriptionId = await db.collection(STRIPE_CUSTOMERS_COLLECTION)
        .doc(owner).collection("subscriptions")
        .where("metadata.scriptId", "==", scriptId)
        .get()
        .then(snapshot => {
            if (snapshot.empty)
                throw new HttpsError("not-found", "No subscription found for this script")
            return snapshot.docs[0].id
        })

    return retrieve ?
        stripe.subscriptions.retrieve(subscriptionId) :
        subscriptionId
}


/**
 * @param {Stripe} stripe
 * @param {string} scriptId
 */
export async function getUsageForScript(stripe, scriptId) {

    const subscription = await getSubscriptionForScript(stripe, scriptId)

    const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
        subscription.items.data[0].id,
        { limit: 1 }
    )

    return usageRecords.data[0]
}


/**
 * @param {Stripe} stripe
 * @param {object} parameters
 * @param {string} parameters.scriptId
 * @param {string} parameters.plan
 * @param {string} parameters.paymentMethod Payment method ID that belongs to the customer
 */
export async function changePlanForScipt(stripe, { scriptId, plan, paymentMethod } = {}) {

    const subscription = await getSubscriptionForScript(stripe, scriptId)

    const requestedPriceId = PLAN_STRIPE_PRICE_ID[plan]

    if (subscription.items.data[0].price.id === requestedPriceId)
        throw new HttpsError("already-exists", "You are already subscribed to this plan")

    // const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
    //     subscription.items.data[0].id,
    //     { limit: 1 }
    // )

    await stripe.subscriptions.update(subscription.id, {
        proration_behavior: "none",
        billing_cycle_anchor: "unchanged",
        items: [{
            id: subscription.items.data[0].id,
            price: requestedPriceId,
        }],
        default_payment_method: paymentMethod,
    })

    // Not sure if we need to do this or not
    // await stripe.subscriptionItems.createUsageRecord(newSubscription.items.data[0].id, {
    //     action: "set",
    //     quantity: Math.min(
    //         usageRecords.data[0].total_usage,
    //         MAX_FREE_RUNS,
    //     ),
    // })
}