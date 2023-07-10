import { getBlob, ref, uploadString } from "firebase/storage"
import { useQuery } from "react-query"
import { fire } from "."


export function useStorageFileContent(path) {

    const query = useQuery({
        queryKey: ["get-storage-file-content", path],
        queryFn: async () => {
            try {
                const blob = await getBlob(ref(fire.storage, path))
                return blob.text()
            }
            catch (err) {
                if (err.code === "storage/object-not-found")
                    return null

                throw err
            }
        },
        enabled: !!path,
    })

    return [query.data, query]
}


export function useSetStorageFileContent(path, content) {

    const query = useQuery({
        queryKey: ["set-storage-file-content", path],
        queryFn: async () => uploadString(ref(fire.storage, path), content),
        enabled: false,
    })

    return [query.refetch, query]
}