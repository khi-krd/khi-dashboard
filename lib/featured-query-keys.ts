export const featuredKeys = {
  all: ["featured"] as const,
  allItems: (page: number, size: number) =>
    [...featuredKeys.all, "items", page, size] as const,
  sounds: (page: number, size: number) =>
    [...featuredKeys.all, "sounds", page, size] as const,
  writings: (page: number, size: number) =>
    [...featuredKeys.all, "writings", page, size] as const,
  browse: (
    category: string,
    page: number,
    size: number,
    search: string,
  ) => [...featuredKeys.all, "browse", category, page, size, search] as const,
  overlay: () => [...featuredKeys.all, "overlay"] as const,
}
