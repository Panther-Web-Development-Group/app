import type { Metadata } from "next"
import type { FC } from "react"

import { Section } from "@/app/globals/Page/Section"

export const metadata: Metadata = {
  title: "About",
  description: "Mission, vision, and what PantherWeb does on campus.",
}

const AboutPage: FC = () => {
  return (
    <div className="content">
      <h1 className="page-title">About PantherWeb</h1>

      <Section>
        <Section.Title>Mission Statement</Section.Title>
        <Section.Content>
          <p>
            PantherWeb is the Web Development Club dedicated to empowering students
            with real-world web skills. We believe in learning by building — from
            front-end to back-end, from design to deployment.
          </p>
        </Section.Content>
      </Section>

      <Section>
        <Section.Title>Vision</Section.Title>
        <Section.Content>
          <p>
            To be the go-to community on campus for anyone who wants to create on
            the web. We aim to bridge the gap between classroom theory and industry
            practice through collaboration and hands-on projects.
          </p>
        </Section.Content>
      </Section>

      <Section>
        <Section.Title>What We Do</Section.Title>
        <Section.Content>
          <ul className="bullet-list">
            <li>
              <span className="bullet-dot" aria-hidden />
              <span>
                <strong>Workshops</strong> — Regular sessions on HTML, CSS,
                JavaScript, React, Next.js, and more.
              </span>
            </li>
            <li>
              <span className="bullet-dot" aria-hidden />
              <span>
                <strong>Hackathons</strong> — Build something in a weekend and
                compete with your peers.
              </span>
            </li>
            <li>
              <span className="bullet-dot" aria-hidden />
              <span>
                <strong>Projects</strong> — Real projects for the club or campus to
                put on your portfolio.
              </span>
            </li>
            <li>
              <span className="bullet-dot" aria-hidden />
              <span>
                <strong>Networking</strong> — Connect with industry guests and
                fellow developers.
              </span>
            </li>
          </ul>
        </Section.Content>
      </Section>
    </div>
  )
}

export default AboutPage
