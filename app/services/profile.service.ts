import type { SupabaseClient } from "@supabase/supabase-js"

import {
  UserProfileBaseSchema,
  UserProfileSchema,
  type UserProfile,
} from "~/domain/auth/auth.schemas"
import {
  fetchRoleByProfileRoleId,
  fetchRoleViaUserProfile,
} from "~/services/roles.service"

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data: profileRow, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .limit(1)

  if (profileError) return null

  const row = profileRow?.[0]
  if (!row) return null

  const baseParsed = UserProfileBaseSchema.safeParse(row)
  if (!baseParsed.success) return null

  const { role_id: roleId } = baseParsed.data

  let role = await fetchRoleByProfileRoleId(supabase, roleId)
  if (!role) {
    role = await fetchRoleViaUserProfile(supabase, userId, roleId)
  }

  if (!role || role.id !== roleId) return null

  const parsed = UserProfileSchema.safeParse({ ...baseParsed.data, role })
  return parsed.success ? parsed.data : null
}
