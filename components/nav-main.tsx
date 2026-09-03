"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function NavMain({
  groups,
}: {
  groups: {
    label: string
    className?: string
    items: {
      title: string
      url: string
      icon: React.ReactNode
      isActive?: boolean
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label} className={group.className}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const hasSubItems = Boolean(item.items?.length)
              // Longest match wins. The donations group holds both
              // `/dashboard/donations` and `/dashboard/donations/type-cards`, so a
              // plain `startsWith` would mark the parent page active while the
              // child page is open — two highlighted rows, neither of them wrong
              // enough to explain itself. Matching on a whole path segment also
              // stops `/dashboard/videos` claiming `/dashboard/videos-archive`.
              const activeSubUrl = item.items
                ?.filter(
                  (sub) =>
                    pathname === sub.url || pathname.startsWith(`${sub.url}/`),
                )
                .reduce<string | undefined>(
                  (best, sub) =>
                    best == null || sub.url.length > best.length
                      ? sub.url
                      : best,
                  undefined,
                )
              const isChildActive = hasSubItems && activeSubUrl != null
              const isActive = hasSubItems
                ? isChildActive
                : item.url === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.url)

              if (!hasSubItems) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<a href={item.url} />}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={item.isActive ?? isChildActive}
                  className="group/collapsible"
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      />
                    }
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="ms-auto transition-transform duration-200 group-data-open/collapsible:rotate-90"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const subActive = subItem.url === activeSubUrl
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={subActive}
                              render={<a href={subItem.url} />}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
