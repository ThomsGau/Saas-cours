import type { ApiErrorResponse } from "@/lib/api/types";

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    error: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.fieldErrors = fieldErrors;
  }

  static fromResponse(status: number, data: unknown): ApiError {
    if (isApiErrorResponse(data)) {
      return new ApiError(
        data.status ?? status,
        data.error,
        data.message,
        data.fieldErrors ?? undefined,
      );
    }

    return new ApiError(status, "Erreur API", "Une erreur inattendue est survenue.");
  }
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as ApiErrorResponse).message === "string"
  );
}
