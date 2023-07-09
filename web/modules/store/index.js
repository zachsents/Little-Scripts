import { create } from "zustand"


export const useMainStore = create((set) => ({
    configTab: "triggers",
    setConfigTab: (tab) => set({ configTab: tab }),
    editorTab: "code",
    setEditorTab: (tab) => set({ editorTab: tab }),

    code: `
// This is a comment
// This is another comment
// This is a third comment
// This is a fourth comment
`,
    isCodeDirty: false,
    saveCode: (newCode) => set({
        isCodeDirty: false,
        code: newCode,
    }),
    setCodeDirty: (isDirty = true) => set({ isCodeDirty: isDirty }),
}))