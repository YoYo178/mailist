import { ApiError } from "@/lib/api.lib.js"

export const EmailNotFoundError = (message?: string) => new ApiError({
  statusCode: 404,
  message: message ?? 'Email not found'
})
