import { Text } from "@mantine/core"
import Link from "next/link"

export default function NavLink({ children, href, ...props }) {

    const textComponent =
        <Text className="cursor-pointer hover:text-primary-400 transition-colors" color="primary.7"  {...props}>
            {children}
        </Text>

    return href ?
        <Link href={href} className="no-underline">{textComponent}</Link> :
        textComponent
}