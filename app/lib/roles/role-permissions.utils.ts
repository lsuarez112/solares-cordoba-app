import type { Action, Module } from "~/domain/auth/auth.schemas"
import type { RolePermissions } from "~/domain/roles/roles.types"

import {
  ALL_PERMISSION_ACTIONS,
  ALL_PERMISSION_MODULES,
} from "./role-permissions.config"

export type PermissionsEditorState = Partial<Record<Module, Action[]>>

export function permissionsToEditorState(
  permissions: RolePermissions,
): PermissionsEditorState {
  return { ...permissions }
}

export function editorStateToPermissions(
  state: PermissionsEditorState,
): RolePermissions {
  const result: RolePermissions = {}

  for (const [module, actions] of Object.entries(state)) {
    if (actions && actions.length > 0) {
      result[module as Module] = [...actions]
    }
  }

  return result
}

export function hasAction(
  state: PermissionsEditorState,
  module: Module,
  action: Action,
): boolean {
  return state[module]?.includes(action) ?? false
}

export function toggleAction(
  state: PermissionsEditorState,
  module: Module,
  action: Action,
): PermissionsEditorState {
  const current = state[module] ?? []
  const next = current.includes(action)
    ? current.filter((item) => item !== action)
    : [...current, action]

  return {
    ...state,
    [module]: next.length > 0 ? next : undefined,
  }
}

export function setModuleActions(
  state: PermissionsEditorState,
  module: Module,
  actions: Action[],
): PermissionsEditorState {
  return {
    ...state,
    [module]: actions.length > 0 ? actions : undefined,
  }
}

export function setModulesActions(
  state: PermissionsEditorState,
  modules: Module[],
  actions: Action[],
): PermissionsEditorState {
  let next = { ...state }

  for (const module of modules) {
    next = setModuleActions(next, module, actions)
  }

  return next
}

export function getModuleSelectionState(
  state: PermissionsEditorState,
  module: Module,
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): boolean | "indeterminate" {
  const selected = state[module] ?? []
  const count = actions.filter((action) => selected.includes(action)).length

  if (count === 0) return false
  if (count === actions.length) return true
  return "indeterminate"
}

export function getModulesSelectionState(
  state: PermissionsEditorState,
  modules: Module[],
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): boolean | "indeterminate" {
  let fullCount = 0
  let partial = false

  for (const module of modules) {
    const moduleState = getModuleSelectionState(state, module, actions)
    if (moduleState === true) fullCount += 1
    if (moduleState === "indeterminate") partial = true
  }

  if (fullCount === modules.length) return true
  if (fullCount === 0 && !partial) return false
  return "indeterminate"
}

export function getGlobalSelectionState(
  state: PermissionsEditorState,
  modules: Module[] = ALL_PERMISSION_MODULES,
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): boolean | "indeterminate" {
  return getModulesSelectionState(state, modules, actions)
}

export function toggleModuleAll(
  state: PermissionsEditorState,
  module: Module,
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): PermissionsEditorState {
  const isFullySelected = getModuleSelectionState(state, module, actions) === true
  return setModuleActions(state, module, isFullySelected ? [] : actions)
}

export function toggleModulesAll(
  state: PermissionsEditorState,
  modules: Module[],
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): PermissionsEditorState {
  const isFullySelected =
    getModulesSelectionState(state, modules, actions) === true
  return setModulesActions(state, modules, isFullySelected ? [] : actions)
}

export function toggleGlobalAll(
  state: PermissionsEditorState,
  modules: Module[] = ALL_PERMISSION_MODULES,
  actions: Action[] = ALL_PERMISSION_ACTIONS,
): PermissionsEditorState {
  return toggleModulesAll(state, modules, actions)
}
