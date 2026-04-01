import { getHomeEventsSorted } from "@/lib/data/homeEvents"

import { HomepageEventCard } from "./EventCard"

export function HomepageUpcomingEvents() {
  const events = getHomeEventsSorted()

  if (events.length === 0) {
    return (
      <p className="hs-text">No events scheduled yet. Check back soon.</p>
    )
  }

  return (
    <div className="hs-events-list">
      {events.map((event) => (
        <HomepageEventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
