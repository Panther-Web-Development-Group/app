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
import type { DatePickerProps, DateRangePickerProps } from "./types"
import { cn } from "@/lib/cn"
import { Calendar, X } from "lucide-react"
import { Select, SelectContent, SelectOption, SelectTrigger } from "../Select"
import { NumberInput } from "../Number"
import { Button } from "../../Button"

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
  // ensure it round-trips (catches overflow like 2026-02-31)
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null
  return d
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

function daysInMonth(year: number, month: number) {
  // day 0 of next month is last day of current month
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function inBounds(d: Date, min?: Date | null, max?: Date | null) {
  if (min && isBefore(d, min)) return false
  if (max && isAfter(d, max)) return false
  return true
}

function DayButton({
  day,
  disabled,
  selected,
  inRange,
  isRangeEdge,
  onClick,
  onHover,
}: {
  day: Date
  disabled: boolean
  selected: boolean
  inRange: boolean
  isRangeEdge: boolean
  onClick: () => void
  onHover?: () => void
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md text-sm",
        disabled ? "cursor-not-allowed text-foreground/35" : "text-foreground/85 hover:bg-background/15",
        inRange ? "bg-accent/15" : "",
        selected ? "bg-accent/35 text-foreground shadow-[0_10px_30px_var(--pw-shadow)]" : "",
        isRangeEdge ? "ring-1 ring-(--pw-border)" : ""
      )}
      aria-label={toYmd(day)}
      variant="ghost"
      size="small"
    >
      {day.getDate()}
    </Button>
  )
}

function CalendarMonth({
  year,
  month,
  selected,
  range,
  hover,
  min,
  max,
  onPick,
  onHoverDay,
}: {
  year: number
  month: number
  selected?: Date | null
  range?: { start: Date | null; end: Date | null }
  hover?: Date | null
  min?: Date | null
  max?: Date | null
  onPick: (d: Date) => void
  onHoverDay?: (d: Date | null) => void
}) {
  const first = startOfMonth(year, month)
  const leading = first.getDay()
  const count = daysInMonth(year, month)

  const days: Array<Date | null> = []
  for (let i = 0; i < leading; i++) days.push(null)
  for (let d = 1; d <= count; d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(null)

  const rangeStart = range?.start ?? null
  const rangeEnd = range?.end ?? null
  const previewEnd = rangeEnd ?? hover

  const isInPreviewRange = useCallback(
    (d: Date) => {
      if (!rangeStart || !previewEnd) return false
      const a = rangeStart.getTime()
      const b = previewEnd.getTime()
      const lo = Math.min(a, b)
      const hi = Math.max(a, b)
      const t = d.getTime()
      return t >= lo && t <= hi
    },
    [previewEnd, rangeStart]
  )

  return (
    <div className="w-74">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-foreground/60">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} className="h-9 w-9" />

          const disabled = !inBounds(d, min, max)
          const selectedSingle = selected ? isSameDay(d, selected) : false

          const inRange = range ? isInPreviewRange(d) : false
          const isEdge =
            range &&
            ((rangeStart && isSameDay(d, rangeStart)) || (previewEnd && isSameDay(d, previewEnd)))

          return (
            <DayButton
              key={toYmd(d)}
              day={d}
              disabled={disabled}
              selected={selectedSingle || (range ? isEdge === true : false)}
              inRange={range ? inRange : false}
              isRangeEdge={Boolean(range && isEdge)}
              onClick={() => onPick(d)}
              onHover={onHoverDay ? () => onHoverDay(d) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}

export const DatePicker: FC<DatePickerProps> = ({
  className,
  name,
  disabled,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Select date…",
  min,
  max,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue)
  const value = isControlled ? (valueProp as string | null) : uncontrolled

  const selectedDate = useMemo(() => parseYmd(value), [value])
  const minDate = useMemo(() => parseYmd(min), [min])
  const maxDate = useMemo(() => parseYmd(max), [max])

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
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open])

  const id = useId()
  const buttonId = `${id}-date-trigger`

  const display = value ? value : placeholder

  return (
    <div {...divProps} ref={rootRef} className={cn("relative", className)} data-disabled={disabled ? "" : undefined}>
      {!disabled && name && value ? <input type="hidden" name={name} value={value} /> : null}

      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
          "transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-background/15"
        )}
      >
        <span className={cn("truncate text-left", value ? "text-foreground/90" : "text-foreground/50")}>{display}</span>
        <Calendar className="h-4 w-4 text-foreground/70" />
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-labelledby={buttonId}
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-full min-w-[20rem] overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-[0_10px_30px_var(--pw-shadow)]"
          )}
        >
          <div className="flex items-center gap-2 border-b border-(--pw-border) bg-secondary/20 p-2">
            <div className="flex-1">
              <Select value={String(viewMonth)} onValueChange={(v) => setViewMonth(Number(v))}>
                <SelectTrigger className="h-9" />
                <SelectContent>
                  {MONTHS.map((m, idx) => (
                    <SelectOption key={m} value={String(idx)}>
                      {m}
                    </SelectOption>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-28">
              <NumberInput
                value={viewYear}
                onValueChange={(n) => {
                  if (typeof n !== "number" || Number.isNaN(n)) return
                  setViewYear(Math.max(1, Math.floor(n)))
                }}
                min={1}
                step={1}
                inputClassName="h-9"
                aria-label="Year"
              />
            </div>

            <Button
              type="button"
              disabled={disabled}
              onClick={() => {
                emit(null)
                setOpen(false)
              }}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--pw-border) bg-background/10 text-foreground/70",
                disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20"
              )}
              aria-label="Clear"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3">
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              selected={selectedDate}
              min={minDate}
              max={maxDate}
              onPick={(d) => {
                if (!inBounds(d, minDate, maxDate)) return
                emit(toYmd(d))
                setOpen(false)
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
  className,
  name,
  nameStart: nameStartProp,
  nameEnd: nameEndProp,
  disabled,
  value: valueProp,
  defaultValue = [null, null],
  onValueChange,
  placeholder = "Select dates…",
  min,
  max,
  ...divProps
}) => {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = useState<[string | null, string | null]>(defaultValue)
  const value = (isControlled ? (valueProp as [string | null, string | null]) : uncontrolled) ?? [null, null]

  const start = value[0]
  const end = value[1]
  const startDate = useMemo(() => parseYmd(start), [start])
  const endDate = useMemo(() => parseYmd(end), [end])
  const minDate = useMemo(() => parseYmd(min), [min])
  const maxDate = useMemo(() => parseYmd(max), [max])

  const emit = useCallback(
    (next: [string | null, string | null]) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const today = useMemo(() => new Date(), [])
  const anchor = startDate ?? today
  const [viewYear, setViewYear] = useState(anchor.getFullYear())
  const [viewMonth, setViewMonth] = useState(anchor.getMonth())

  useEffect(() => {
    if (!startDate) return
    setTimeout(() => {
      setViewYear(startDate.getFullYear())
      setViewMonth(startDate.getMonth())
    }, 0)
  }, [startDate])

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const controller = new AbortController()
    const { signal } = controller
    document.addEventListener("mousedown", onPointerDown, { signal })
    document.addEventListener("touchstart", onPointerDown, { passive: true, signal })
    document.addEventListener("keydown", onKeyDown, { signal })
    return () => controller.abort()
  }, [open])

  const [hover, setHover] = useState<Date | null>(null)
  const [picking, setPicking] = useState<"start" | "end">("start")
  useEffect(() => {
    setTimeout(() => {
      if (startDate && !endDate) setPicking("end")
      if (!startDate) setPicking("start")
      if (startDate && endDate) setPicking("start")
    }, 0)
  }, [endDate, startDate])

  const nameStart = nameStartProp ?? (name ? `${name}_start` : undefined)
  const nameEnd = nameEndProp ?? (name ? `${name}_end` : undefined)

  const id = useId()
  const buttonId = `${id}-range-trigger`

  const display = start && end ? `${start} → ${end}` : start ? `${start} → …` : placeholder

  const pickDay = useCallback(
    (d: Date) => {
      if (!inBounds(d, minDate, maxDate)) return

      if (picking === "start") {
        emit([toYmd(d), null])
        setPicking("end")
        setHover(null)
        return
      }

      // picking end
      if (!startDate) {
        emit([toYmd(d), null])
        setPicking("end")
        return
      }

      const a = startDate
      const b = d
      const startFinal = isBefore(b, a) ? b : a
      const endFinal = isBefore(b, a) ? a : b
      emit([toYmd(startFinal), toYmd(endFinal)])
      setOpen(false)
      setHover(null)
      setPicking("start")
    },
    [emit, maxDate, minDate, picking, startDate]
  )

  const nextMonth = useMemo(() => addMonths(viewYear, viewMonth, 1), [viewMonth, viewYear])

  return (
    <div {...divProps} ref={rootRef} className={cn("relative", className)} data-disabled={disabled ? "" : undefined}>
      {!disabled && nameStart && start ? <input type="hidden" name={nameStart} value={start} /> : null}
      {!disabled && nameEnd && end ? <input type="hidden" name={nameEnd} value={end} /> : null}

      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm text-foreground outline-none",
          "transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-background/15"
        )}
      >
        <span className={cn("truncate text-left", start ? "text-foreground/90" : "text-foreground/50")}>{display}</span>
        <Calendar className="h-4 w-4 text-foreground/70" />
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-labelledby={buttonId}
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-full min-w-[40rem] overflow-hidden rounded-lg border border-(--pw-border) bg-background shadow-[0_10px_30px_var(--pw-shadow)]"
          )}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-(--pw-border) bg-secondary/20 p-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
              <span className="rounded-full border border-(--pw-border) bg-background/10 px-2 py-1">
                Picking: {picking}
              </span>
              {start ? (
                <span className="rounded-full border border-(--pw-border) bg-background/10 px-2 py-1">
                  Start: {start}
                </span>
              ) : null}
              {end ? (
                <span className="rounded-full border border-(--pw-border) bg-background/10 px-2 py-1">
                  End: {end}
                </span>
              ) : null}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="w-40">
                <Select value={String(viewMonth)} onValueChange={(v) => setViewMonth(Number(v))}>
                  <SelectTrigger className="h-9" />
                  <SelectContent>
                    {MONTHS.map((m, idx) => (
                      <SelectOption key={m} value={String(idx)}>
                        {m}
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <NumberInput
                  value={viewYear}
                  onValueChange={(n) => {
                    if (typeof n !== "number" || Number.isNaN(n)) return
                    setViewYear(Math.max(1, Math.floor(n)))
                  }}
                  min={1}
                  step={1}
                  inputClassName="h-9"
                  aria-label="Year"
                />
              </div>

              <Button
                type="button"
                disabled={disabled}
                onClick={() => {
                  emit([null, null])
                  setPicking("start")
                  setHover(null)
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--pw-border) bg-background/10 text-foreground/70",
                  disabled ? "cursor-not-allowed opacity-60" : "hover:bg-background/20"
                )}
                aria-label="Clear"
                title="Clear"
                variant="ghost"
                size="small"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 p-3 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground/80">
                {MONTHS[viewMonth]} {viewYear}
              </div>
              <CalendarMonth
                year={viewYear}
                month={viewMonth}
                range={{ start: startDate, end: endDate }}
                hover={hover}
                min={minDate}
                max={maxDate}
                onPick={pickDay}
                onHoverDay={(d) => {
                  if (picking === "end") setHover(d)
                }}
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-foreground/80">
                {MONTHS[nextMonth.month]} {nextMonth.year}
              </div>
              <CalendarMonth
                year={nextMonth.year}
                month={nextMonth.month}
                range={{ start: startDate, end: endDate }}
                hover={hover}
                min={minDate}
                max={maxDate}
                onPick={pickDay}
                onHoverDay={(d) => {
                  if (picking === "end") setHover(d)
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

