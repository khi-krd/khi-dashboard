/** Mirrors the backend ApiResponse envelope. */
export type StatsApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

/** Mirrors DashboardStatsDtos on the backend — every value is a live DB count. */

export type StatsBreakdownItem = {
  key: string
  nameCkb?: string | null
  nameKmr?: string | null
  count: number
}

export type StatsDimension = {
  key: string
  items: StatsBreakdownItem[]
}

export type StatsModule = {
  key: string
  total: number
  createdThisMonth: number
  createdThisYear: number
  /** Counts per month for the last six months, aligned with monthlyTrend. */
  monthly: number[]
  dimensions: StatsDimension[]
}

export type StatsOtherEntity = {
  key: string
  total: number
  /** Present only for tables with an `active` flag. */
  active?: number | null
  dimensions?: StatsDimension[] | null
}

export type StatsMonthPoint = {
  /** "YYYY-MM" */
  month: string
  total: number
}

export type DashboardStats = {
  generatedAt: string
  grandTotal: number
  modules: StatsModule[]
  otherEntities: StatsOtherEntity[]
  monthlyTrend: StatsMonthPoint[]
}
