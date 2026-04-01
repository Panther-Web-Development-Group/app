export type HomeEventStatus = "upcoming" | "live" | "ended" | "cancelled"

export type HomeEvent = {
  readonly id: string
  readonly name: string
  /** ISO 8601 */
  readonly start: string
  readonly end: string
  readonly locations: readonly string[]
  readonly rsvpUrl?: string
  readonly virtualUrl?: string
  readonly description: string
  readonly status: HomeEventStatus
  readonly tags: readonly string[]
  /** Optional image URL (same-origin or configured remote). */
  readonly imageSrc?: string
}

export const HOME_EVENTS: readonly HomeEvent[] = [
  {
    id: "spring-build-night",
    name: "Spring Build Night",
    start: "2026-04-12T18:00:00-04:00",
    end: "2026-04-12T21:00:00-04:00",
    locations: ["GSU Library Collaborative Space"],
    rsvpUrl: "https://pin.gsu.edu/",
    description:
      "Open laptops night: bring a project or pair on club challenges with mentors on hand.",
    status: "upcoming",
    tags: ["workshop", "open lab", "on campus"],
  },
  {
    id: "web-accessibility-talk",
    name: "Web Accessibility Lightning Talks",
    start: "2026-03-28T17:30:00-04:00",
    end: "2026-03-28T19:00:00-04:00",
    locations: ["Online"],
    virtualUrl: "https://discord.gg/",
    description:
      "Short talks on semantic HTML, keyboard navigation, and testing with screen readers.",
    status: "ended",
    tags: ["a11y", "talk"],
  },
  {
    id: "summer-hack-kickoff",
    name: "Summer Hack Kickoff",
    start: "2026-05-01T16:00:00-04:00",
    end: "2026-05-01T17:00:00-04:00",
    locations: ["Student Center East"],
    rsvpUrl: "https://pin.gsu.edu/",
    description:
      "Teams, tracks, and judging criteria for our summer build sprint — newcomers welcome.",
    status: "upcoming",
    tags: ["hackathon", "kickoff"],
  },
] as const

export function getHomeEventsSorted(): HomeEvent[] {
  return [...HOME_EVENTS].sort(
    (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
  )
}
