export const bookGenreKeys = {
  all: ["book-genres"] as const,
  lists: () => [...bookGenreKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...bookGenreKeys.lists(), { includeInactive }] as const,
}
