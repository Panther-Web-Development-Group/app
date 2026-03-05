"use client"
import dynamic from "next/dynamic"
import { Hero } from "./globals/Hero"
import { Section } from "./globals/Section"
import { Content } from "./globals/Content"
import { Card } from "@/app/components/Card"
import { CardGroup } from "@/app/components/CardGroup"
import { Ticker } from "@/app/components/Ticker"
import { Statistics } from "@/app/components/Statistics"

const InstagramWidget = dynamic(
  () => import("@/app/components/InstagramWidget"),
  { ssr: false }
)

const DiscordWidget = dynamic(
  () => import("@/app/components/DiscordWidget"),
  { ssr: false }
)

export default function Home() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <Hero type="screen" autoPlay={5000}>
        <Hero.Container>
          <Hero.Slide>
            <Hero.Slide.Image
              src="/logos/PantherWeb-1.png"
              alt="PantherWeb - Georgia State University"
            />
            <Hero.Slide.Content>
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Welcome to PantherWeb
              </h2>
              <p className="mt-2 text-lg opacity-90">
                Georgia State University&apos;s digital experience
              </p>
            </Hero.Slide.Content>
          </Hero.Slide>
          <Hero.Slide>
            <Hero.Slide.Image
              src="/logos/PantherWeb-2.png"
              alt="PantherWeb branding"
            />
            <Hero.Slide.Content>
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Discover. Learn. Achieve.
              </h2>
              <p className="mt-2 text-lg opacity-90">
                Your journey starts here
              </p>
            </Hero.Slide.Content>
          </Hero.Slide>
          <Hero.Slide>
            <Hero.Slide.Image
              src="/logos/PantherWeb-3.png"
              alt="PantherWeb"
            />
            <Hero.Slide.Content>
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Excellence in Education
              </h2>
              <p className="mt-2 text-lg opacity-90">
                Join our community of scholars
              </p>
            </Hero.Slide.Content>
          </Hero.Slide>
        </Hero.Container>
        <Hero.Bar />
      </Hero>

      <Ticker speed={30} className="border-y border-foreground/10">
        <Ticker.Item><p>Welcome to PantherWeb</p></Ticker.Item>
        <Ticker.Item><p>Web Development at GSU</p></Ticker.Item>
        <Ticker.Item><p>Learn • Build • Connect</p></Ticker.Item>
        <Ticker.Item><p>Join our community</p></Ticker.Item>
      </Ticker>

      <Content className="py-4">
        <Section type="full" className="px-4 sm:px-6 lg:px-8">
          <Section.Title>
            Welcome to PantherWeb
          </Section.Title>
          <Section.Content type="full">
            <p>
              The Panther Web Development Group, also known as PantherWeb, is a student organization that encourages Georgia State University students to learn more about web development, regardless of major and background.
            </p>
          </Section.Content>
        </Section>
      </Content>
      <Content variant="withSidebar" className="py-4">
        <div className="flex min-w-0 flex-col gap-8">
          <Section type="full">
            <Section.Title>Mission</Section.Title>
            <Section.Content type="full">
              <p>
                PantherWeb aims to assist students, regardless of major, background, or skill set, in understanding and applying web development concepts through student-led projects, such as web and mobile applications. PantherWeb teaches a myriad of languages and frameworks including HTML, CSS, JavaScript, React, Angular, and Vue. We support all students in building their networks, creating new projects, and expanding their portfolios and resumes.
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
            <Section.Title>Get Involved</Section.Title>
            <Section.Content type="full">
              <CardGroup variant="grid" className="w-full">
              <Card variant="full" className="flex flex-col">
                <Card.Image
                  src="/logos/PantherWeb-1.png"
                  alt="Learn"
                  position="top"
                  width={400}
                  height={240}
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <Card.Title>Learn</Card.Title>
                  <Card.Content>
                    <p>Develop your skills in web technologies with hands-on projects and workshops.</p>
                  </Card.Content>
                  <Card.CTA href="/about" className="mt-auto w-fit">
                    Learn more
                  </Card.CTA>
                </div>
              </Card>
              <Card variant="full" className="flex flex-col">
                <Card.Image
                  src="/logos/PantherWeb-2.png"
                  alt="Connect"
                  position="top"
                  width={400}
                  height={240}
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <Card.Title>Connect</Card.Title>
                  <Card.Content>
                    <p>Join a community of developers and grow your network at Georgia State.</p>
                  </Card.Content>
                  <Card.CTA href="/contact" className="mt-auto w-fit">
                    Get in touch
                  </Card.CTA>
                </div>
              </Card>
              <Card variant="full" className="flex flex-col">
                <Card.Image
                  src="/logos/PantherWeb-3.png"
                  alt="Build"
                  position="top"
                  width={400}
                  height={240}
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <Card.Title>Build</Card.Title>
                  <Card.Content>
                    <p>Work on real projects and build your portfolio alongside fellow students.</p>
                  </Card.Content>
                  <Card.CTA href="/about/team" className="mt-auto w-fit">
                    Meet the team
                  </Card.CTA>
                </div>
              </Card>
              </CardGroup>
            </Section.Content>
          </Section>
        </div>
        <aside className="flex min-w-0 flex-col gap-12">
          <DiscordWidget
            serverId="1063654619428962334"
            serverName="PantherWeb"
            inviteUrl="https://discord.gg/PAcfCYJrgk"
            className="w-full shrink-0"
          />
          <InstagramWidget
            profileID="pantherweb.gsu"
            className="w-full shrink-0"
            posts={[
              "https://www.instagram.com/p/DFzHOVNxk7w/",
            ]}
          />
        </aside>
      </Content>
    </div>
  )
}