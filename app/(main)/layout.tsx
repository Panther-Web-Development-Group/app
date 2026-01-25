import { HeaderServer } from "@/app/globals/Header/HeaderServer"
import { Page } from "@/app/globals/Page"
import { SidebarServer } from "@/app/globals/Sidebar"
import { Main } from "@/app/globals/Main"
import { FooterServer } from "@/app/globals/Footer/FooterServer"
import { BackToTop } from "@/app/components/BackToTop"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Page>
      <HeaderServer />
      <div className="flex">
        <SidebarServer searchbar={false} />
        <Main container="full">{children}</Main>
      </div>
      <FooterServer />
      <BackToTop />
    </Page>
  )
}

