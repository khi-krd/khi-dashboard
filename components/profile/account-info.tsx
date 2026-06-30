"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatNewsDateLong } from "@/lib/intl-ckb"
import type { UserResponse, UserRole } from "@/types/auth"

const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "میوان",
  EMPLOYEE: "کارمەند",
  ADMIN: "بەڕێوەبەر",
  SUPER_ADMIN: "سەرپەرشتیار",
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{children}</span>
    </div>
  )
}

function fmt(date: string | null): string {
  return date ? formatNewsDateLong(date) : "—"
}

export function AccountInfo({ user }: { user: UserResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>زانیاری هەژمار</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-0 divide-y">
        <Row label="ئیمەیڵ">
          <span dir="ltr">{user.email}</span>
        </Row>
        <Row label="ڕۆڵ">
          <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
        </Row>
        <Row label="جۆری هەژمار">
          <span dir="ltr">{user.provider || "local"}</span>
        </Row>
        <Row label="دۆخ">
          <Badge variant={user.isActivated ? "secondary" : "destructive"}>
            {user.isActivated ? "چالاک" : "ناچالاک"}
          </Badge>
        </Row>
        <Separator className="my-1" />
        <Row label="بەرواری دروستکردن">{fmt(user.createdAt)}</Row>
        <Row label="دوایین نوێکردنەوە">{fmt(user.updatedAt)}</Row>
        <Row label="بەسەرچوونی وشەی نهێنی">
          {user.passwordExpiryDate ? fmt(user.passwordExpiryDate) : "بەسەرناچێت"}
        </Row>
      </CardContent>
    </Card>
  )
}
