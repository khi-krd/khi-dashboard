"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  changeUserRole,
  createUser,
  deleteUser,
  getUsers,
  setUserActivated,
  updateUser,
  type DashboardUser,
  type UserListParams,
} from "@/services/usersService"
import type { UserRole } from "@/types/auth"

const PAGE_SIZE = 15
const ROLES: UserRole[] = ["GUEST", "EMPLOYEE", "ADMIN", "SUPER_ADMIN"]

const S = {
  title: "بەکارهێنەران",
  subtitle: "بەڕێوەبردنی هەژمارەکان و ڕۆڵەکان",
  search: "گەڕان بە ناو، ئیمەیڵ...",
  allRoles: "هەموو ڕۆڵەکان",
  add: "زیادکردنی بەکارهێنەر",
  colUser: "بەکارهێنەر",
  colEmail: "ئیمەیڵ",
  colRole: "ڕۆڵ",
  colStatus: "دۆخ",
  colJoined: "بەرواری تۆماربوون",
  active: "چالاک",
  inactive: "ناچالاک",
  name: "ناو",
  username: "ناوی بەکارهێنەر",
  email: "ئیمەیڵ",
  password: "تێپەڕەوشە",
  passwordHint: "بۆ بەکارهێنەری نوێ پێویستە؛ بەجێهێڵە بۆ بێگۆڕان",
  role: "ڕۆڵ",
  create: "دروستکردن",
  save: "پاشەکەوتکردن",
  cancel: "هەڵوەشاندنەوە",
  edit: "دەستکاری",
  delete: "سڕینەوە",
  deleteTitle: "سڕینەوەی بەکارهێنەر؟",
  deleteDesc: "ئەم کردارە ناگەڕێتەوە. دڵنیایت؟",
  empty: "هیچ بەکارهێنەرێک نەدۆزرایەوە",
  error: "هەڵە لە بارکردنی بەکارهێنەران",
  prev: "پێشوو",
  next: "دواتر",
  of: "لە",
  total: "کۆی",
} as const

function fmtDate(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ckb-IQ")
}

export function UsersListClient() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState("")
  const [debounced, setDebounced] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DashboardUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DashboardUser | null>(null)
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as UserRole,
    isActivated: true,
  })

  const params: UserListParams = {
    page,
    size: PAGE_SIZE,
    keyword: debounced || undefined,
    role: role || undefined,
  }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getUsers(params),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name || undefined,
        username: form.username,
        email: form.email || undefined,
        password: form.password || undefined,
        role: form.role,
        isActivated: form.isActivated,
      }
      return editing?.userId
        ? updateUser(editing.userId, payload)
        : createUser(payload)
    },
    onSuccess: () => {
      toast.success(editing ? "نوێکرایەوە" : "دروستکرا")
      setDialogOpen(false)
      setEditing(null)
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        isActivated: true,
      })
      void invalidate()
    },
    onError: () => toast.error("هەڵە لە پاشەکەوتکردن"),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, r }: { id: number; r: UserRole }) =>
      changeUserRole(id, r),
    onSuccess: () => void invalidate(),
    onError: () => toast.error("ناتوانرێت ڕۆڵ بگۆڕدرێت"),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      setUserActivated(id, active),
    onSuccess: () => void invalidate(),
    onError: () => toast.error("ناتوانرێت دۆخ بگۆڕدرێت"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("سڕایەوە")
      setDeleteTarget(null)
      void invalidate()
    },
    onError: () => toast.error("ناتوانرێت بسڕدرێتەوە"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: "",
      username: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      isActivated: true,
    })
    setDialogOpen(true)
  }

  const openEdit = (u: DashboardUser) => {
    setEditing(u)
    setForm({
      name: u.name ?? "",
      username: u.username ?? "",
      email: u.email ?? "",
      password: "",
      role: (u.role as UserRole) ?? "EMPLOYEE",
      isActivated: u.isActivated ?? true,
    })
    setDialogOpen(true)
  }

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <UserGroupIcon className="size-6" />
            {S.title}
          </h1>
          <p className="text-muted-foreground text-sm">{S.subtitle}</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          {S.add}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <MagnifyingGlassIcon className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            className="ps-9"
            placeholder={S.search}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setPage(0)
              setDebounced(e.target.value)
            }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole((v as UserRole) || "")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={S.allRoles} />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-start">
                <th className="px-4 py-3 text-start font-medium">{S.colUser}</th>
                <th className="px-4 py-3 text-start font-medium">{S.colEmail}</th>
                <th className="px-4 py-3 text-start font-medium">{S.colRole}</th>
                <th className="px-4 py-3 text-start font-medium">{S.colStatus}</th>
                <th className="px-4 py-3 text-start font-medium">{S.colJoined}</th>
                <th className="px-4 py-3 text-end font-medium">{S.edit}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3" colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u.userId} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.name || u.username || "—"}</div>
                        <div className="text-muted-foreground text-xs">
                          @{u.username}
                        </div>
                      </td>
                      <td className="px-4 py-3">{u.email || "—"}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.role ?? undefined}
                          onValueChange={(v) =>
                            u.userId &&
                            roleMutation.mutate({ id: u.userId, r: v as UserRole })
                          }
                          disabled={roleMutation.isPending}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            checked={u.isActivated ?? false}
                            disabled={statusMutation.isPending}
                            onCheckedChange={(checked) =>
                              u.userId &&
                              statusMutation.mutate({
                                id: u.userId,
                                active: checked,
                              })
                            }
                          />
                          <span className="text-xs">
                            {u.isActivated ? S.active : S.inactive}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(u)}
                          >
                            {S.edit}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && isError ? (
                <tr>
                  <td className="text-muted-foreground px-4 py-8 text-center" colSpan={6}>
                    {S.error}
                    <Button variant="link" onClick={() => void refetch()}>
                      retry
                    </Button>
                  </td>
                </tr>
              ) : null}
              {!isLoading && !isError && users.length === 0 ? (
                <tr>
                  <td className="text-muted-foreground px-4 py-8 text-center" colSpan={6}>
                    {S.empty}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {S.total}: {data?.totalElements ?? 0}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                {S.prev}
              </Button>
              <span className="self-center text-xs">
                {page + 1} {S.of} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                {S.next}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? S.edit : S.add}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{S.name}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>{S.username}</Label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>{S.email}</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>{S.password}</Label>
              <Input
                type="text"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              {editing ? (
                <p className="text-muted-foreground text-xs">{S.passwordHint}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{S.role}</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  checked={form.isActivated}
                  onCheckedChange={(c) =>
                    setForm({ ...form, isActivated: c })
                  }
                />
                <span className="text-sm">{S.active}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {S.cancel}
            </Button>
            <Button
              disabled={saveMutation.isPending || !form.username.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {editing ? S.save : S.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{S.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.username} — {S.deleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{S.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget?.userId && deleteMutation.mutate(deleteTarget.userId)
              }
            >
              {S.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
