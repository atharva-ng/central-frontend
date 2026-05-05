export type ApiResponse<T> = {
  success: boolean
  data: T
}

export type User = {
  id: string
  clerkUserId: string
  email: string
  createdAt: string
}
