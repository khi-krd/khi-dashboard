// Validation is intentionally disabled dashboard-wide for testing: the
// backend's response is the only judge of what the editor typed. To re-enable
// client-side validation, swap `permissiveResolver` back to `zodResolver` from
// "@hookform/resolvers/zod" at each useForm call site.
import type { FieldValues, Resolver } from "react-hook-form"
import type { ZodTypeAny } from "zod"

export function permissiveResolver<T extends FieldValues>(
  schema: ZodTypeAny,
): Resolver<T> {
  return async (values) => {
    const parsed = await schema.safeParseAsync(values)
    if (parsed.success) {
      // Keep .default()/.trim() transforms; drop every error.
      return { values: parsed.data as T, errors: {} }
    }
    return { values, errors: {} }
  }
}
