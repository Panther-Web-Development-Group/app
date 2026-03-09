"use client"

import { Content } from "../../globals/Content"

const milestones = [
  {
    year: "2019",
    title: "PantherWeb Founded",
    description:
      "PantherWeb was established at Georgia State University to bring together students interested in web development and create a supportive learning community.",
  },
  {
    year: "2020",
    title: "Going Virtual",
    description:
      "Adapted to remote workshops and meetings, expanding reach to students across campuses and growing our online presence.",
  },
  {
    year: "2021",
    title: "First Major Projects",
    description:
      "Launched our first collaborative projects, with members building web applications and contributing to open source.",
  },
  {
    year: "2022",
    title: "Workshop Series",
    description:
      "Formalized our workshop program, covering React, Vue, and full-stack development with hands-on sessions.",
  },
  {
    year: "2023",
    title: "Community Growth",
    description:
      "Reached 50+ active members and strengthened partnerships with GSU departments and industry professionals.",
  },
  {
    year: "2024",
    title: "Today",
    description:
      "PantherWeb continues to grow, offering workshops, project teams, and a welcoming community for developers at every level.",
  },
]

export default function HistoryPage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <Content className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2">
          <Content.Title as="h1">Our History</Content.Title>
          <Content.Subtitle>
            PantherWeb&apos;s journey at Georgia State University
          </Content.Subtitle>
          <Content.Description className="max-w-2xl">
            From a small group of web enthusiasts to a thriving community of
            developers—here&apos;s how PantherWeb has grown over the years.
          </Content.Description>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute left-6 top-6 bottom-6 w-px bg-foreground/20"
          />
          <div className="flex flex-col gap-0">
            {milestones.map((milestone) => (
              <div
                key={milestone.year}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background text-sm font-semibold text-accent">
                  {milestone.year}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                  <Content.Title as="h3">{milestone.title}</Content.Title>
                  <Content.Description className="max-w-2xl">
                    {milestone.description}
                  </Content.Description>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Content>
    </div>
  )
}
