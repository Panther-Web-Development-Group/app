import type { HomeEvent, HomeEventStatus } from "@/lib/data/homeEvents"

const statusLabel = (s: HomeEventStatus): string => {
  switch (s) {
    case "upcoming":
      return "Upcoming"
    case "live":
      return "Live"
    case "ended":
      return "Ended"
    case "cancelled":
      return "Cancelled"
    default:
      return s
  }
}

const statusClass = (s: HomeEventStatus): string => {
  switch (s) {
    case "upcoming":
      return "hs-event-status hs-event-status--upcoming"
    case "live":
      return "hs-event-status hs-event-status--live"
    case "ended":
      return "hs-event-status hs-event-status--ended"
    case "cancelled":
      return "hs-event-status hs-event-status--cancelled"
    default:
      return "hs-event-status"
  }
}

export function formatEventRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }

  if (sameDay) {
    return `${start.toLocaleString(undefined, { ...dateOpts, ...timeOpts })} – ${end.toLocaleTimeString(undefined, timeOpts)}`
  }
  return `${start.toLocaleString(undefined, { ...dateOpts, ...timeOpts })} → ${end.toLocaleString(undefined, { ...dateOpts, ...timeOpts })}`
}

export function HomepageEventCard({ event }: { event: HomeEvent }) {
  return (
    <article className="hs-event">
      <div className="hs-event-image">
        {event.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- optional remote club assets
          <img src={event.imageSrc} alt="" width={280} height={210} />
        ) : (
          <div className="hs-event-image-placeholder" aria-hidden>
            PW
          </div>
        )}
      </div>
      <div className="hs-event-body">
        <span className={statusClass(event.status)}>{statusLabel(event.status)}</span>
        <h3 className="hs-event-name">{event.name}</h3>
        <p className="hs-event-dates">{formatEventRange(event.start, event.end)}</p>
        {event.locations.length > 0 ? (
          <p className="hs-event-dates">{event.locations.join(" · ")}</p>
        ) : null}
        <p className="hs-event-desc">{event.description}</p>
        <div className="hs-event-links">
          {event.rsvpUrl ? (
            <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer">
              RSVP
            </a>
          ) : null}
          {event.virtualUrl ? (
            <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer">
              Virtual link
            </a>
          ) : null}
        </div>
        {event.tags.length > 0 ? (
          <ul className="hs-event-tags" aria-label="Tags">
            {event.tags.map((tag) => (
              <li key={tag} className="hs-event-tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
