import type { Metadata } from "next"
import { Header } from "./globals/Header"
import { Footer } from "./globals/Footer"
import { Container } from "./globals/Container"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </Container>
  )
}