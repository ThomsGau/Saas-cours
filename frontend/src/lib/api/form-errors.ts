import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api/errors";

export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Partial<Record<string, FieldPath<T>>>,
): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) {
    return false;
  }

  for (const [field, message] of Object.entries(error.fieldErrors)) {
    const formField = (fieldMap?.[field] ?? field) as FieldPath<T>;
    setError(formField, { type: "server", message });
  }

  return true;
}
