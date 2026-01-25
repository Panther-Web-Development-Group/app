import { NextResponse } from "next/server"

// Required for `output: "export"` builds.
export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ 
    message: "API route is working!",
    timestamp: new Date().toISOString()
  })
}
