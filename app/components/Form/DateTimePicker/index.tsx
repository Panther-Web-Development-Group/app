"use client"

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react"
import type { DateTimePickerProps } from "./types"
import { cn } from "@/lib/cn"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "../../Button"
import { Input } from "../Input"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseYmd(s: string | null | undefined): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const da = Number(m[3])
  const d = new Date(y, mo, da)
  if (Number.isNaN(d.getTime())) return null
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null
  return d
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

function isAfter(a: Date, b: Date) {
  return a.getTime() > b.getTime()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function formatDisplayDate(ymd: string): string {
  const d = parseYmd(ymd)
  if (!d) return ymd
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function inBounds(d: Date, min?: Date | null, max?: Date | null) {
  if (min && isBefore(d, min)) return false
  if (max && isAfter(d, max)) return false
  return true
}

/** Parse ISO datetime "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss" */
function parseISO(iso: string | null | undefined): { ymd: string; time: string } | null {
  if (!iso || !iso.trim()) return null
  const i = iso.indexOf("T")
  if (i === -1) return null
  const ymd = iso.slice(0, i)
  const timePart = iso.slice(i + 1).trim()
  if (!/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(timePart)) return parseYmd(ymd) ? { ymd, time: "00:00" } : null
  const parts = timePart.split(":")
  const h = (parts[0] ?? "0").padStart(2, "0")
  const m = (parts[1] ?? "0").padStart(2, "0")
  const s = parts[2] != null ? String(parts[2]).padStart(2, "0") : "00"
  const showSec = timePart.split(":").length >= 3
  const time = showSec ? `${h}:${m}:${s}` : `${h}:${m}`
  return parseYmd(ymd) ? { ymd, time } : null
}

function toISO(ymd: string | null, time: string | null, showSeconds: boolean): string | null {
  if (!ymd || !parseYmd(ymd)) return null
  if (!time || !time.trim()) return ymd + "T00:00" + (showSeconds ? ":00" : "")
  const parts = time.trim().split(":")
  const h = (parts[0] ?? "00").padStart(2, "0")
  const m = (parts[1] ?? "00").padStart(2, "0")
  const s = (parts[2] ?? "00").padStart(2, "0")
  return showSeconds ? `${ymd}T${h}:${m}:${s}` : `${ymd}T${h}:${m}`
}

function timeToInputValue(time: string | null, showSeconds: boolean): string {
  if (!time || !time.trim()) return ""
  const parts = time.trim().split(":")
  const h = (parts[0] ?? "00").padStart(2, "0")
  const m = (parts[1] ?? "00").padStart(2, "0")
  const s = (parts[2] ?? "00").padStart(2, "0")
  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
}

const navButtonClass =
  "h-9 w-9 shrink-0 rounded-md border border-(--pw-border) bg-background/10 p-0 text-foreground/80 hover:bg-background/15 hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--pw-ring) disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center"
const clearButtonClass =
  "h-9 w-9 shrink-0 rounded-md border border-(--pw-border) bg-background/10 p-0 text-foreground/70 hover:bg-background/15 hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--pw-ring) inline-flex items-center justify-center"
const todayButtonClass =
  "rounded-md border border-(--pw-border) bg-background/10 px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-background/15 focus-visible:ring-2 focus-visible:ring-(--pw-ring) inline-flex items-center justify-center"

function DayButton({
  day,
  disabled,
  selected,
  isToday,
  isOutside,
  onClick,
}: {
  day: Date
  disabled: boolean
  selected: boolean
  isToday: boolean
  isOutside: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
        disabled ? "cursor-not-allowed text-foreground/35" : "text-foreground/85 hover:bg-background/15",
        isOutside && !selected && "text-foreground/45",
        isToday && !selected && "bg-accent/20 text-accent-foreground font-semibold",
        selected && "bg-accent text-accent-foreground font-semibold"
      )}
      aria-label={toYmd(day)}
    >
      {day.getDate()}
    </button>
  )
}

function CalendarMonth({
  year,
  month,
  selected,
  min,
  max,
  onPick,
}: {
  year: number
  month: number
  selected?: Date | null
  min?: Date | null
  max?: Date | null
  onPick: (d: Date) => void
}) {
  const first = startOfMonth(year, month)
  const leading = first.getDay()
  const count = daysInMonth(year, month)
  const days: Array<Date | null> = []
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevCount = daysInMonth(prevYear, prevMonth)
  for (let i = leading - 1; i >= 0; i--) {
    days.push(new Date(prevYear, prevMonth, prevCount - i))
  }
  for (let d = 1; d <= count; d++) days.push(new Date(year, month, d))
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push(new Date(year, month + 1, d))
  }
  const today = useMemo(() => new Date(), [])

  return (
    <div className="w-74">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-foreground/60">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} className="h-9 w-9" />
          const disabled = !inBounds(d, min, max)
          const selectedSingle = selected ? isSameDay(d, selected) : false
          const isOutsideDay = d.getMonth() !== month
          const isTodayDay = isSameDay(d, today)
          return (
            <DayButton
              key={toYmd(d)}
              day={d}
              disabled={disabled}
              selected={selectedSingle}
              isToday={isTodayDay}
              isOutside={isOutsideDay}
              onClick={() => onPick(d)}
            />
          )
        })}
      </div>
    </div>
  )
}

export const DateTimePicker: FC<DateTimePickerProps> = ({
  className,
  name,
  disabled,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Select date and time…",
  min,
  max,
  showSeconds = false,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue)
  const value = isControlled ? (valueProp as string | null) : uncontrolled

  const parsed = useMemo(() => parseISO(value), [value])
  const dateYmd = parsed?.ymd ?? null
  const timeStr = parsed?.time ?? "00:00" + (showSeconds ? ":00" : "")
  const selectedDate = useMemo(() => parseYmd(dateYmd), [dateYmd])

  const minDate = useMemo(() => (min ? parseISO(min) : null), [min])
  const maxDate = useMemo(() => (max ? parseISO(max) : null), [max])
  const minDateOnly = minDate ? parseYmd(minDate.ymd) : null
  const maxDateOnly = maxDate ? parseYmd(maxDate.ymd) : null

  const emit = useCallback(
    (next: string | null) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const today = useMemo(() => new Date(), [])
  const initialMonth = selectedDate ?? today
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth())
  const [localTime, setLocalTime] = useState(timeToInputValue(timeStr, showSeconds))

  useEffect(() => {
    setLocalTime(timeToInputValue(timeStr, showSeconds))
  }, [timeStr, showSeconds])

  useEffect(() => {
    if (!selectedDate) return
    setTimeout(() => {
      setViewYear(selectedDate.getFullYear())
      setViewMonth(selectedDate.getMonth())
    }, 0)
  }, [selectedDate])

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const ctrl = new AbortController()
    document.addEventListener("mousedown", onPointerDown, { signal: ctrl.signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal: ctrl.signal })
    document.addEventListener("keydown", onKeyDown, { signal: ctrl.signal })
    return () => ctrl.abort()
  }, [open])

  const id = useId()
  const buttonId = `${id}-datetime-trigger`

  const display = value
    ? `${formatDisplayDate(parsed?.ymd ?? "")} ${timeToInputValue(parsed?.time ?? null, showSeconds)}`
    : placeholder

  const canGoPrev = useMemo(() => {
    if (!minDateOnly) return true
    const viewStart = startOfMonth(viewYear, viewMonth)
    return !isBefore(viewStart, minDateOnly)
  }, [minDateOnly, viewMonth, viewYear])

  const canGoNext = useMemo(() => {
    if (!maxDateOnly) return true
    const viewEnd = new Date(viewYear, viewMonth + 1, 0)
    return !isAfter(viewEnd, maxDateOnly)
  }, [maxDateOnly, viewMonth, viewYear])

  const goPrev = useCallback(() => {
    const prev = addMonths(viewYear, viewMonth, -1)
    setViewYear(prev.year)
    setViewMonth(prev.month)
  }, [viewMonth, viewYear])

  const goNext = useCallback(() => {
    const next = addMonths(viewYear, viewMonth, 1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }, [viewMonth, viewYear])

  const handlePickDay = useCallback(
    (d: Date) => {
      if (!inBounds(d, minDateOnly, maxDateOnly)) return
      const ymd = toYmd(d)
      const next = toISO(ymd, localTime.trim() ? localTime : "00:00" + (showSeconds ? ":00" : ""), showSeconds)
      emit(next)
    },
    [emit, localTime, minDateOnly, maxDateOnly, showSeconds]
  )

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setLocalTime(v)
      const ymd = dateYmd ?? toYmd(today)
      if (!inBounds(parseYmd(ymd) ?? today, minDateOnly, maxDateOnly)) return
      const next = toISO(ymd, v || null, showSeconds)
      if (next) emit(next)
    },
    [dateYmd, emit, maxDateOnly, minDateOnly, showSeconds, today]
  )

  const handleToday = useCallback(() => {
    const todayYmd = toYmd(today)
    if (!inBounds(today, minDateOnly, maxDateOnly)) return
    const t = today.getHours().toString().padStart(2, "0") + ":" + today.getMinutes().toString().padStart(2, "0") + (showSeconds ? ":" + today.getSeconds().toString().padStart(2, "0") : "")
    setLocalTime(t)
    emit(toISO(todayYmd, t, showSeconds))
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setOpen(false)
  }, [emit, maxDateOnly, minDateOnly, showSeconds, today])

  const handleClear = useCallback(() => {
    emit(null)
    setLocalTime("00:00" + (showSeconds ? ":00" : ""))
    setOpen(false)
  }, [emit, showSeconds])

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={cn("relative", className)}
      data-disabled={disabled ? "" : undefined}
    >
      {!disabled && name && value ? <input type="hidden" name={name} value={value} /> : null}

      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        data-empty={!value}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-normal outline-none",
          "transition-colors focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-background/15",
          "data-[empty=true]:text-foreground/50"
        )}
      >
        <span className="truncate text-left">{display}</span>
        <Calendar className="h-4 w-4 shrink-0 text-foreground/70" />
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-labelledby={buttonId}
          className="absolute left-0 top-full z-50 mt-2 w-auto rounded-lg border border-(--pw-border) bg-background p-0 shadow-[0_10px_30px_var(--pw-shadow)]"
        >
          <div className="flex items-center gap-1 border-b border-(--pw-border) p-2">
            <Button type="button" disabled={!canGoPrev} onClick={goPrev} className={navButtonClass} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-1 items-center justify-center text-sm font-medium text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <Button type="button" disabled={!canGoNext} onClick={goNext} className={navButtonClass} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="button" disabled={disabled} onClick={handleToday} className={todayButtonClass} aria-label="Today">
              Today
            </Button>
            <Button type="button" disabled={disabled} onClick={handleClear} className={clearButtonClass} aria-label="Clear" title="Clear">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3">
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              selected={selectedDate}
              min={minDateOnly}
              max={maxDateOnly}
              onPick={handlePickDay}
            />
            <div className="mt-3 border-t border-(--pw-border) pt-3">
              <label htmlFor={`${id}-time`} className="mb-1.5 block text-xs font-medium text-foreground/70">
                Time
              </label>
              <Input
                id={`${id}-time`}
                type="time"
                value={localTime}
                onChange={handleTimeChange}
                step={showSeconds ? 1 : 60}
                disabled={disabled}
                className={cn(
                  "h-9 w-full rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
                  "focus-visible:ring-2 focus-visible:ring-(--pw-ring)"
                )}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
