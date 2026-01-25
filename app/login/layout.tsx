import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to access the admin dashboard",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
