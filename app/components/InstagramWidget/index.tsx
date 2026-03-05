"use client"

import { FC } from "react"
import { Section } from "@/app/(main)/globals/Section"
import { cn } from "@/lib/cn"
import { FaInstagram } from "react-icons/fa"

export interface InstagramWidgetProps {
  /** Instagram post URLs to display */
  posts?: string[]
  /** Instagram profile ID for "Follow us" link */
  profileID?: string
  /** Width of each embed (default: 328) */
  width?: number
  /** Additional class names */
  className?: string
}

const DEFAULT_POSTS = [
  "https://www.instagram.com/p/CUbHfhpswxt/",
]

/** Extract post ID from Instagram URL for embed */
function getEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/p\/([^/?]+)/)
  return match ? `https://www.instagram.com/p/${match[1]}/embed/` : url
}

const InstagramWidget: FC<InstagramWidgetProps> = ({
  posts = DEFAULT_POSTS,
  profileID,
  width = 328,
  className,
}) => {
  return (
    <Section
      type="full"
      className={cn(
        "min-w-0 max-w-full overflow-hidden pt-0 lg:w-96 lg:max-w-md lg:shrink-0",
        className
      )}
    >
      <Section.Title icon={<FaInstagram aria-hidden />} className="py-3">
        Follow us
      </Section.Title>
      <Section.Content type="full">
        <div className="flex min-w-0 flex-col items-center gap-6 overflow-hidden">
          {posts.slice(0, 3).map((url) => (
            <div key={url} className="flex min-w-0 max-w-full justify-center overflow-hidden">
              <iframe
                src={getEmbedUrl(url)}
                title="Instagram post"
                className="overflow-hidden rounded-lg border-0"
                width={width}
                height={480}
                loading="lazy"
              />
            </div>
          ))}
          {profileID && (
            <a
              href={`https://www.instagram.com/${profileID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
            >
              <FaInstagram className="size-[1em]" />
              Follow us on Instagram
            </a>
          )}
        </div>
      </Section.Content>
    </Section>
  )
}

export default InstagramWidget
