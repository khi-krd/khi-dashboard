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
import {
  AlbumIcon,
  BookOpen02Icon,
  Briefcase01Icon,
  Call02Icon,
  CommandIcon,
  CropIcon,
  DashboardSquare01Icon,
  FolderKanbanIcon,
  InformationCircleIcon,
  MapsIcon,
  MusicNote01Icon,
  News01Icon,
  PieChartIcon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import { useAuthStore } from "@/store/auth.store"

const navMainItems = [
  {
    title: "داشبۆرد",
    url: "/",
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    title: "هەواڵەکان",
    url: "/news",
    icon: <HugeiconsIcon icon={News01Icon} strokeWidth={2} />,
  },
  {
    title: "پرۆژەکان",
    url: "/projects",
    icon: <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} />,
  },
  {
    title: "نووسراوەکان",
    url: "/writings",
    icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
  },
  {
    title: "کۆکراوەی وێنەکان",
    url: "/images",
    icon: <HugeiconsIcon icon={AlbumIcon} strokeWidth={2} />,
  },
  {
    title: "ئاوازەکان",
    url: "/soundtracks",
    icon: <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={2} />,
  },
  {
    title: "ڤیدیۆکان",
    url: "/videos",
    icon: <HugeiconsIcon icon={Video02Icon} strokeWidth={2} />,
  },
]

const navSecondaryItems = [
  {
    title: "دەربارە",
    url: "/about",
    icon: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />,
  },
  {
    title: "خزمەتگوزاری",
    url: "/service",
    icon: <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />,
  },
  {
    title: "پەیوەندی",
    url: "/contact",
    icon: <HugeiconsIcon icon={Call02Icon} strokeWidth={2} />,
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
