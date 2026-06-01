import type { SupabaseClient } from "@supabase/supabase-js"

import { RoleSchema, type Role } from "~/domain/auth/auth.schemas"

const ROLE_SELECT = "id, name, description, active, permissions"

function parseRoleRow(data: unknown): Role | null {
  const parsed = RoleSchema.safeParse(data)
  return parsed.success ? parsed.data : null
}

function normalizeRoleEmbed(
  row: Record<string, unknown>,
): Record<string, unknown> | null {
  const role = row.role
  if (role && typeof role === "object" && !Array.isArray(role)) {
    return role as Record<string, unknown>
  }
  if (Array.isArray(role) && role.length === 1) {
    return role[0] as Record<string, unknown>
  }
  return null
}

/** roles.id === user_profiles.role_id */
export async function fetchRoleByProfileRoleId(
  supabase: SupabaseClient,
  profileRoleId: string,
): Promise<Role | null> {
  const { data, error } = await supabase
    .from("roles")
    .select(ROLE_SELECT)
    .eq("id", profileRoleId)
    .limit(1)

  if (error) return null

  const row = data?.[0]
  if (!row || row.id !== profileRoleId || row.active === false) return null

  return parseRoleRow(row)
}

export async function fetchRoleViaUserProfile(
  supabase: SupabaseClient,
  userId: string,
  profileRoleId: string,
): Promise<Role | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`role_id, role:roles!role_id (${ROLE_SELECT})`)
    .eq("id", userId)
    .eq("role_id", profileRoleId)
    .limit(1)

  if (error) return null

  const profileRow = data?.[0] as Record<string, unknown> | undefined
  const roleRow = profileRow ? normalizeRoleEmbed(profileRow) : null
  if (!roleRow || (roleRow as { active?: boolean }).active === false) {
    return null
  }

  return parseRoleRow(roleRow)
}

/** @deprecated Usar fetchRoleByProfileRoleId */
export async function fetchRoleById(
  supabase: SupabaseClient,
  roleId: string,
): Promise<Role | null> {
  return fetchRoleByProfileRoleId(supabase, roleId)
}

export async function fetchRoleByName(
  supabase: SupabaseClient,
  name: string,
): Promise<Role | null> {
  const { data, error } = await supabase
    .from("roles")
    .select(ROLE_SELECT)
    .eq("name", name)
    .limit(1)

  if (error || !data?.length) return null

  const row = data[0]
  if (row.active === false) return null

  return parseRoleRow(row)
}
