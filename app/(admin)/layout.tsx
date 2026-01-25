import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Content management dashboard",
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
