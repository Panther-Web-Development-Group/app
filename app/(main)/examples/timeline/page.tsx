"use client"

import Link from "next/link"
import { Timeline, TimelineItem } from "@/app/components/Timeline"
import { CheckCircle, AlertCircle, Info, Calendar, Rocket, Award, Code, Users } from "lucide-react"

// Sample timeline data
const sampleTimelineItems: TimelineItem[] = [
  {
    id: "1",
    date: "2024-01-15",
    title: "Project Launch",
    description: "Successfully launched the new platform with all core features.",
    variant: "success",
    icon: <Rocket className="h-5 w-5" />,
    link: {
      href: "/launch",
      label: "View details",
    },
  },
  {
    id: "2",
    date: "2024-02-20",
    title: "Major Update Released",
    description: "Released version 2.0 with improved performance and new features.",
    variant: "info",
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: "3",
    date: "2024-03-10",
    title: "Team Expansion",
    description: "Welcomed 5 new team members to help scale our operations.",
    variant: "default",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "4",
    date: "2024-04-05",
    title: "Award Received",
    description: "Won the Best Innovation Award at the annual tech conference.",
    variant: "success",
    icon: <Award className="h-5 w-5" />,
    image: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
      alt: "Award ceremony",
    },
  },
  {
    id: "5",
    date: "2024-05-12",
    title: "Security Update",
    description: "Important security patches applied to address vulnerabilities.",
    variant: "warning",
    icon: <AlertCircle className="h-5 w-5" />,
  },
  {
    id: "6",
    date: "2024-06-01",
    title: "Milestone Achieved",
    description: "Reached 100,000 active users on our platform.",
    variant: "success",
    icon: <CheckCircle className="h-5 w-5" />,
  },
]

const eventTimelineItems: TimelineItem[] = [
  {
    id: "event-1",
    date: "2024-01-10",
    title: "Q1 Planning Meeting",
    description: "Quarterly planning session with all department heads.",
    variant: "info",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "event-2",
    date: "2024-02-14",
    title: "Product Demo Day",
    description: "Showcased new features to stakeholders and investors.",
    variant: "default",
  },
  {
    id: "event-3",
    date: "2024-03-22",
    title: "User Conference",
    description: "Annual user conference with 500+ attendees.",
    variant: "success",
    icon: <Users className="h-5 w-5" />,
  },
]

const simpleTimelineItems: TimelineItem[] = [
  {
    id: "simple-1",
    date: "2024-01-01",
    title: "New Year",
    description: "Started the year with new goals and initiatives.",
  },
  {
    id: "simple-2",
    date: "2024-02-01",
    title: "Team Meeting",
    description: "Monthly team sync to discuss progress and blockers.",
  },
  {
    id: "simple-3",
    date: "2024-03-01",
    title: "Feature Release",
    description: "Shipped the most requested feature by our users.",
  },
]

export default function TimelineTestPage() {
  return (
    <div className="space-y-12 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Timeline Component Test</h1>
        <p className="text-foreground/75">
          Testing various configurations and use cases for the Timeline component.
        </p>
        <Link
          href="/examples"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          ← Back to Examples
        </Link>
      </div>

      {/* Example 1: Basic Vertical Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 1: Basic Vertical Timeline</h2>
          <p className="text-sm text-foreground/70">Default vertical timeline with connecting line</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline items={simpleTimelineItems} />
        </div>
      </section>

      {/* Example 2: Timeline with Icons and Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 2: With Icons & Variants</h2>
          <p className="text-sm text-foreground/70">Timeline items with custom icons and color variants</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline items={sampleTimelineItems} />
        </div>
      </section>

      {/* Example 3: Timeline without Dates */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 3: Without Dates</h2>
          <p className="text-sm text-foreground/70">Timeline with <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">showDates={"{false}"}</code></p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline items={sampleTimelineItems.slice(0, 4)} showDates={false} />
        </div>
      </section>

      {/* Example 4: Timeline without Line */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 4: Without Connecting Line</h2>
          <p className="text-sm text-foreground/70">Timeline with <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">showLine={"{false}"}</code></p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline items={eventTimelineItems} showLine={false} />
        </div>
      </section>

      {/* Example 5: Horizontal Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 5: Horizontal Timeline</h2>
          <p className="text-sm text-foreground/70">Timeline with <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">orientation="horizontal"</code></p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline items={sampleTimelineItems.slice(0, 5)} orientation="horizontal" />
        </div>
      </section>

      {/* Example 6: Timeline with Images */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 6: With Images</h2>
          <p className="text-sm text-foreground/70">Timeline items with images instead of icons</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline
            items={[
              {
                id: "img-1",
                date: "2024-01-15",
                title: "Team Photo",
                description: "Annual team photo session.",
                image: {
                  src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
                  alt: "Team photo",
                },
              },
              {
                id: "img-2",
                date: "2024-02-20",
                title: "Office Opening",
                description: "Grand opening of our new headquarters.",
                image: {
                  src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
                  alt: "Office",
                },
              },
              {
                id: "img-3",
                date: "2024-03-10",
                title: "Product Launch",
                description: "Launch event with media coverage.",
                image: {
                  src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
                  alt: "Launch event",
                },
              },
            ]}
          />
        </div>
      </section>

      {/* Example 7: Timeline with Custom Content */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 7: With Custom Content</h2>
          <p className="text-sm text-foreground/70">Timeline items with custom React content</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline
            items={[
              {
                id: "custom-1",
                date: "2024-01-15",
                title: "Custom Content Item",
                description: "This item includes custom React content below the description.",
                variant: "info",
                icon: <Info className="h-5 w-5" />,
                content: (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Feature
                      </span>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Released
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-foreground/70">
                      <li>Improved performance by 40%</li>
                      <li>Added 5 new features</li>
                      <li>Fixed 12 bugs</li>
                    </ul>
                  </div>
                ),
              },
              {
                id: "custom-2",
                date: "2024-02-20",
                title: "Another Custom Item",
                description: "More custom content examples.",
                variant: "success",
                icon: <CheckCircle className="h-5 w-5" />,
                content: (
                  <div className="mt-3 rounded-lg border border-(--pw-border) bg-background/50 p-3">
                    <p className="text-xs text-foreground/80">
                      This is a custom content block with additional information that can include any React components.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Example 8: Timeline with All Variants */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 8: All Color Variants</h2>
          <p className="text-sm text-foreground/70">Demonstrating all available color variants</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline
            items={[
              {
                id: "variant-default",
                date: "2024-01-01",
                title: "Default Variant",
                description: "Standard timeline item with default styling.",
                variant: "default",
              },
              {
                id: "variant-success",
                date: "2024-01-02",
                title: "Success Variant",
                description: "Use for successful milestones and achievements.",
                variant: "success",
                icon: <CheckCircle className="h-5 w-5" />,
              },
              {
                id: "variant-warning",
                date: "2024-01-03",
                title: "Warning Variant",
                description: "Use for important notices or warnings.",
                variant: "warning",
                icon: <AlertCircle className="h-5 w-5" />,
              },
              {
                id: "variant-error",
                date: "2024-01-04",
                title: "Error Variant",
                description: "Use for errors or critical issues.",
                variant: "error",
                icon: <AlertCircle className="h-5 w-5" />,
              },
              {
                id: "variant-info",
                date: "2024-01-05",
                title: "Info Variant",
                description: "Use for informational updates.",
                variant: "info",
                icon: <Info className="h-5 w-5" />,
              },
            ]}
          />
        </div>
      </section>

      {/* Example 9: Compact Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 9: Compact Timeline</h2>
          <p className="text-sm text-foreground/70">Timeline with minimal spacing</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline
            items={sampleTimelineItems.slice(0, 4)}
            itemClassName="gap-3"
            className="space-y-4"
          />
        </div>
      </section>

      {/* Example 10: Long Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 10: Extended Timeline</h2>
          <p className="text-sm text-foreground/70">Timeline with many items to test scrolling and performance</p>
        </div>
        <div className="rounded-xl border border-(--pw-border) bg-secondary/20 p-6">
          <Timeline
            items={[
              ...sampleTimelineItems,
              ...eventTimelineItems,
              {
                id: "extended-1",
                date: "2024-07-01",
                title: "Summer Update",
                description: "Major summer release with new features.",
                variant: "info",
              },
              {
                id: "extended-2",
                date: "2024-08-15",
                title: "Partnership Announcement",
                description: "Announced strategic partnership with leading tech company.",
                variant: "success",
                icon: <Users className="h-5 w-5" />,
              },
              {
                id: "extended-3",
                date: "2024-09-20",
                title: "User Milestone",
                description: "Reached 250,000 active users.",
                variant: "success",
                icon: <Award className="h-5 w-5" />,
              },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
