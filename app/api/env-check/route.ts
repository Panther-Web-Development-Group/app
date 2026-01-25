import { checkEnvVars } from "@/lib/check-env"
import { NextResponse } from "next/server"

/**
 * API route to check environment variables
 * GET /api/env-check
 * Returns status of environment variables (without exposing sensitive values)
 */
export const runtime = "nodejs"

export async function GET() {
  try {
    const { allSet, missing, values } = checkEnvVars()

    return NextResponse.json({
      status: allSet ? "ok" : "error",
      allSet,
      missing,
      // Only show if variables are set (not the actual values for security)
      present: Object.keys(values).filter((key) => values[key]),
      message: allSet
        ? "All required environment variables are set"
        : `Missing environment variables: ${missing.join(", ")}`,
    })
  } catch (error) {
    console.error("Error in env-check route:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check environment variables",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
