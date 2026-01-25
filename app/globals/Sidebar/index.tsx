import { type FC } from "react"
import { SidebarNavigationServer } from "./Navigation"
import { SidebarClient } from "./SidebarClient"
import type { SidebarProps } from "./types"

export const Sidebar: FC<SidebarProps> = ({
  logo,
  searchbar,
  navigation,
  className,
  ...props
}) => {
  return (
    <SidebarClient
      logo={logo}
      searchbar={searchbar}
      navigation={navigation}
      className={className}
      {...props}
    />
  )
}

// Server component version that fetches navigation from database
export async function SidebarServer({
  logo,
  searchbar,
  navigation,
  className,
  ...props
}: SidebarProps) {
  return (
    <SidebarClient
      logo={logo}
      searchbar={searchbar}
      navigation={navigation || <SidebarNavigationServer />}
      className={className}
      {...props}
    />
  )
}
