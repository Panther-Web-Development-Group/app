import type { Metadata } from "next"
import type { FC } from "react"

import { JoinForm } from "@/app/globals/Join/JoinForm"
import { Section } from "@/app/globals/Page/Section"

export const metadata: Metadata = {
  title: "Join",
  description: "Apply to join PantherWeb.",
}

const JoinPage: FC = () => {
  return (
    <div className="content">
      <h1 className="page-title">Join Us</h1>
      <Section>
        <JoinForm />
      </Section>
    </div>
  )
}

export default JoinPage
