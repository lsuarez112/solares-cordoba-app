import type { RoleIconKey } from "~/domain/roles/role-metadata.schema"
import { RoleMetadataSchema } from "~/domain/roles/role-metadata.schema"
import type { RoleFormValues } from "~/domain/roles/roles.schemas"
import type { RoleEditFormValues, RoleListItem } from "~/domain/roles/roles.types"
import {
  ROLE_BADGE_COLOR_PRESETS,
  getBadgeColorPresetOrDefault,
} from "~/lib/roles/role-badge-presets"
import {
  editorStateToPermissions,
  permissionsToEditorState,
} from "~/lib/roles/role-permissions.utils"

export const emptyRoleFormValues: RoleFormValues = {
  name: "",
  description: "",
  active: true,
  colorPresetId: ROLE_BADGE_COLOR_PRESETS[0].id,
  icon: "",
  displayOrder: "",
  permissions: {},
}

export function roleToFormValues(role: RoleListItem): RoleFormValues {
  return {
    name: role.name,
    description: role.description ?? "",
    active: role.active,
    colorPresetId: getBadgeColorPresetOrDefault(
      role.metadata.badge_color,
      role.metadata.badge_text_color,
    ).id,
    icon: (role.metadata.icon as string | undefined) ?? "",
    displayOrder: role.metadata.display_order?.toString() ?? "",
    permissions: permissionsToEditorState(role.permissions),
  }
}

export function formValuesToRolePayload(
  values: RoleFormValues,
): RoleEditFormValues {
  const colorPreset =
    ROLE_BADGE_COLOR_PRESETS.find((preset) => preset.id === values.colorPresetId) ??
    ROLE_BADGE_COLOR_PRESETS[0]

  const metadata: Record<string, string | number> = {
    badge_color: colorPreset.badge_color,
    badge_text_color: colorPreset.badge_text_color,
  }

  if (values.icon) {
    metadata.icon = values.icon
  }

  if (values.displayOrder.trim()) {
    const parsedOrder = Number.parseInt(values.displayOrder, 10)
    if (!Number.isNaN(parsedOrder)) {
      metadata.display_order = parsedOrder
    }
  }

  const metadataParsed = RoleMetadataSchema.safeParse(metadata)
  if (!metadataParsed.success) {
    throw new Error("Invalid metadata")
  }

  return {
    name: values.name.trim(),
    description: values.description?.trim() ?? "",
    active: values.active,
    permissions: editorStateToPermissions(values.permissions ?? {}),
    metadata: metadataParsed.data,
  }
}

export function getRoleFormPreviewMetadata(values: RoleFormValues) {
  const colorPreset =
    ROLE_BADGE_COLOR_PRESETS.find((preset) => preset.id === values.colorPresetId) ??
    ROLE_BADGE_COLOR_PRESETS[0]

  const metadata: Record<string, string | number> = {
    badge_color: colorPreset.badge_color,
    badge_text_color: colorPreset.badge_text_color,
  }

  if (values.icon) {
    metadata.icon = values.icon as RoleIconKey
  }

  if (values.displayOrder.trim()) {
    const parsedOrder = Number.parseInt(values.displayOrder, 10)
    if (!Number.isNaN(parsedOrder)) {
      metadata.display_order = parsedOrder
    }
  }

  const parsed = RoleMetadataSchema.safeParse(metadata)
  return parsed.success ? parsed.data : {}
}
