import Link from "next/link"
import { Main } from "@/app/globals/Main"

export default function NotFound() {
  return (
    <Main>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-foreground/85 mb-4">
          Page Not Found
        </h2>
        <p className="text-foreground/75 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium transition-colors hover:opacity-90"
        >
          Go Home
        </Link>
      </div>
    </Main>
  )
}
