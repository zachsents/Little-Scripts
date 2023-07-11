import { writeBatch } from "firebase/firestore"
import { fire } from "."


export async function updateOrCreateDoc(ref, data, batch) {
    const noBatchPassed = !batch
    batch ??= writeBatch(fire.db)
    batch.set(ref, {}, { merge: true })
    batch.update(ref, data)

    if (noBatchPassed)
        await batch.commit()
}