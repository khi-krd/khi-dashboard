"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { BrandMark } from "@/components/brand-mark"
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
  FavouriteIcon,
  CollectionsBookmarkIcon,
  DashboardSquare01Icon,
  FolderKanbanIcon,
  InformationCircleIcon,
  Menu01Icon,
  News01Icon,
  PaintBoardIcon,
  SparklesIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { useCurrentUserQuery } from "@/hooks/use-current-user"
import { resolveAvatarSrc } from "@/lib/profile-image"
import { useAuthStore } from "@/store/auth.store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar")
  // Re-fetches /api/user/me when logged in; repopulates the store after a
  // refresh (the user object isn't persisted) so the footer shows live data.
  useCurrentUserQuery()
  const authUser = useAuthStore((s) => s.user)

  const avatarSrc = resolveAvatarSrc(authUser)

  const sidebarUser = {
    name:
      authUser?.name?.trim() ||
      authUser?.username?.trim() ||
      "بەکارهێنەر",
    email: authUser?.email?.trim() || "",
    avatar: avatarSrc,
  }

  const navGroups = [
    {
      label: t("labels.overview"),
      items: [
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
      ],
    },
    {
      // Its own section on purpose. This page controls two different surfaces
      // — the homepage carousel and the per-page highlight bands on /services
      // and /about — so filing it under publishing would misdescribe it.
      label: t("labels.highlighting"),
      items: [
        {
          title: "تایبەتەکان",
          url: "/dashboard/featured",
          icon: <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />,
        },
      ],
    },
    {
      label: t("labels.publishing"),
      items: [
        {
          title: "بڵاوکردنەوە",
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
        {
          title: "بابەتەکان",
          url: "/dashboard/topics",
          icon: <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />,
        },
      ],
    },
    {
      label: t("labels.site"),
      items: [
        {
          title: "مێنیوی ماڵپەڕ",
          url: "/dashboard/menu",
          icon: <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />,
        },
        {
          title: "خزمەتگوزارییەکان",
          url: "/dashboard/services",
          icon: <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />,
        },
        {
          title: "دەربارە",
          url: "/dashboard/about",
          icon: (
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          ),
        },
        {
          title: "پەیوەندی",
          url: "/dashboard/contact",
          icon: <HugeiconsIcon icon={Call02Icon} strokeWidth={2} />,
        },
        {
          title: "بەخشین",
          url: "/dashboard/donations",
          icon: <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />,
        },
        {
          title: "براندینگ",
          url: "/dashboard/settings/branding",
          icon: <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} />,
        },
      ],
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center">
                <BrandMark size={32} priority />
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
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
