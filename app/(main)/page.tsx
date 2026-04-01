import type { Metadata } from "next"

import { HomepageConnectSocialGrid } from "@/app/globals/Homepage/ConnectSocialGrid"
import { HomepageDiscordWidget } from "@/app/globals/Homepage/DiscordWidget"
import { HomepageHero } from "@/app/globals/Homepage/Hero"
import { HomepageSection } from "@/app/globals/Homepage/Section"
import { HomepageUpcomingEvents } from "@/app/globals/Homepage/UpcomingEvents"

export const metadata: Metadata = {
  title: "Home",
  description:
    "PantherWeb builds cool stuff on the web. Join Georgia State's web development club.",
}

export default async function HomePage() {
  return (
    <>
      <HomepageHero />
      <div className="home-sections">
        <HomepageSection
          title="About Us"
          cta={{ href: "/about", label: "Learn More →" }}
        >
          <p className="hs-text">
            PantherWeb is the on-campus web development club dedicated to
            empowering students with real-world skills — from HTML and CSS all
            the way to full-stack deployment.
          </p>
        </HomepageSection>
        <HomepageSection
          title="The Team"
          cta={{ href: "/team", label: "Meet the Team →" }}
        >
          <p className="hs-text">
            Meet the students behind the club. Our officers lead workshops, run
            hackathons, and keep PantherWeb growing every semester.
          </p>
        </HomepageSection>
        <HomepageSection
          title="Upcoming Events"
          cta={{ href: "/events", label: "View All Events →" }}
        >
          <HomepageUpcomingEvents />
        </HomepageSection>
        <HomepageSection
          title="Join Us"
          cta={{ href: "/join", label: "Apply Now →" }}
        >
          <p className="hs-text">
            Ready to build? Submit your application and become part of a
            community of developers passionate about the web.
          </p>
        </HomepageSection>
        <HomepageSection
          title="Connect With Us"
          cta={{ href: "/contact", label: "Contact Us →" }}
        >
          <p className="hs-text">
            Stay in touch on social, email, and Panther Involvement Network.
          </p>
          <HomepageConnectSocialGrid />
          <HomepageDiscordWidget />
        </HomepageSection>
      </div>
    </>
  )
}
