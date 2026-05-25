"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
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
import { syncCurrentUser } from "@/hooks/use-current-user"
import { applyApiErrors } from "@/lib/api-errors"
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/schemas/profile.schema"
import { systemToast } from "@/lib/toast"
import { updateProfile } from "@/services/auth.service"
import type { UpdateProfileRequest, UserResponse } from "@/types/auth"

export function ProfileDetailsForm({ user }: { user: UserResponse }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "", username: user.username ?? "" },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: UpdateProfileRequest = {}
    if ((values.name ?? "") !== (user.name ?? "")) payload.name = values.name
    if ((values.username ?? "") !== (user.username ?? ""))
      payload.username = values.username

    if (Object.keys(payload).length === 0) {
      systemToast.updateSuccess()
      return
    }

    try {
      const updated = await updateProfile(payload)
      syncCurrentUser(queryClient, updated)
      reset({ name: updated.name ?? "", username: updated.username ?? "" })
      systemToast.updateSuccess()
    } catch (error) {
      applyApiErrors<ProfileFormValues>(error, setError)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>زانیاری کەسی</CardTitle>
        <CardDescription>
          ناوی پیشاندان و ناوی بەکارهێنەرت بگۆڕە
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">ناو</FieldLabel>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="username">ناوی بەکارهێنەر</FieldLabel>
              <Input
                id="username"
                type="text"
                dir="ltr"
                autoComplete="username"
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.username.message}
                </p>
              ) : null}
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-fit"
              >
                {isSubmitting ? <Spinner className="size-4" /> : null}
                پاشەکەوتکردن
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
