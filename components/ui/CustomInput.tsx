import * as React from "react"

import { cn } from "@/lib/utils"

const CustomInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "w-full px-4 py-2 text-center rounded-lg border border-gray-300",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
CustomInput.displayName = "CustomInput"

export {CustomInput}
