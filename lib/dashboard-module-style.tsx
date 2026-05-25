import {
  MusicalNoteIcon,
  NewspaperIcon,
  PencilSquareIcon,
  PhotoIcon,
  Squares2X2Icon,
  UserCircleIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"

import type { DashboardModuleKey } from "@/lib/dashboard-overview"

type ModuleStyle = {
  Icon: typeof UserCircleIcon
  /** Tint for the icon chip background + foreground. */
  chip: string
  /** Accent for the headline count. */
  count: string
  /** Thin accent bar at the top of the card. */
  bar: string
  /** Raw hex (Tailwind 500 shade) for charts and other canvas fills. */
  color: string
}

export const DASHBOARD_MODULE_STYLE: Record<DashboardModuleKey, ModuleStyle> = {
  about: {
    Icon: UserCircleIcon,
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    count: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500/60",
    color: "#0ea5e9",
  },
  news: {
    Icon: NewspaperIcon,
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    count: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500/60",
    color: "#f43f5e",
  },
  projects: {
    Icon: Squares2X2Icon,
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    count: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500/60",
    color: "#8b5cf6",
  },
  services: {
    Icon: WrenchScrewdriverIcon,
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    count: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500/60",
    color: "#f59e0b",
  },
  videos: {
    Icon: VideoCameraIcon,
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    count: "text-red-600 dark:text-red-400",
    bar: "bg-red-500/60",
    color: "#ef4444",
  },
  sounds: {
    Icon: MusicalNoteIcon,
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    count: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500/60",
    color: "#10b981",
  },
  collections: {
    Icon: PhotoIcon,
    chip: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    count: "text-fuchsia-600 dark:text-fuchsia-400",
    bar: "bg-fuchsia-500/60",
    color: "#d946ef",
  },
  writings: {
    Icon: PencilSquareIcon,
    chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    count: "text-teal-600 dark:text-teal-400",
    bar: "bg-teal-500/60",
    color: "#14b8a6",
  },
}
