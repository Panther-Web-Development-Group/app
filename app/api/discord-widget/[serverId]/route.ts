import { NextResponse } from "next/server"

const WIDGET_API = "https://discord.com/api/guilds"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const { serverId } = await params
  if (!serverId) {
    return NextResponse.json({ error: "Server ID required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${WIDGET_API}/${serverId}/widget.json`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Discord widget unavailable" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch widget" },
      { status: 500 }
    )
  }
}
