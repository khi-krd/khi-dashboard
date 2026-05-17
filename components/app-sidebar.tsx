"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
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
import {
  Briefcase01Icon,
  Call02Icon,
  CollectionsBookmarkIcon,
  CommandIcon,
  DashboardSquare01Icon,
  FolderKanbanIcon,
  InformationCircleIcon,
  News01Icon,
} from "@hugeicons/core-free-icons"
import { useAuthStore } from "@/store/auth.store"

const navMainItems = [
  {
    title: "داشبۆرد",
    url: "/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    title: "هەواڵەکان",
    url: "/dashboard/news",
    icon: <HugeiconsIcon icon={News01Icon} strokeWidth={2} />,
  },
  {
    title: "پرۆژەکان",
    url: "/dashboard/projects",
    icon: <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} />,
  },
  {
    title: "خزمەتگوزارییەکان",
    url: "/dashboard/services",
    icon: <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />,
  },
  {
    title: "بڵاوکراوەکان",
    url: "#",
    icon: (
      <HugeiconsIcon icon={CollectionsBookmarkIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "ڤیدیۆکان",
        url: "/dashboard/videos",
      },
      {
        title: "دەنگەکان",
        url: "/dashboard/sounds",
      },
      {
        title: "کۆمەڵە وێنەکان",
        url: "/dashboard/image-collections",
      },
      {
        title: "نووسراوەکان",
        url: "/dashboard/writings",
      },
    ],
  },
]

const navSecondaryItems = [
  {
    title: "دەربارە",
    url: "/dashboard/about",
    icon: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />,
  },
  {
    title: "پەیوەندی",
    url: "/dashboard/contact",
    icon: <HugeiconsIcon icon={Call02Icon} strokeWidth={2} />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar")
  const authUser = useAuthStore((s) => s.user)

  const avatarSrc =
    authUser?.imageUrl?.trim() || authUser?.profileImage?.trim() || ""

  const sidebarUser = {
    name:
      authUser?.name?.trim() ||
      authUser?.username?.trim() ||
      "بەکارهێنەر",
    email: authUser?.email?.trim() || "",
    avatar: avatarSrc,
  }

  const data = {
    user: sidebarUser,
    navMain: navMainItems,
    navSecondary: navSecondaryItems,
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
