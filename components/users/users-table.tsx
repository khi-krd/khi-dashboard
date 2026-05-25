"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline"

import {
  NS,
  ROLE_BADGE_VARIANT,
  ROLE_LABELS,
  ROLE_ORDER,
} from "@/components/users/user-strings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import { resolveAvatarSrc } from "@/lib/profile-image"
import type { UserResponse, UserRole } from "@/types/auth"

function initialsOf(user: UserResponse): string {
  const source = user.name?.trim() || user.username?.trim() || user.email?.trim()
  return source ? source.slice(0, 2).toUpperCase() : "؟"
}

export function UsersTable({
  rows,
  pageIndex,
  pageSize,
  totalElements,
  busyUserId,
  onPageChange,
  onToggleActivation,
  onChangeRole,
  onDelete,
}: {
  rows: UserResponse[]
  pageIndex: number
  pageSize: number
  totalElements: number
  busyUserId: number | null
  onPageChange: (page: number) => void
  onToggleActivation: (user: UserResponse) => void
  onChangeRole: (user: UserResponse, role: UserRole) => void
  onDelete: (user: UserResponse) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const from = totalElements === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalElements)
  const isFirstPage = pageIndex <= 0
  const isLastPage = pageIndex >= totalPages - 1

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground/80 border-b text-xs font-medium">
              <th className="px-3 py-2.5 text-start">{NS.table.user}</th>
              <th className="hidden px-3 py-2.5 text-start md:table-cell">
                {NS.table.email}
              </th>
              <th className="w-28 px-3 py-2.5 text-start">{NS.table.role}</th>
              <th className="w-24 px-3 py-2.5 text-start">{NS.table.status}</th>
              <th className="hidden w-24 px-3 py-2.5 text-start lg:table-cell">
                {NS.table.provider}
              </th>
              <th className="hidden w-28 px-3 py-2.5 text-start lg:table-cell">
                {NS.table.date}
              </th>
              <th className="w-12 px-3 py-2.5 text-start" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {rows.map((user) => {
              const isBusy = busyUserId === user.userId
              return (
                <tr
                  key={user.userId}
                  className="hover:bg-muted/40 transition-colors"
                  data-busy={isBusy}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={resolveAvatarSrc(user)}
                          alt={user.name}
                        />
                        <AvatarFallback className="text-xs">
                          {initialsOf(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{user.name}</div>
                        <div
                          className="text-muted-foreground truncate text-xs"
                          dir="ltr"
                        >
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="text-muted-foreground hidden px-3 py-3 md:table-cell"
                    dir="ltr"
                  >
                    <span className="truncate">{user.email}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={user.isActivated ? "secondary" : "destructive"}
                    >
                      {user.isActivated ? NS.status.active : NS.status.inactive}
                    </Badge>
                  </td>
                  <td
                    className="text-muted-foreground hidden px-3 py-3 text-xs lg:table-cell"
                    dir="ltr"
                  >
                    {user.provider || "local"}
                  </td>
                  <td className="text-muted-foreground hidden px-3 py-3 font-mono text-xs lg:table-cell">
                    {user.createdAt ? formatRelativeTimeKu(user.createdAt) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={isBusy}
                            aria-label={NS.action.menu}
                          />
                        }
                      >
                        <EllipsisHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          onClick={() => onToggleActivation(user)}
                        >
                          {user.isActivated
                            ? NS.action.deactivate
                            : NS.action.activate}
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            {NS.action.changeRole}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={user.role}
                              onValueChange={(value) =>
                                onChangeRole(user, value as UserRole)
                              }
                            >
                              {ROLE_ORDER.map((role) => (
                                <DropdownMenuRadioItem key={role} value={role}>
                                  {ROLE_LABELS[role]}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(user)}
                        >
                          {NS.action.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalElements > pageSize ? (
        <div className="border-border text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-2.5 text-xs">
          <span>
            {NS.pagination.range(
              formatCkbDigits(from),
              formatCkbDigits(to),
              formatCkbDigits(totalElements),
            )}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={isFirstPage}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <span className="px-2 font-mono">
              {formatCkbDigits(pageIndex + 1)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={isLastPage}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
