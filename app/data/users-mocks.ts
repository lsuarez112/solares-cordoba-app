import type { AvailableRole, User, UserStatusFilter } from "~/domain/users/users.types"

/** Roles cargados desde la tabla `roles` (mock estático). */
export const MOCK_AVAILABLE_ROLES = [
  { id: "a0000000-0000-4000-8000-000000000001", name: "Admin" },
  { id: "a0000000-0000-4000-8000-000000000002", name: "Seller" },
  { id: "a0000000-0000-4000-8000-000000000003", name: "Viewer" },
  { id: "a0000000-0000-4000-8000-000000000004", name: "Gerente comercial" },
] as const

type MockUserSeed = Omit<User, "active" | "homePage">

function buildMockUser(user: MockUserSeed): User {
  return {
    ...user,
    active: user.status === "active",
    homePage: "/dashboard",
  }
}

const MOCK_USER_SEEDS: MockUserSeed[] = [
  {
    id: "1",
    fullName: "Juan García",
    roleId: MOCK_AVAILABLE_ROLES[1].id,
    roleName: MOCK_AVAILABLE_ROLES[1].name,
    status: "active",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2025-05-20T11:30:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "2",
    fullName: "María López",
    roleId: MOCK_AVAILABLE_ROLES[2].id,
    roleName: MOCK_AVAILABLE_ROLES[2].name,
    status: "pending",
    createdAt: "2025-05-28T14:00:00Z",
    updatedAt: "2025-05-28T14:00:00Z",
    notificationsEnabled: false,
    phone: null,
  },
  {
    id: "3",
    fullName: "Carlos Ruiz",
    roleId: MOCK_AVAILABLE_ROLES[0].id,
    roleName: MOCK_AVAILABLE_ROLES[0].name,
    status: "active",
    createdAt: "2023-06-22T08:45:00Z",
    updatedAt: "2025-04-12T16:20:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "4",
    fullName: "Ana Martínez",
    roleId: MOCK_AVAILABLE_ROLES[1].id,
    roleName: MOCK_AVAILABLE_ROLES[1].name,
    status: "pending",
    createdAt: "2025-05-25T10:30:00Z",
    updatedAt: "2025-05-25T10:30:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "5",
    fullName: "Pedro Sánchez",
    roleId: MOCK_AVAILABLE_ROLES[2].id,
    roleName: MOCK_AVAILABLE_ROLES[2].name,
    status: "inactive",
    createdAt: "2024-09-05T12:00:00Z",
    updatedAt: "2025-02-18T09:10:00Z",
    notificationsEnabled: false,
    phone: null,
  },
  {
    id: "6",
    fullName: "Laura Fernández",
    roleId: MOCK_AVAILABLE_ROLES[1].id,
    roleName: MOCK_AVAILABLE_ROLES[1].name,
    status: "active",
    createdAt: "2024-11-18T15:45:00Z",
    updatedAt: "2025-05-15T08:00:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "7",
    fullName: "Diego Torres",
    roleId: MOCK_AVAILABLE_ROLES[0].id,
    roleName: MOCK_AVAILABLE_ROLES[0].name,
    status: "pending",
    createdAt: "2025-05-29T11:20:00Z",
    updatedAt: "2025-05-29T11:20:00Z",
    notificationsEnabled: false,
    phone: null,
  },
  {
    id: "8",
    fullName: "Sofía Herrera",
    roleId: MOCK_AVAILABLE_ROLES[2].id,
    roleName: MOCK_AVAILABLE_ROLES[2].name,
    status: "active",
    createdAt: "2024-04-03T07:30:00Z",
    updatedAt: "2025-03-01T13:45:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "9",
    fullName: "Miguel Díaz",
    roleId: MOCK_AVAILABLE_ROLES[1].id,
    roleName: MOCK_AVAILABLE_ROLES[1].name,
    status: "active",
    createdAt: "2024-07-14T18:00:00Z",
    updatedAt: "2025-05-10T10:15:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "10",
    fullName: "Elena Vargas",
    roleId: MOCK_AVAILABLE_ROLES[2].id,
    roleName: MOCK_AVAILABLE_ROLES[2].name,
    status: "active",
    createdAt: "2023-12-01T09:00:00Z",
    updatedAt: "2025-01-08T17:30:00Z",
    notificationsEnabled: false,
    phone: null,
  },
  {
    id: "11",
    fullName: "Roberto Castro",
    roleId: MOCK_AVAILABLE_ROLES[0].id,
    roleName: MOCK_AVAILABLE_ROLES[0].name,
    status: "active",
    createdAt: "2023-03-20T11:00:00Z",
    updatedAt: "2025-05-22T12:00:00Z",
    notificationsEnabled: true,
    phone: null,
  },
  {
    id: "12",
    fullName: "Patricia Morales",
    roleId: MOCK_AVAILABLE_ROLES[1].id,
    roleName: MOCK_AVAILABLE_ROLES[1].name,
    status: "pending",
    createdAt: "2025-05-27T16:40:00Z",
    updatedAt: "2025-05-27T16:40:00Z",
    notificationsEnabled: true,
    phone: null,
  },
]

export const MOCK_USERS: User[] = MOCK_USER_SEEDS.map(buildMockUser)

export function getUserStats(users: User[]) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    pending: users.filter((user) => user.status === "pending").length,
    inactive: users.filter((user) => user.status === "inactive").length,
  }
}

export function filterUsersByStatus(
  users: User[],
  status: UserStatusFilter,
): User[] {
  if (status === "all") return users
  return users.filter((user) => user.status === status)
}
