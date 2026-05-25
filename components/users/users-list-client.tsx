"use client"

import { useMemo, useState } from "react"
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { Alert, AlertDescription } from "@/components/reui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { UserDeleteDialog } from "@/components/users/user-delete-dialog"
import { UsersTable } from "@/components/users/users-table"
import { NS, ROLE_LABELS, ROLE_ORDER } from "@/components/users/user-strings"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useChangeUserRoleMutation,
  useDeleteUserMutation,
  useSetUserActivationMutation,
  useUsersListQuery,
} from "@/hooks/useUsers"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { systemToast, toastSuccess } from "@/lib/toast"
import type { UserResponse, UserRole } from "@/types/auth"
import type { UserRoleFilter, UserStatusFilter } from "@/types/users"

const PAGE_SIZE = 20

function ListSkeleton() {
  return (
    <div className="border-border bg-card grid gap-px overflow-hidden rounded-xl border">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ms-auto h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function UsersListClient() {
  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw, 300)
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
  const [busyUserId, setBusyUserId] = useState<number | null>(null)

  const listQ = useUsersListQuery({
    page: pageIndex,
    size: PAGE_SIZE,
    search: debouncedKw,
    role: roleFilter,
    status: statusFilter,
  })

  const changeRoleMut = useChangeUserRoleMutation()
  const activationMut = useSetUserActivationMutation()
  const deleteMut = useDeleteUserMutation()

  const rows = listQ.data?.content ?? []
  const total = listQ.data?.totalElements ?? 0

  const anyFilterActive = useMemo(
    () => searchRaw.trim() !== "" || roleFilter !== "all" || statusFilter !== "all",
    [searchRaw, roleFilter, statusFilter],
  )

  function resetFilters() {
    setSearchRaw("")
    setRoleFilter("all")
    setStatusFilter("all")
    setPageIndex(0)
  }

  async function onToggleActivation(user: UserResponse) {
    setBusyUserId(user.userId)
    try {
      await activationMut.mutateAsync({
        id: user.userId,
        isActivated: !user.isActivated,
      })
      toastSuccess(
        user.isActivated ? NS.toast.deactivated : NS.toast.activated,
      )
    } catch {
      systemToast.updateError()
    } finally {
      setBusyUserId(null)
    }
  }

  async function onChangeRole(user: UserResponse, role: UserRole) {
    if (role === user.role) return
    setBusyUserId(user.userId)
    try {
      await changeRoleMut.mutateAsync({ id: user.userId, role })
      toastSuccess(NS.toast.roleChanged)
    } catch {
      systemToast.updateError()
    } finally {
      setBusyUserId(null)
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.userId)
      toastSuccess(NS.toast.deleted)
      setDeleteTarget(null)
    } catch {
      systemToast.deleteError()
    }
  }

  return (
    <div dir="rtl" className="px-4 py-6 lg:px-6">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{NS.subtitle}</p>
          <p className="text-muted-foreground/70 mt-1.5 font-mono text-xs">
            {NS.count(formatCkbDigits(total))}
          </p>
        </div>
      </header>

      <Alert className="mb-4">
        <InformationCircleIcon className="size-4" />
        <AlertDescription>{NS.mockNotice}</AlertDescription>
      </Alert>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon className="text-muted-foreground absolute end-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={searchRaw}
            onChange={(e) => {
              setSearchRaw(e.target.value)
              setPageIndex(0)
            }}
            placeholder={NS.search_placeholder}
            className="border-border bg-background h-9 pe-10 ps-3"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value as UserRoleFilter)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{NS.filter.role_all}</SelectItem>
            {ROLE_ORDER.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as UserStatusFilter)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{NS.filter.status_all}</SelectItem>
            <SelectItem value="active">{NS.filter.active}</SelectItem>
            <SelectItem value="inactive">{NS.filter.inactive}</SelectItem>
          </SelectContent>
        </Select>

        {anyFilterActive ? (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <XMarkIcon className="me-1 size-3.5" />
            {NS.filter.reset}
          </Button>
        ) : null}
      </div>

      {listQ.isLoading ? (
        <ListSkeleton />
      ) : listQ.isError ? (
        <div className="text-muted-foreground grid gap-3 py-16 text-center text-sm">
          <p>{NS.error}</p>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void listQ.refetch()}
              className="mx-auto"
            >
              {NS.retry}
            </Button>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          {NS.empty}
        </div>
      ) : (
        <UsersTable
          rows={rows}
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          totalElements={total}
          busyUserId={busyUserId}
          onPageChange={setPageIndex}
          onToggleActivation={(user) => void onToggleActivation(user)}
          onChangeRole={(user, role) => void onChangeRole(user, role)}
          onDelete={setDeleteTarget}
        />
      )}

      <UserDeleteDialog
        target={deleteTarget}
        isPending={deleteMut.isPending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
      />
    </div>
  )
}
