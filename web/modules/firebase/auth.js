import { doc, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useUser } from "reactfire"
import { STRIPE_CUSTOMERS_COLLECTION } from "shared"
import { fire } from "."


export function useUserReady() {
    const { status: authStatus, data: user } = useUser()
    const isSignedIn = authStatus == "success" && !!user

    const [hasCustomerObject, setHasCustomerObject] = useState(false)

    useEffect(() => {
        if (isSignedIn)
            return onSnapshot(
                doc(fire.db, STRIPE_CUSTOMERS_COLLECTION, user.uid),
                snapshot => {
                    if (snapshot.exists())
                        setHasCustomerObject(true)
                }
            )
    }, [isSignedIn])

    return isSignedIn && hasCustomerObject
}