import { defineSecret } from "firebase-functions/params"
import { onCall } from "firebase-functions/v2/https"
import { BASE_URL, STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { Stripe } from "stripe"
import { db } from "./init.js"


const stripeKey = defineSecret("firestore-stripe-payments-STRIPE_API_KEY")


export const onRequestStripeCustomerPortalSession = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${BASE_URL}/script/${req.data.scriptId}?tab=billing`
    })

    return session.url
})


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


export const onRequestCreateStripeSubscription = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    await stripe.subscriptions.create({
        customer: customerId,
        items: [
            { price: "price_1NTGEHFpVzJHyi82wSb7T4Wb" },
        ],
        expand: ["latest_invoice.payment_intent"],
        collection_method: "charge_automatically",
        currency: "usd",
        metadata: {
            scriptId: req.data.scriptId,
        },
    }, {
        idempotencyKey: req.data.intentId,
    })
})


export const onRequestSubscriptionForScript = onCall({
    secrets: [stripeKey],
}, async (req) => {

    const stripe = new Stripe(stripeKey.value())

    const customerId = await getStripeCustomerId(req)

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
    })

    return subscriptions.data.find(sub => sub.metadata.scriptId === req.data.scriptId)
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


async function getStripeCustomerId(reqOrUid) {
    const uid = typeof reqOrUid === "string" ? reqOrUid : reqOrUid.auth.uid
    const userDoc = await db.collection(STRIPE_CUSTOMERS_COLLECTION).doc(uid).get()
    return userDoc.data().stripeId
}