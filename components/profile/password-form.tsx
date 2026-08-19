"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { applyApiErrors } from "@/lib/api-errors"
import {
  passwordSchema,
  type PasswordFormValues,
} from "@/lib/schemas/profile.schema"
import { toastSuccess } from "@/lib/toast"
import { changePassword } from "@/services/auth.service"

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword(values)
      reset()
      toastSuccess("وشەی نهێنی نوێکرایەوە", "وشەی نهێنیەکەت بە سەرکەوتوویی گۆڕا")
    } catch (error) {
      applyApiErrors<PasswordFormValues>(error, setError, {
        messageField: "currentPassword",
      })
    }
  }

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 font-semibold text-foreground before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">
          گۆڕینی وشەی نهێنی
        </CardTitle>
        <CardDescription>
          بۆ پاراستن، وشەی نهێنی ئێستات داخڵ بکە
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">
                وشەی نهێنی ئێستا
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                {...register("currentPassword")}
              />
              {errors.currentPassword ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">وشەی نهێنی نوێ</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                دڵنیاکردنەوەی وشەی نهێنی نوێ
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting} className="w-fit">
                {isSubmitting ? <Spinner className="size-4" /> : null}
                نوێکردنەوەی وشەی نهێنی
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
