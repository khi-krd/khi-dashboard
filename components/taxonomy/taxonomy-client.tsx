"use client"

import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { TX } from "@/components/taxonomy/taxonomy-strings"
import { TaxonomyDeleteDialog } from "@/components/taxonomy/taxonomy-delete-dialog"
import { TaxonomyNameDialog } from "@/components/taxonomy/taxonomy-name-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useCreateNewsCategoryMutation,
  useCreateNewsSubCategoryMutation,
  useCreateProjectTypeMutation,
  useDeleteNewsCategoryMutation,
  useDeleteNewsSubCategoryMutation,
  useDeleteProjectTypeMutation,
  useNewsTaxonomyQuery,
  useProjectTypesQuery,
  useUpdateNewsCategoryMutation,
  useUpdateNewsSubCategoryMutation,
  useUpdateProjectTypeMutation,
} from "@/hooks/useTaxonomy"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type {
  NewsTaxonomyCategoryDto,
  NewsTaxonomySubCategoryDto,
  ProjectTypeDto,
} from "@/types/taxonomy"

type NamedTarget = { id: number; nameCkb: string; nameKmr: string }

type NameDialogState =
  | { kind: "category"; mode: "create" }
  | { kind: "category"; mode: "edit"; target: NamedTarget }
  | { kind: "subcategory"; mode: "create"; parent: NewsTaxonomyCategoryDto }
  | {
      kind: "subcategory"
      mode: "edit"
      parent: NewsTaxonomyCategoryDto
      target: NamedTarget
    }
  | { kind: "type"; mode: "create" }
  | { kind: "type"; mode: "edit"; target: NamedTarget }
  | null

type DeleteState =
  | { kind: "category"; target: NewsTaxonomyCategoryDto }
  | { kind: "subcategory"; target: NewsTaxonomySubCategoryDto }
  | { kind: "type"; target: ProjectTypeDto }
  | null

function usage(unit: string, count: number) {
  return `${formatCkbDigits(count)} ${unit}`
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={onEdit}
        >
          <PencilIcon className="size-4" />
          {TX.action.edit}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 gap-1"
        onClick={onDelete}
      >
        <TrashIcon className="size-4" />
        {TX.action.delete}
      </Button>
    </div>
  )
}

export function TaxonomyClient() {
  const newsQ = useNewsTaxonomyQuery()
  const typesQ = useProjectTypesQuery()

  const createCatMut = useCreateNewsCategoryMutation()
  const updateCatMut = useUpdateNewsCategoryMutation()
  const deleteCatMut = useDeleteNewsCategoryMutation()
  const createSubMut = useCreateNewsSubCategoryMutation()
  const updateSubMut = useUpdateNewsSubCategoryMutation()
  const deleteSubMut = useDeleteNewsSubCategoryMutation()
  const createTypeMut = useCreateProjectTypeMutation()
  const updateTypeMut = useUpdateProjectTypeMutation()
  const deleteTypeMut = useDeleteProjectTypeMutation()

  const [nameDialog, setNameDialog] = useState<NameDialogState>(null)
  const [deleteState, setDeleteState] = useState<DeleteState>(null)

  const categories = newsQ.data ?? []
  const types = typesQ.data ?? []

  const nameDialogPending =
    createCatMut.isPending ||
    updateCatMut.isPending ||
    createSubMut.isPending ||
    updateSubMut.isPending ||
    createTypeMut.isPending ||
    updateTypeMut.isPending

  const deletePending =
    deleteCatMut.isPending ||
    deleteSubMut.isPending ||
    deleteTypeMut.isPending

  function nameDialogTitle(d: NonNullable<NameDialogState>): string {
    if (d.kind === "category")
      return d.mode === "create"
        ? TX.dialog.create_category
        : TX.dialog.edit_category
    if (d.kind === "subcategory")
      return d.mode === "create"
        ? TX.dialog.create_subcategory
        : TX.dialog.edit_subcategory
    return d.mode === "create" ? TX.dialog.create_type : TX.dialog.edit_type
  }

  function submitNameDialog(payload: {
    nameCkb?: string
    nameKmr?: string
  }) {
    const d = nameDialog
    if (!d) return
    const close = () => setNameDialog(null)
    const onError = () => toast.error(TX.toast.error)
    if (d.kind === "category" && d.mode === "create") {
      createCatMut.mutate(payload, {
        onSuccess: () => {
          toast.success(TX.toast.created)
          close()
        },
        onError,
      })
    } else if (d.kind === "category") {
      updateCatMut.mutate(
        { id: d.target.id, payload },
        {
          onSuccess: () => {
            toast.success(TX.toast.updated)
            close()
          },
          onError,
        },
      )
    } else if (d.kind === "subcategory" && d.mode === "create") {
      createSubMut.mutate(
        { ...payload, categoryId: d.parent.id },
        {
          onSuccess: () => {
            toast.success(TX.toast.created)
            close()
          },
          onError,
        },
      )
    } else if (d.kind === "subcategory") {
      updateSubMut.mutate(
        { id: d.target.id, payload },
        {
          onSuccess: () => {
            toast.success(TX.toast.updated)
            close()
          },
          onError,
        },
      )
    } else if (d.mode === "create") {
      createTypeMut.mutate(payload, {
        onSuccess: () => {
          toast.success(TX.toast.created)
          close()
        },
        onError,
      })
    } else {
      updateTypeMut.mutate(
        { id: d.target.id, payload },
        {
          onSuccess: () => {
            toast.success(TX.toast.updated)
            close()
          },
          onError,
        },
      )
    }
  }

  function deleteBody(d: NonNullable<DeleteState>): string {
    if (d.kind === "category") {
      return d.target.newsCount > 0
        ? TX.delete.body(formatCkbDigits(d.target.newsCount), TX.unit.news)
        : TX.delete.bodyEmpty
    }
    if (d.kind === "subcategory") {
      return d.target.newsCount > 0
        ? TX.delete.body(formatCkbDigits(d.target.newsCount), TX.unit.news)
        : TX.delete.bodyEmpty
    }
    return d.target.projectCount > 0
      ? TX.delete.typeBody(formatCkbDigits(d.target.projectCount))
      : TX.delete.typeBodyEmpty
  }

  function confirmDelete() {
    const d = deleteState
    if (!d) return
    const close = () => setDeleteState(null)
    const onError = () => toast.error(TX.toast.error)
    const onSuccess = () => {
      toast.success(TX.toast.deleted)
      close()
    }
    if (d.kind === "category") {
      deleteCatMut.mutate(d.target.id, { onSuccess, onError })
    } else if (d.kind === "subcategory") {
      deleteSubMut.mutate(d.target.id, { onSuccess, onError })
    } else {
      deleteTypeMut.mutate(d.target.id, { onSuccess, onError })
    }
  }

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <header className="border-border/60 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {TX.page.title}
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-xl text-sm">
          {TX.page.subtitle}
        </p>
      </header>

      <Tabs defaultValue="news" className="w-full">
        <TabsList>
          <TabsTrigger value="news">{TX.tabs.news}</TabsTrigger>
          <TabsTrigger value="projects">{TX.tabs.projects}</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4 pt-6">
          <div className="flex justify-end">
            <Button
              type="button"
              className="gap-1.5"
              onClick={() =>
                setNameDialog({ kind: "category", mode: "create" })
              }
            >
              <PlusIcon className="size-4" />
              {TX.action.new_category}
            </Button>
          </div>

          {newsQ.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-foreground mb-2 text-base font-medium">
                {TX.empty.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {TX.empty.subtitle}
              </p>
              <Button
                type="button"
                onClick={() =>
                  setNameDialog({ kind: "category", mode: "create" })
                }
              >
                {TX.action.new_category}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <section
                  key={cat.id}
                  className="border-border/60 bg-card overflow-hidden rounded-lg border"
                >
                  <div className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <p className="text-foreground truncate font-medium">
                        {cat.nameCkb || TX.dash}
                      </p>
                      <p className="text-muted-foreground truncate text-sm" dir="ltr">
                        {cat.nameKmr || TX.dash}
                      </p>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {usage(TX.unit.news, cat.newsCount)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          setNameDialog({
                            kind: "subcategory",
                            mode: "create",
                            parent: cat,
                          })
                        }
                      >
                        <PlusIcon className="size-4" />
                        {TX.action.new_subcategory}
                      </Button>
                      <RowActions
                        onEdit={() =>
                          setNameDialog({
                            kind: "category",
                            mode: "edit",
                            target: {
                              id: cat.id,
                              nameCkb: cat.nameCkb,
                              nameKmr: cat.nameKmr,
                            },
                          })
                        }
                        onDelete={() =>
                          setDeleteState({ kind: "category", target: cat })
                        }
                      />
                    </div>
                  </div>

                  {cat.subCategories.length === 0 ? (
                    <p className="text-muted-foreground px-4 py-3 text-sm">
                      {TX.col.subs} — {TX.dash}
                    </p>
                  ) : (
                    <ul className="divide-border/60 divide-y">
                      {cat.subCategories.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                          <div className="flex min-w-0 items-baseline gap-3">
                            <p className="text-foreground truncate text-sm">
                              {sub.nameCkb || TX.dash}
                            </p>
                            <p
                              className="text-muted-foreground truncate text-xs"
                              dir="ltr"
                            >
                              {sub.nameKmr || TX.dash}
                            </p>
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {usage(TX.unit.news, sub.newsCount)}
                            </span>
                          </div>
                          <RowActions
                            onEdit={() =>
                              setNameDialog({
                                kind: "subcategory",
                                mode: "edit",
                                parent: cat,
                                target: {
                                  id: sub.id,
                                  nameCkb: sub.nameCkb,
                                  nameKmr: sub.nameKmr,
                                },
                              })
                            }
                            onDelete={() =>
                              setDeleteState({
                                kind: "subcategory",
                                target: sub,
                              })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 pt-6">
          <div className="flex justify-end">
            <Button
              type="button"
              className="gap-1.5"
              onClick={() => setNameDialog({ kind: "type", mode: "create" })}
            >
              <PlusIcon className="size-4" />
              {TX.action.new_type}
            </Button>
          </div>

          {typesQ.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : types.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-foreground mb-2 text-base font-medium">
                {TX.empty.title}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                {TX.empty.subtitle}
              </p>
              <Button
                type="button"
                onClick={() => setNameDialog({ kind: "type", mode: "create" })}
              >
                {TX.action.new_type}
              </Button>
            </div>
          ) : (
            <ul className="border-border/60 bg-card divide-border/60 divide-y overflow-hidden rounded-lg border">
              {types.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-baseline gap-3">
                    <p className="text-foreground truncate font-medium">
                      {t.nameCkb || TX.dash}
                    </p>
                    <p className="text-muted-foreground truncate text-sm" dir="ltr">
                      {t.nameKmr || TX.dash}
                    </p>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {usage(TX.unit.project, t.projectCount)}
                    </span>
                  </div>
                  <RowActions
                    onEdit={() =>
                      setNameDialog({
                        kind: "type",
                        mode: "edit",
                        target: {
                          id: t.id,
                          nameCkb: t.nameCkb,
                          nameKmr: t.nameKmr,
                        },
                      })
                    }
                    onDelete={() =>
                      setDeleteState({ kind: "type", target: t })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <TaxonomyNameDialog
        open={nameDialog != null}
        onOpenChange={(o) => {
          if (!o) setNameDialog(null)
        }}
        title={nameDialog ? nameDialogTitle(nameDialog) : ""}
        initial={
          nameDialog && "target" in nameDialog ? nameDialog.target : null
        }
        parentLabel={
          nameDialog?.kind === "subcategory"
            ? nameDialog.parent.nameCkb
            : null
        }
        isPending={nameDialogPending}
        onSubmit={submitNameDialog}
      />

      <TaxonomyDeleteDialog
        open={deleteState != null}
        onOpenChange={(o) => {
          if (!o) setDeleteState(null)
        }}
        title={TX.delete.title}
        nameCkb={deleteState ? deleteState.target.nameCkb : ""}
        nameKmr={deleteState ? deleteState.target.nameKmr : undefined}
        body={deleteState ? deleteBody(deleteState) : ""}
        isPending={deletePending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
