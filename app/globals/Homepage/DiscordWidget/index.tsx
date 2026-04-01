import Link from "next/link"

import { DISCORD_GUILD_ID } from "@/app/globals/config/discord"
import { SOCIAL_LINKS } from "@/app/globals/config/social"

type WidgetPayload = {
  name?: string
  presence_count?: number
  instant_invite?: string | null
}

async function fetchWidget(
  guildId: string,
): Promise<WidgetPayload | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${guildId}/widget.json`,
      { next: { revalidate: 120 } },
    )
    if (!res.ok) return null
    return (await res.json()) as WidgetPayload
  } catch {
    return null
  }
}

export async function HomepageDiscordWidget() {
  const fallbackHref = SOCIAL_LINKS.discord

  if (!DISCORD_GUILD_ID) {
    return (
      <div className="hs-discord-widget">
        <h3 className="hs-discord-widget-title">Discord</h3>
        <p className="hs-discord-widget-fallback">
          Set{" "}
          <code className="hs-discord-widget-code">
            NEXT_PUBLIC_DISCORD_GUILD_ID
          </code>{" "}
          to show live member counts from the widget API, or{" "}
          <Link href={fallbackHref} className="hs-discord-widget-link">
            join our server
          </Link>
          .
        </p>
      </div>
    )
  }

  const data = await fetchWidget(DISCORD_GUILD_ID)
  if (!data) {
    return (
      <div className="hs-discord-widget">
        <h3 className="hs-discord-widget-title">Discord</h3>
        <p className="hs-discord-widget-fallback">
          Widget unavailable (enable the server widget in Discord or check the
          guild ID).{" "}
          <Link href={fallbackHref} className="hs-discord-widget-link">
            Open invite link
          </Link>
          .
        </p>
      </div>
    )
  }

  const invite = data.instant_invite ?? fallbackHref
  const online =
    typeof data.presence_count === "number" ? data.presence_count : null
  const name = data.name ?? "Discord"

  return (
    <div className="hs-discord-widget">
      <h3 className="hs-discord-widget-title">{name}</h3>
      {online !== null ? (
        <p className="hs-discord-widget-meta">{online} online</p>
      ) : (
        <p className="hs-discord-widget-meta">Community chat</p>
      )}
      <Link href={invite} className="btn-section" target="_blank" rel="noopener noreferrer">
        Join Discord &rarr;
      </Link>
    </div>
  )
}

