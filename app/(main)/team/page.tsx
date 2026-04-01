import type { Metadata } from "next"
import type { FC } from "react"

import { Section } from "@/app/globals/Page/Section"
import { TEAM_MEMBERS } from "@/app/globals/teamData"

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the students behind PantherWeb.",
}

const TeamPage: FC = () => {
  return (
    <div className="content-wide">
      <h1 className="page-title">Meet the Team</h1>
      <Section>
        <div className="team-grid">
          {TEAM_MEMBERS.map((member) => (
            <article key={member.name} className="team-card">
              <div className="avatar" aria-hidden>
                {member.initial}
              </div>
              <h2 className="member-name">{member.name}</h2>
              <p className="member-role">{member.role}</p>
              <p className="member-bio">{member.bio}</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}

export default TeamPage
