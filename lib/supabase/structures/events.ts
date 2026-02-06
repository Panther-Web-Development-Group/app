/**
 * Event recurrence pattern types.
 */
export type EventRecurrencePattern =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom"

/**
 * Event recurrence configuration payload.
 */
export interface EventRecurrencePayload {
  pattern: EventRecurrencePattern
  interval: number
  end_date?: string | null
  count?: number | null
  days_of_week?: number[] | null // [1,3,5] = Mon, Wed, Fri (1 = Monday, 7 = Sunday)
  day_of_month?: number | null // 1-31
  week_of_month?: number | null // 1-4 (1st, 2nd, 3rd, 4th week)
  month_of_year?: number[] | null // [1,6] = Jan, Jun (1-12)
}

/**
 * Event location types.
 */
export type EventLocationType = "physical" | "virtual" | "hybrid"

/**
 * Physical location payload.
 */
export interface PhysicalLocationPayload {
  type: "physical"
  name: string
  address: string
  url?: string | null // Google Maps or other map link
  latitude?: number | null // Decimal degrees (e.g., 40.7128)
  longitude?: number | null // Decimal degrees (e.g., -74.0060)
}

/**
 * Virtual location payload.
 */
export interface VirtualLocationPayload {
  type: "virtual"
  platform: string // "zoom", "teams", "google_meet", "webex", etc.
  url: string
  meeting_id?: string | null
  password?: string | null
  dial_in?: string | null
}

/**
 * Hybrid location payload (both physical and virtual).
 */
export interface HybridLocationPayload {
  type: "hybrid"
  physical: PhysicalLocationPayload
  virtual: VirtualLocationPayload
}

export type EventLocationPayloads = {
  "physical": PhysicalLocationPayload
  "virtual": VirtualLocationPayload
  "hybrid": HybridLocationPayload
}

export interface EventLocationObject<T extends keyof EventLocationPayloads> {
  type: T
  payload: EventLocationPayloads[T]
}
