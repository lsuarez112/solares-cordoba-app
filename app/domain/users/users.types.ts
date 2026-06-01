export type UserStatus = "active" | "pending" | "inactive"

export type User = {
  id: string
  fullName: string | null
  roleId: string
  roleName: string
  active: boolean
  homePage: string
  status: UserStatus
  createdAt: string | null
  updatedAt: string | null
  notificationsEnabled: boolean
  phone: string | null
}

export type UserStatusFilter = "all" | UserStatus

export type AvailableRole = {
  id: string
  name: string
}

export type UserEditFormValues = {
  fullName: string
  phone: string
  active: boolean
  roleId: string
  homePage: string
  notificationsEnabled: boolean
}
