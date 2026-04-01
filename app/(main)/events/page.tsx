import type { Metadata } from "next"
import type { FC } from "react"

import { HomepageEventCard } from "@/app/globals/Homepage/UpcomingEvents/EventCard"
import { getHomeEventsSorted } from "@/lib/data/homeEvents"

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, talks, and hack nights hosted by PantherWeb at Georgia State.",
}

const EventsPage: FC = () => {
  const events = getHomeEventsSorted()

  return (
    <div className="content-wide">
      <h1 className="page-title">Events</h1>
      <p className="hs-text">
        RSVP on PIN when links are available, or hop into Discord for virtual
        sessions.
      </p>
      <div className="events-page-list">
        {events.length === 0 ? (
          <p className="hs-text">No events scheduled yet. Check back soon.</p>
        ) : (
          events.map((event) => (
            <HomepageEventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}

export default EventsPage
