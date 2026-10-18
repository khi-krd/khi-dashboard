/** Managed taxonomy DTOs — /api/v1/news/categories, /news/subcategories, /projects/types. */

export type NewsTaxonomySubCategoryDto = {
  id: number
  nameCkb: string
  nameKmr: string
  categoryId: number
  newsCount: number
}

export type NewsTaxonomyCategoryDto = {
  id: number
  nameCkb: string
  nameKmr: string
  newsCount: number
  subCategories: NewsTaxonomySubCategoryDto[]
}

export type ProjectTypeDto = {
  id: number
  nameCkb: string
  nameKmr: string
  projectCount: number
}

export type TaxonomyWritePayload = {
  nameCkb?: string
  nameKmr?: string
}

export type SubCategoryWritePayload = TaxonomyWritePayload & {
  categoryId?: number
  categoryCkb?: string
  categoryKmr?: string
}
