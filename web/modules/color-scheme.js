import { useLocalStorage } from "@mantine/hooks"


export function useColorScheme() {
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: "color-scheme",
        defaultValue: "light",
        getInitialValueInEffect: true,
    })
    const toggleColorScheme = value => setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))

    return [colorScheme, toggleColorScheme]
}