"use client"

import * as React from "react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { useTranslations } from "next-intl"
import type { UseFormReturn } from "react-hook-form"

import { ToastAlert } from "@/components/ui/toast-alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { LoginFormValues } from "@/lib/schemas/login.schema"

export type WiredLoginFormProps = {
  form: UseFormReturn<LoginFormValues>
  onSubmit: (values: LoginFormValues) => Promise<void>
  isLoading: boolean
  serverError: string | null
  clearServerError: () => void
}

export function LoginForm({
  form,
  onSubmit,
  isLoading,
  serverError,
  clearServerError,
  className,
  ...props
}: WiredLoginFormProps & Omit<React.ComponentProps<"form">, "onSubmit">) {
  const t = useTranslations("Login")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form
      noValidate
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder={t("usernamePlaceholder")}
            autoComplete="username"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username ? (
            <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
          ) : null}
        </Field>
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
            <a
              href="#"
              className="ms-auto text-sm underline-offset-4 hover:underline"
            >
              {t("forgotPassword")}
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </Field>
        {serverError ? (
          <ToastAlert
            variant="error"
            title={serverError}
            banner
            onClose={clearServerError}
          />
        ) : null}
        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <ArrowPathIcon className="size-4 animate-spin" aria-hidden />
            ) : (
              t("submit")
            )}
          </Button>
        </Field>
        <FieldSeparator>{t("separator")}</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("google")}
          </Button>
          <FieldDescription className="text-center">
            {t("noAccount")}{" "}
            <a href="#" className="underline underline-offset-4">
              {t("signUp")}
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
