"use client"

import Image from "next/image"
import { BuildingLibraryIcon } from "@heroicons/react/24/outline"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { LoginForm } from "@/components/login-form"
import backgroundImage from "@/assets/background.jpg"
import { useLogin } from "@/hooks/use-login"
import { useAuthStore } from "@/store/auth.store"

export default function LoginPage() {
  const t = useTranslations("Brand")
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { form, onSubmit, isLoading, serverError, clearServerError } = useLogin()

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BuildingLibraryIcon className="size-4" aria-hidden />
            </div>
            {t("name")}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              form={form}
              onSubmit={onSubmit}
              isLoading={isLoading}
              serverError={serverError}
              clearServerError={clearServerError}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden min-h-svh bg-muted lg:block">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
