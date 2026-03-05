"use client"

import { FC, useEffect, useState } from "react"
import { Section } from "@/app/(main)/globals/Section"
import { cn } from "@/lib/cn"
import { FaDiscord } from "react-icons/fa"
import { Users } from "lucide-react"

export interface DiscordWidgetProps {
  /** Discord server ID (enables widget API fetch). Get from Server Settings > Widget. */
  serverId?: string
  /** Fallback invite URL when widget is disabled or for direct links (e.g. discord.gg/xxx) */
  inviteUrl?: string
  /** Display name when widget API is unavailable */
  serverName?: string
  /** Additional class names */
  className?: string
}

interface DiscordWidgetData {
  id: string
  name: string
  instant_invite: string | null
  presence_count: number
  members?: Array<{
    username: string
    avatar_url?: string
    status: string
  }>
}

async function fetchWidget(serverId: string): Promise<DiscordWidgetData | null> {
  try {
    const res = await fetch(`/api/discord-widget/${serverId}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const DiscordWidget: FC<DiscordWidgetProps> = ({
  serverId,
  inviteUrl,
  serverName = "Our Discord",
  className,
}) => {
  const [data, setData] = useState<DiscordWidgetData | null>(null)
  const [loading, setLoading] = useState(!!serverId)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!serverId) {
      setLoading(false)
      return
    }
    fetchWidget(serverId)
      .then((widget) => {
        setData(widget)
        setError(!widget)
      })
      .finally(() => setLoading(false))
  }, [serverId])

  const link = data?.instant_invite ?? inviteUrl
  const name = data?.name ?? serverName
  const onlineCount = data?.presence_count ?? 0
  const members = data?.members ?? []
  const hasWidgetData = !!data

  return (
    <Section
      type="full"
      className={cn(
        "min-w-0 max-w-full overflow-hidden pt-0 lg:w-96 lg:max-w-md lg:shrink-0",
        className
      )}
    >
      <Section.Title className="py-3" icon={<FaDiscord aria-hidden />}>
        Join us on Discord
      </Section.Title>
      <Section.Content type="full">
        <div
          className={cn(
            "flex min-w-0 flex-col gap-5 overflow-hidden rounded-xl border border-border bg-foreground/5 p-5 shadow-sm",
            !link && "opacity-75"
          )}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-accent" />
              <span className="text-sm">Loading server…</span>
            </div>
          ) : error && !inviteUrl ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Unable to load server info. Check back later.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-base font-semibold">{name}</span>
                {hasWidgetData && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
                    {onlineCount} online
                  </span>
                )}
              </div>

              {members.length > 0 ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Users className="size-3.5" />
                    Online now
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {members.slice(0, 9).map((m, i) => (
                      <div
                        key={`${m.username}-${i}`}
                        className="flex items-center gap-2 rounded-lg bg-foreground/10 px-2.5 py-2"
                        title={m.username}
                      >
                        {m.avatar_url ? (
                          <img
                            src={m.avatar_url}
                            alt=""
                            className="size-7 shrink-0 rounded-full"
                            width={28}
                            height={28}
                          />
                        ) : (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
                            {(m.username?.[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                        <span className="min-w-0 truncate text-sm">
                          {m.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : hasWidgetData && (
                <p className="text-center text-sm text-muted-foreground">
                  Be the first to join the conversation.
                </p>
              )}

              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-3 font-medium text-white transition-all hover:bg-[#4752C4] hover:shadow-md"
                >
                  <FaDiscord className="size-5" />
                  Join Server
                </a>
              )}
            </>
          )}
        </div>
      </Section.Content>
    </Section>
  )
}

export default DiscordWidget
