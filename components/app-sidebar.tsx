"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerTerminalIcon, RoboticIcon, BookOpen02Icon, Settings05Icon, ChartRingIcon, SentIcon, CropIcon, PieChartIcon, MapsIcon, CommandIcon } from "@hugeicons/core-free-icons"

const navMainConfig = [
  {
    titleKey: "playground" as const,
    url: "#",
    icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
    isActive: true,
    itemKeys: ["history", "starred", "settings"] as const,
  },
  {
    titleKey: "models" as const,
    url: "#",
    icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
    itemKeys: ["genesis", "explorer", "quantum"] as const,
  },
  {
    titleKey: "documentation" as const,
    url: "#",
    icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
    itemKeys: ["introduction", "getStarted", "tutorials", "changelog"] as const,
  },
  {
    titleKey: "settings" as const,
    url: "#",
    icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    itemKeys: ["general", "team", "billing", "limits"] as const,
  },
]

const navSecondaryConfig = [
  {
    titleKey: "support" as const,
    url: "#",
    icon: <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />,
  },
  {
    titleKey: "feedback" as const,
    url: "#",
    icon: <HugeiconsIcon icon={SentIcon} strokeWidth={2} />,
  },
]

const projectsConfig = [
  {
    nameKey: "designEngineering" as const,
    url: "#",
    icon: <HugeiconsIcon icon={CropIcon} strokeWidth={2} />,
  },
  {
    nameKey: "salesMarketing" as const,
    url: "#",
    icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
  },
  {
    nameKey: "travel" as const,
    url: "#",
    icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar")

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: navMainConfig.map((item) => ({
      title: t(`mainNav.${item.titleKey}.title`),
      url: item.url,
      icon: item.icon,
      isActive: item.isActive,
      items: item.itemKeys.map((key) => ({
        title: t(`mainNav.${item.titleKey}.items.${key}`),
        url: "#",
      })),
    })),
    navSecondary: navSecondaryConfig.map((item) => ({
      title: t(`secondaryNav.${item.titleKey}`),
      url: item.url,
      icon: item.icon,
    })),
    projects: projectsConfig.map((p) => ({
      name: t(`projects.${p.nameKey}`),
      url: p.url,
      icon: p.icon,
    })),
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{t("header.title")}</span>
                <span className="truncate text-xs">{t("header.subtitle")}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
