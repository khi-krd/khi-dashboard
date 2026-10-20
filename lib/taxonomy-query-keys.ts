export const taxonomyKeys = {
  all: ["taxonomy"] as const,
  newsCategories: () => [...taxonomyKeys.all, "news-categories"] as const,
  projectTypes: () => [...taxonomyKeys.all, "project-types"] as const,
  soundTypes: () => [...taxonomyKeys.all, "sound-types"] as const,
  officeTypes: () => [...taxonomyKeys.all, "office-types"] as const,
}
