import { Text } from "@mantine/core"
import classNames from "classnames"
import Link from "next/link"

export default function NavLink({ children, href, className = "", ...props }) {

    const textComponent =
        <Text className={classNames("cursor-pointer hover:text-primary-400 transition-colors text-primary-700", className)} {...props}>
            {children}
        </Text>

    return href ?
        <Link href={href} className="no-underline">{textComponent}</Link> :
        textComponent
}