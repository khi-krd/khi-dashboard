import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid"

import { cn } from "@/lib/utils"

export interface ToastAlertProps {
  variant: "success" | "error" | "warning" | "info" | "neutral"
  title: string
  description?: string
  onClose?: () => void
  size?: "sm" | "md"
  banner?: boolean
  className?: string
}

const variantClasses: Record<ToastAlertProps["variant"], string> = {
  success:
    "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
  error:
    "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  warning:
    "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  info: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  neutral: "bg-muted border-border text-foreground",
}

const variantIcons: Record<
  ToastAlertProps["variant"],
  typeof CheckCircleIcon
> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  neutral: InformationCircleIcon,
}

export function ToastAlert({
  variant,
  title,
  description,
  onClose,
  size = "md",
  banner = false,
  className,
}: ToastAlertProps) {
  const Icon = variantIcons[variant]
  const showClose = Boolean(onClose) && !banner

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 border px-3.5 py-2.5 text-sm",
        !banner && "rounded-lg",
        banner && "rounded-r-lg border-l-[3px] border-t border-r border-b",
        variantClasses[variant],
        size === "sm" && "px-3 py-2 text-xs",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium",
            size === "md" ? "text-[13.5px]" : "text-xs",
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              "mt-0.5 opacity-85",
              size === "md" ? "text-[12.5px]" : "text-[11px]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {showClose ? (
        <button
          type="button"
          onClick={onClose}
          className="-m-0.5 shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="داخستن"
        >
          <XMarkIcon className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
