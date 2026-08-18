export const siteSettingsKeys = {
  all: ["site-settings"] as const,
  settings: () => [...siteSettingsKeys.all, "settings"] as const,
}
