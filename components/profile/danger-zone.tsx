"use client"

import * as React from "react"
import {
  ArrowRightStartOnRectangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { endClientSession } from "@/lib/session"
import { toastError } from "@/lib/toast"
import { deleteAccount, logoutAll } from "@/services/auth.service"

export function DangerZone() {
  const [busy, setBusy] = React.useState<"logoutAll" | "delete" | null>(null)

  const onLogoutAll = async () => {
    setBusy("logoutAll")
    try {
      await logoutAll()
      await endClientSession("manual")
    } catch {
      setBusy(null)
      toastError("نەتوانرا دەربچیت", "تکایە دووبارە هەوڵبدەرەوە")
    }
  }

  const onDelete = async () => {
    setBusy("delete")
    try {
      await deleteAccount()
      await endClientSession("deleted")
    } catch {
      setBusy(null)
      toastError("ئەژمێر نەسڕایەوە", "تکایە دووبارە هەوڵبدەرەوە")
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">ناوچەی مەترسیدار</CardTitle>
        <CardDescription>
          ئەم کردارانە کاریگەری گەورەیان هەیە — وریابە
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">دەرچوون لە هەموو ئامێرەکان</p>
            <p className="text-muted-foreground text-xs">
              هەموو دانیشتنە چالاکەکان لەسەر هەموو ئامێرەکان کۆتایی پێدێت
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" disabled={busy !== null}>
                  {busy === "logoutAll" ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ArrowRightStartOnRectangleIcon className="size-4" />
                  )}
                  دەرچوون لە هەمووان
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>دڵنیایت؟</AlertDialogTitle>
                <AlertDialogDescription>
                  لە هەموو ئامێرەکان دەردەچیت و پێویستە دووبارە بچیتە ژوورەوە
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
                <AlertDialogAction onClick={() => void onLogoutAll()}>
                  دەرچوون لە هەمووان
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">سڕینەوەی ئەژمێر</p>
            <p className="text-muted-foreground text-xs">
              ئەژمێرەکەت و هەموو زانیارییەکانت بە شێوەیەکی هەمیشەیی دەسڕێنەوە
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm" disabled={busy !== null}>
                  {busy === "delete" ? (
                    <Spinner className="size-4" />
                  ) : (
                    <TrashIcon className="size-4" />
                  )}
                  سڕینەوەی ئەژمێر
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>سڕینەوەی ئەژمێر؟</AlertDialogTitle>
                <AlertDialogDescription>
                  ئەم کردارە گەڕانەوەی نییە. ئەژمێرەکەت، دانیشتنەکان و هەموو
                  زانیارییەکانت بە تەواوی دەسڕێنەوە.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => void onDelete()}
                >
                  بەڵێ، بیسڕەوە
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
