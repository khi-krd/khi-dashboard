"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { AccountInfo } from "@/components/profile/account-info"
import { DangerZone } from "@/components/profile/danger-zone"
import { PasswordForm } from "@/components/profile/password-form"
import { ProfileDetailsForm } from "@/components/profile/profile-details-form"
import { ProfileImageCard } from "@/components/profile/profile-image-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentUserQuery } from "@/hooks/use-current-user"
import { resolveAvatarSrc } from "@/lib/profile-image"
import type { UserResponse, UserRole } from "@/types/auth"

const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "میوان",
  EMPLOYEE: "کارمەند",
  ADMIN: "بەڕێوەبەر",
  SUPER_ADMIN: "سەرپەرشتیار",
}

function ProfileHeader({ user }: { user: UserResponse }) {
  const initials =
    (user.name?.trim() || user.username?.trim() || user.email?.trim() || "؟")
      .slice(0, 2)
      .toUpperCase()
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={resolveAvatarSrc(user)} alt={user.name} />
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <p className="text-muted-foreground truncate text-sm" dir="ltr">
            @{user.username}
          </p>
        </div>
        <Badge variant="secondary" className="ms-auto">
          {ROLE_LABELS[user.role]}
        </Badge>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-9 w-72 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function ProfileClient() {
  const query = useCurrentUserQuery()

  return (
    <div dir="rtl" className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-6 lg:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">پرۆفایلی من</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          بەڕێوەبردنی زانیاری هەژمار و ڕێکخستنەکانت
        </p>
      </header>

      {query.isLoading ? (
        <ProfileSkeleton />
      ) : query.isError || !query.data ? (
        <Card>
          <CardContent className="grid gap-2 py-12 text-center">
            <p className="text-sm font-medium">
              داگرتنی زانیاری هەژمار سەرکەوتوو نەبوو
            </p>
            <div>
              <Button
                variant="outline"
                onClick={() => void query.refetch()}
                className="mx-auto"
              >
                <ArrowPathIcon className="size-4" />
                دووبارە هەوڵدان
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <ProfileHeader user={query.data} />

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">پرۆفایل</TabsTrigger>
              <TabsTrigger value="password">وشەی نهێنی</TabsTrigger>
              <TabsTrigger value="account">هەژمار</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="grid gap-4">
              <ProfileImageCard user={query.data} />
              <ProfileDetailsForm user={query.data} />
            </TabsContent>

            <TabsContent value="password" className="grid gap-4">
              <PasswordForm />
            </TabsContent>

            <TabsContent value="account" className="grid gap-4">
              <AccountInfo user={query.data} />
              <DangerZone />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
