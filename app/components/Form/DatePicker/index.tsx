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
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
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

/** Format date for trigger display (e.g. "January 20, 2026") */
function formatDisplayDate(ymd: string): string {
  const d = parseYmd(ymd)
  if (!d) return ymd
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function inBounds(d: Date, min?: Date | null, max?: Date | null) {
  if (min && isBefore(d, min)) return false
  if (max && isAfter(d, max)) return false
  return true
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
  inRange,
  isRangeEdge,
  isToday,
  isOutside,
  onClick,
  onHover,
}: {
  day: Date
  disabled: boolean
  selected: boolean
  inRange: boolean
  isRangeEdge: boolean
  isToday: boolean
  isOutside: boolean
  onClick: () => void
  onHover?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
        disabled ? "cursor-not-allowed text-foreground/35" : "text-foreground/85 hover:bg-background/15",
        isOutside && !selected && "text-foreground/45",
        isToday && !selected && "bg-accent/20 text-accent-foreground font-semibold",
        inRange ? "bg-accent/15" : "",
        selected && "bg-accent text-accent-foreground font-semibold",
        isRangeEdge ? "ring-1 ring-(--pw-border)" : ""
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
  range,
  hover,
  min,
  max,
  onPick,
  onHoverDay,
  showOutsideDays = true,
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
  showOutsideDays?: boolean
}) {
  const first = startOfMonth(year, month)
  const leading = first.getDay()
  const count = daysInMonth(year, month)

  const days: Array<Date | null> = []
  if (showOutsideDays) {
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevCount = daysInMonth(prevYear, prevMonth)
    for (let i = leading - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonth, prevCount - i))
    }
  } else {
    for (let i = 0; i < leading; i++) days.push(null)
  }
  for (let d = 1; d <= count; d++) days.push(new Date(year, month, d))
  if (showOutsideDays) {
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push(new Date(year, month + 1, d))
    }
  } else {
    while (days.length % 7 !== 0) days.push(null)
  }

  const rangeStart = range?.start ?? null
  const rangeEnd = range?.end ?? null
  const previewEnd = rangeEnd ?? hover
  const today = useMemo(() => new Date(), [])

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
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-foreground/60">
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
          const isOutsideDay = d.getMonth() !== month
          const isTodayDay = isSameDay(d, today)

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
              isToday={isTodayDay}
              isOutside={isOutsideDay}
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

  const display = value ? formatDisplayDate(value) : placeholder

  const canGoPrev = useMemo(() => {
    if (!minDate) return true
    const viewStart = startOfMonth(viewYear, viewMonth)
    return isAfter(viewStart, minDate) || viewStart.getTime() === minDate.getTime()
  }, [minDate, viewMonth, viewYear])

  const canGoNext = useMemo(() => {
    if (!maxDate) return true
    const viewEnd = new Date(viewYear, viewMonth + 1, 0)
    return isBefore(viewEnd, maxDate) || viewEnd.getTime() === maxDate.getTime()
  }, [maxDate, viewMonth, viewYear])

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

  return (
    <div {...divProps} ref={rootRef} className={cn("relative", className)} data-disabled={disabled ? "" : undefined}>
      {!disabled && name && value ? <input type="hidden" name={name} value={value} /> : null}

      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        data-empty={!value}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-normal outline-none",
          "transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
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
            <Button
              type="button"
              disabled={!canGoPrev}
              onClick={goPrev}
              className={navButtonClass}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-1 items-center justify-center text-sm font-medium text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <Button
              type="button"
              disabled={!canGoNext}
              onClick={goNext}
              className={navButtonClass}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              disabled={disabled}
              onClick={() => {
                const todayYmd = toYmd(today)
                if (!inBounds(today, minDate, maxDate)) return
                emit(todayYmd)
                setViewYear(today.getFullYear())
                setViewMonth(today.getMonth())
                setOpen(false)
              }}
              className={todayButtonClass}
              aria-label="Today"
            >
              Today
            </Button>
            <Button
              type="button"
              disabled={disabled}
              onClick={() => {
                emit(null)
                setOpen(false)
              }}
              className={clearButtonClass}
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

  const display =
    start && end
      ? `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`
      : start
        ? `${formatDisplayDate(start)} – …`
        : placeholder

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

  const rangeCanGoPrev = useMemo(() => {
    if (!minDate) return true
    const viewStart = startOfMonth(viewYear, viewMonth)
    return viewStart.getTime() > minDate.getTime()
  }, [minDate, viewMonth, viewYear])

  const rangeCanGoNext = useMemo(() => {
    if (!maxDate) return true
    const next = addMonths(viewYear, viewMonth, 1)
    const nextMonthEnd = new Date(next.year, next.month + 1, 0)
    return nextMonthEnd.getTime() < maxDate.getTime()
  }, [maxDate, viewMonth, viewYear])

  const rangeGoPrev = useCallback(() => {
    const prev = addMonths(viewYear, viewMonth, -1)
    setViewYear(prev.year)
    setViewMonth(prev.month)
  }, [viewMonth, viewYear])

  const rangeGoNext = useCallback(() => {
    const next = addMonths(viewYear, viewMonth, 1)
    setViewYear(next.year)
    setViewMonth(next.month)
  }, [viewMonth, viewYear])

  return (
    <div {...divProps} ref={rootRef} className={cn("relative", className)} data-disabled={disabled ? "" : undefined}>
      {!disabled && nameStart && start ? <input type="hidden" name={nameStart} value={start} /> : null}
      {!disabled && nameEnd && end ? <input type="hidden" name={nameEnd} value={end} /> : null}

      <Button
        id={buttonId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        data-empty={!start}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-(--pw-border) bg-background/10 px-3 text-sm font-normal outline-none",
          "transition-colors",
          "focus-visible:ring-2 focus-visible:ring-(--pw-ring)",
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
          className="absolute left-0 top-full z-50 mt-2 w-auto min-w-[36rem] rounded-lg border border-(--pw-border) bg-background p-0 shadow-[0_10px_30px_var(--pw-shadow)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--pw-border) p-2">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
              <span className="rounded-md border border-(--pw-border) bg-background/10 px-2 py-1">
                {picking === "start" ? "Start date" : "End date"}
              </span>
              {start ? (
                <span className="rounded-md border border-(--pw-border) bg-background/10 px-2 py-1">
                  {formatDisplayDate(start)}
                </span>
              ) : null}
              {end ? (
                <span className="rounded-md border border-(--pw-border) bg-background/10 px-2 py-1">
                  {formatDisplayDate(end)}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!rangeCanGoPrev}
                onClick={rangeGoPrev}
                className={navButtonClass}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!rangeCanGoNext}
                onClick={rangeGoNext}
                className={navButtonClass}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={disabled || !inBounds(today, minDate, maxDate)}
                onClick={() => {
                  const todayYmd = toYmd(today)
                  if (!inBounds(today, minDate, maxDate)) return
                  emit([todayYmd, todayYmd])
                  setViewYear(today.getFullYear())
                  setViewMonth(today.getMonth())
                  setPicking("start")
                  setHover(null)
                  setOpen(false)
                }}
                className={todayButtonClass}
                aria-label="Today"
              >
                Today
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  emit([null, null])
                  setPicking("start")
                  setHover(null)
                }}
                className={clearButtonClass}
                aria-label="Clear"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
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

