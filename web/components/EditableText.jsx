import { TextInput, Textarea, Tooltip } from "@mantine/core"
import classNames from "classnames"
import { useEffect, useRef, useState } from "react"


export default function EditableText({ textArea = false, highlight = false, initialValue, onEdit, onCancel, tooltip = false, tooltipProps = {}, className, ...props }) {

    // local state
    const [value, setValue] = useState(initialValue)

    const ref = useRef()

    // handle edit
    const handleEdit = () => {
        value != initialValue ?
            onEdit?.(value) :
            onCancel?.()
    }

    // sync with outside state
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    // highlight input
    useEffect(() => {
        if (highlight) {
            ref.current?.focus()
            ref.current?.select()
        }
    }, [highlight])

    // handle enter key
    const handleKeyUp = event => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey || !textArea))
            handleEdit()
        if (event.key === "Escape")
            onCancel?.()
    }

    const Component = textArea ? Textarea : TextInput

    const inputComponent = (
        <Component
            value={value}
            onChange={event => setValue(event.currentTarget.value)}
            className={classNames(
                "border-none bg-transparent cursor-pointer transition-colors",
                className,
            )}
            onBlur={handleEdit}
            onKeyUp={handleKeyUp}
            {...props}
            ref={ref}
        />
    )

    return tooltip ?
        <Tooltip label="Edit" position="right" {...tooltipProps}>
            {inputComponent}
        </Tooltip> :
        inputComponent
}