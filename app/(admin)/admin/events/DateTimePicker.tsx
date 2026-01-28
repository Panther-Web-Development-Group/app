"use client"

import { useMemo, useState, type FC } from "react"
import { DatePicker } from "@/app/components/Form/DatePicker"
import { Input } from "@/app/components/Form/Input"
import { Label } from "@/app/components/Form/Label"
import { cn } from "@/lib/cn"

type DateTimePickerProps = {
  name: string
  label?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  className?: string
  description?: string
}

function toYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function toTime(d: Date) {
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

function parseDateTimeLocal(value: string | null | undefined): { date: string | null; time: string } {
  if (!value) return { date: null, time: "00:00" }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return { date: null, time: "00:00" }
  return { date: toYmd(d), time: toTime(d) }
}

function combineDateTime(date: string | null, time: string): string {
  if (!date) return ""
  return `${date}T${time}`
}

export const DateTimePicker: FC<DateTimePickerProps> = ({
  name,
  label,
  required,
  disabled,
  defaultValue,
  className,
  description,
}) => {
  const initial = useMemo(() => parseDateTimeLocal(defaultValue), [defaultValue])
  const [date, setDate] = useState<string | null>(initial.date)
  const [time, setTime] = useState<string>(initial.time)

  const datetimeLocal = useMemo(() => combineDateTime(date, time), [date, time])

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={`${name}-date`} className="block text-sm font-semibold text-foreground/80">
          {label}
          {required ? <span aria-hidden className="text-red-500"> *</span> : null}
        </Label>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
        <DatePicker
          value={date}
          onValueChange={setDate}
          disabled={disabled}
          placeholder="Select date…"
          className="w-full"
        />
        <Input
          id={`${name}-time`}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={disabled}
          required={required && !date}
          className={cn(
            "h-10 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
            "transition-colors",
            "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
            disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/15"
          )}
        />
      </div>

      <input type="hidden" name={name} value={datetimeLocal} />

      {description ? (
        <div className="text-xs leading-5 text-foreground/70">{description}</div>
      ) : null}
    </div>
  )
}
