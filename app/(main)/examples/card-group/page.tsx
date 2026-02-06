"use client"

import Link from "next/link"
import { CardGroup, Card } from "@/app/components/Card"

// Sample card data for testing
const sampleCards = [
  {
    id: "1",
    title: "Premium Plan",
    body: "Get access to all premium features including advanced analytics, priority support, and unlimited storage.",
    image: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      alt: "Premium features",
    },
    link: {
      href: "/premium",
      label: "Learn more",
    },
  },
  {
    id: "2",
    title: "Basic Plan",
    body: "Perfect for getting started with all the essential features you need to build your project.",
    image: {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      alt: "Basic features",
    },
    link: {
      href: "/basic",
      label: "Get started",
    },
  },
  {
    id: "3",
    title: "Enterprise Plan",
    body: "Custom solutions for large organizations with dedicated support and advanced security features.",
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      alt: "Enterprise features",
    },
    link: {
      href: "/enterprise",
      label: "Contact sales",
    },
  },
  {
    id: "4",
    title: "Free Plan",
    body: "Start for free with basic features. Perfect for trying out our platform.",
    link: {
      href: "/free",
      label: "Sign up free",
    },
  },
  {
    id: "5",
    title: "Student Plan",
    body: "Special pricing for students and educators. Get all premium features at a discounted rate.",
    image: {
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      alt: "Student features",
    },
    link: {
      href: "/student",
      label: "Verify student status",
    },
  },
  {
    id: "6",
    title: "Team Plan",
    body: "Collaborate with your team with shared workspaces and team management tools.",
    link: {
      href: "/team",
    },
  },
]

const cardsWithMultipleImages = [
  {
    id: "multi-1",
    title: "Product Showcase",
    body: "Check out our latest product features and improvements.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
        alt: "Feature 1",
        caption: "Dashboard view",
      },
      {
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
        alt: "Feature 2",
        caption: "Analytics",
      },
    ],
    link: {
      href: "/products",
      label: "View all products",
    },
  },
  {
    id: "multi-2",
    title: "Gallery Example",
    body: "Multiple images displayed in a grid layout within the card.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
        alt: "Image 1",
      },
      {
        src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop",
        alt: "Image 2",
      },
      {
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
        alt: "Image 3",
      },
      {
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
        alt: "Image 4",
      },
    ],
  },
]

export default function CardGroupTestPage() {
  return (
    <div className="space-y-12 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">CardGroup Component Test</h1>
        <p className="text-foreground/75">
          Testing various configurations and use cases for the CardGroup component.
        </p>
        <Link
          href="/examples"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          ← Back to Examples
        </Link>
      </div>

      {/* Example 1: Basic 3-column grid with cards prop */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 1: Basic 3-Column Grid</h2>
          <p className="text-sm text-foreground/70">Using the <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">cards</code> prop with default 3 columns</p>
        </div>
        <CardGroup cards={sampleCards.slice(0, 3)} />
      </section>

      {/* Example 2: 2-column grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 2: 2-Column Grid</h2>
          <p className="text-sm text-foreground/70">Using <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">columns={2}</code></p>
        </div>
        <CardGroup cards={sampleCards.slice(0, 4)} columns={2} />
      </section>

      {/* Example 3: 4-column grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 3: 4-Column Grid</h2>
          <p className="text-sm text-foreground/70">Using <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">columns={4}</code></p>
        </div>
        <CardGroup cards={sampleCards.slice(0, 4)} columns={4} />
      </section>

      {/* Example 4: Single column */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 4: Single Column</h2>
          <p className="text-sm text-foreground/70">Using <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">columns={1}</code></p>
        </div>
        <CardGroup cards={sampleCards.slice(0, 3)} columns={1} />
      </section>

      {/* Example 5: With title and description */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 5: With Title & Description</h2>
          <p className="text-sm text-foreground/70">Including group title and description</p>
        </div>
        <CardGroup
          title="Pricing Plans"
          description="Choose the plan that's right for you. All plans include a 14-day free trial."
          cards={sampleCards.slice(0, 3)}
          columns={3}
        />
      </section>

      {/* Example 6: Different gap sizes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 6: Gap Sizes</h2>
          <p className="text-sm text-foreground/70">Testing different gap sizes: sm, md, lg</p>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Small Gap</h3>
            <CardGroup cards={sampleCards.slice(0, 3)} columns={3} gap="sm" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Medium Gap (default)</h3>
            <CardGroup cards={sampleCards.slice(0, 3)} columns={3} gap="md" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Large Gap</h3>
            <CardGroup cards={sampleCards.slice(0, 3)} columns={3} gap="lg" />
          </div>
        </div>
      </section>

      {/* Example 7: Using children instead of cards prop */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 7: Using Children</h2>
          <p className="text-sm text-foreground/70">Passing Card components as children instead of using the <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">cards</code> prop</p>
        </div>
        <CardGroup columns={3} gap="md">
          <Card
            title="Card as Child 1"
            body="This card is passed as a child component."
            image={{
              src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
              alt: "Child card 1",
            }}
            link={{ href: "/card1", label: "Learn more" }}
          />
          <Card
            title="Card as Child 2"
            body="Another card passed as a child with custom content."
            link={{ href: "/card2" }}
          />
          <Card
            title="Card as Child 3"
            body="You can mix and match cards passed as children."
          >
            <div className="mt-2 text-xs text-foreground/60">
              Custom content can be added here
            </div>
          </Card>
        </CardGroup>
      </section>

      {/* Example 8: Cards with multiple images */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 8: Multiple Images</h2>
          <p className="text-sm text-foreground/70">Cards with multiple images displayed in a grid</p>
        </div>
        <CardGroup cards={cardsWithMultipleImages} columns={2} />
      </section>

      {/* Example 9: Equal height disabled */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 9: Variable Heights</h2>
          <p className="text-sm text-foreground/70">With <code className="px-1.5 py-0.5 rounded bg-background/20 text-xs">equalHeight={false}</code></p>
        </div>
        <CardGroup
          cards={[
            {
              id: "var-1",
              title: "Short Card",
              body: "This is a short card.",
            },
            {
              id: "var-2",
              title: "Medium Card",
              body: "This card has medium content. It's a bit longer than the first one but not too much.",
            },
            {
              id: "var-3",
              title: "Long Card",
              body: "This is a much longer card with significantly more content. It contains multiple sentences and paragraphs to demonstrate how cards with different amounts of content look when equal height is disabled. This allows cards to have their natural height based on their content.",
            },
          ]}
          columns={3}
          equalHeight={false}
        />
      </section>

      {/* Example 10: All 6 cards in responsive grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 10: Full Set (6 Cards)</h2>
          <p className="text-sm text-foreground/70">All sample cards in a responsive 3-column grid</p>
        </div>
        <CardGroup
          title="All Plans"
          description="Browse all available plans and features"
          cards={sampleCards}
          columns={3}
          gap="md"
        />
      </section>

      {/* Example 11: Custom styling */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Example 11: Custom Styling</h2>
          <p className="text-sm text-foreground/70">Using custom className and gridClassName</p>
        </div>
        <CardGroup
          cards={sampleCards.slice(0, 3)}
          columns={3}
          className="rounded-xl border border-(--pw-border) bg-secondary/10 p-6"
          gridClassName="md:grid-cols-2 lg:grid-cols-3"
        />
      </section>
    </div>
  )
}
