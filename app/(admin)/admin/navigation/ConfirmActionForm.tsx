"use client"
import type { ReactNode } from "react"

export function ConfirmActionForm({
  action,
  confirmText,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>
  confirmText: string
  className?: string
  children: ReactNode
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      {children}
    </form>
  )
}

