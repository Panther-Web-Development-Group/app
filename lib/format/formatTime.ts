export type TimeUnits = 
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds"

export type FormatTimeOptions = {
  includeHours?: boolean | "auto" // default: auto
  includeMinutes?: boolean // default: true
  includeSeconds?: boolean // default: true
  includeMilliseconds?: boolean // default: false
  padFirstUnit?: boolean // default: false
  padMilliseconds?: boolean // default: true
}

export const TIME_ORDER = [
  { unit: "hours", factor: 3600 },
  { unit: "minutes", factor: 60 },
  { unit: "seconds", factor: 1 },
  { unit: "milliseconds", factor: 0.001 }
]

export const formatTime = (time: number, options: FormatTimeOptions = {}) => {
  const {
    includeHours = "auto",
    includeMinutes = true,
    includeSeconds = true,
    includeMilliseconds = false,
    padFirstUnit = false,
    padMilliseconds = true
  } = options

  if (isNaN(time) || !isFinite(time)) return "0:00"
  if (time < 0) time = 0

  const parts: string[] = []

  let remainingTime = time
  let isFirstUnit = true

  for (const { unit, factor } of TIME_ORDER) {
    if (unit === "hours") {
      if (!includeHours) continue
      if (includeHours === "auto" && remainingTime < 3600) continue
    }
    if (unit === "minutes" && !includeMinutes) continue
    if (unit === "seconds" && !includeSeconds) continue
    if (unit === "milliseconds" && !includeMilliseconds) continue

    let value = `${Math.floor(remainingTime / factor)}`
    if ((isFirstUnit && padFirstUnit) || !isFirstUnit) value = value.padStart(2, "0")
    if (unit === "milliseconds" && padMilliseconds) value = value.padEnd(3, "0")
    parts.push(value)
    remainingTime %= factor
    isFirstUnit = false
  }

  return parts.join(":")
}