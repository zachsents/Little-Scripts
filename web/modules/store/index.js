import { create } from "zustand"


export const useMainStore = create((set) => ({
    configTab: "triggers",
    setConfigTab: (tab) => set({ configTab: tab }),
    editorTab: "code",
    setEditorTab: (tab) => set({ editorTab: tab }),

    selectedTrigger: null,
    setSelectedTrigger: (triggerId) => set({ selectedTrigger: triggerId }),

    isCodeDirty: false,
    setCodeDirty: (isDirty = true) => set({ isCodeDirty: isDirty }),
}))