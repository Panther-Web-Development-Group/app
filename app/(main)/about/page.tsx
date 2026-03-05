"use client"

import { Content } from "../globals/Content"
import { Section } from "../globals/Section"
import { Card } from "@/app/components/Card"
import { CardGroup } from "@/app/components/CardGroup"
import { Statistics } from "@/app/components/Statistics"

export default function AboutPage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <Content>
        <Section type="full">
          <Section.Title as="h1">About PantherWeb</Section.Title>
          <Section.Content type="full">
            <p className="text-center text-foreground/90">
              Georgia State University&apos;s web development community
            </p>
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              The Panther Web Development Group, also known as PantherWeb, is a
              student organization that encourages Georgia State University
              students to learn more about web development, regardless of major
              and background.
            </p>
          </Section.Content>
        </Section>

        <div className="flex flex-col gap-12">
            <Section type="full">
              <Section.Title>Mission</Section.Title>
              <Section.Content type="full">
                <p className="max-w-3xl text-muted-foreground">
                  PantherWeb aims to assist students, regardless of major,
                  background, or skill set, in understanding and applying web
                  development concepts through student-led projects, such as web
                  and mobile applications. PantherWeb teaches a myriad of
                  languages and frameworks including HTML, CSS, JavaScript,
                  React, Angular, and Vue. We support all students in building
                  their networks, creating new projects, and expanding their
                  portfolios and resumes.
                </p>
              </Section.Content>
            </Section>

            <Section type="full">
              <Section.Title>By the Numbers</Section.Title>
              <Section.Content type="full">
                <Statistics>
                  <Statistics.Item value="50+" label="Active Members" />
                  <Statistics.Item value="5+" label="Years Strong" />
                  <Statistics.Item value="20+" label="Projects Built" />
                  <Statistics.Item value="100+" label="Workshops Held" />
                </Statistics>
              </Section.Content>
            </Section>

            <Section type="full">
              <Section.Title>Explore</Section.Title>
              <Section.Content type="full">
                <CardGroup variant="grid" className="w-full">
                  <Card variant="default" className="flex flex-col">
                    <div className="flex flex-1 flex-col gap-3">
                      <Card.Title>Executive Board</Card.Title>
                      <Card.Content>
                        <p>
                          Meet the students who lead PantherWeb and drive our
                          mission forward.
                        </p>
                      </Card.Content>
                      <Card.CTA href="/exec" className="mt-auto w-fit">
                        View exec board
                      </Card.CTA>
                    </div>
                  </Card>
                  <Card variant="default" className="flex flex-col">
                    <div className="flex flex-1 flex-col gap-3">
                      <Card.Title>Team</Card.Title>
                      <Card.Content>
                        <p>
                          Get to know the full PantherWeb team and our community
                          of developers.
                        </p>
                      </Card.Content>
                      <Card.CTA href="/about/team" className="mt-auto w-fit">
                        Meet the team
                      </Card.CTA>
                    </div>
                  </Card>
                  <Card variant="default" className="flex flex-col">
                    <div className="flex flex-1 flex-col gap-3">
                      <Card.Title>History</Card.Title>
                      <Card.Content>
                        <p>
                          Learn about PantherWeb&apos;s journey and milestones
                          over the years.
                        </p>
                      </Card.Content>
                      <Card.CTA href="/about/history" className="mt-auto w-fit">
                        Our history
                      </Card.CTA>
                    </div>
                  </Card>
                </CardGroup>
              </Section.Content>
            </Section>
        </div>
      </Content>
    </div>
  )
}
