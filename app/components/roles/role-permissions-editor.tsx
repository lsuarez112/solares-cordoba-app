"use client"

import * as React from "react"

import { Checkbox } from "~/components/ui/checkbox"
import type { Action, Module } from "~/domain/auth/auth.schemas"
import {
  ALL_PERMISSION_ACTIONS,
  PERMISSION_ACTIONS,
  PERMISSION_SECTIONS,
} from "~/lib/roles/role-permissions.config"
import {
  getGlobalSelectionState,
  getModuleSelectionState,
  getModulesSelectionState,
  hasAction,
  toggleAction,
  toggleGlobalAll,
  toggleModuleAll,
  toggleModulesAll,
  type PermissionsEditorState,
} from "~/lib/roles/role-permissions.utils"
import { cn } from "~/lib/utils"

type RolePermissionsEditorProps = {
  value: PermissionsEditorState
  onChange: (value: PermissionsEditorState) => void
}

function SelectionCheckbox({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean | "indeterminate"
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-1.5 text-xs font-medium",
        className,
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={label}
      />
      <span>{label}</span>
    </label>
  )
}

function ActionCheckbox({
  module,
  action,
  label,
  checked,
  onToggle,
}: {
  module: Module
  action: Action
  label: string
  checked: boolean
  onToggle: (module: Module, action: Action) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1 text-[11px] text-muted-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle(module, action)}
        aria-label={`${label} ${action}`}
      />
      <span>{label}</span>
    </label>
  )
}

export function RolePermissionsEditor({
  value,
  onChange,
}: RolePermissionsEditorProps) {
  const globalState = getGlobalSelectionState(value)

  function handleToggleAction(module: Module, action: Action) {
    onChange(toggleAction(value, module, action))
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SelectionCheckbox
        checked={globalState}
        onCheckedChange={() =>
          onChange(toggleGlobalAll(value, undefined, ALL_PERMISSION_ACTIONS))
        }
        label="Seleccionar todos"
        className="rounded-lg border bg-muted/30 px-2.5 py-1.5"
      />

      <div className="flex flex-col gap-2">
        {PERMISSION_SECTIONS.map((section) => {
          const sectionModules = section.modules.map((item) => item.module)
          const sectionState = getModulesSelectionState(
            value,
            sectionModules,
            ALL_PERMISSION_ACTIONS,
          )

          return (
            <section
              key={section.id}
              className="overflow-hidden rounded-lg border bg-card"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-2.5 py-1.5">
                <h4 className="min-w-0 text-xs font-semibold break-words">{section.label}</h4>
                <SelectionCheckbox
                  checked={sectionState}
                  onCheckedChange={() =>
                    onChange(
                      toggleModulesAll(
                        value,
                        sectionModules,
                        ALL_PERMISSION_ACTIONS,
                      ),
                    )
                  }
                  label="Sección"
                  className="text-[11px] font-normal text-muted-foreground"
                />
              </div>

              <div className="flex flex-col divide-y">
                {section.modules.map(({ module, label }) => {
                  const moduleState = getModuleSelectionState(
                    value,
                    module,
                    ALL_PERMISSION_ACTIONS,
                  )

                  return (
                    <div
                      key={module}
                      className="flex min-w-0 flex-col gap-1.5 px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <SelectionCheckbox
                        checked={moduleState}
                        onCheckedChange={() =>
                          onChange(toggleModuleAll(value, module))
                        }
                        label={label}
                        className="min-w-0 shrink-0 font-medium text-foreground sm:min-w-32"
                      />

                      <div className="flex flex-wrap gap-x-3 gap-y-1 sm:justify-end">
                        {PERMISSION_ACTIONS.map((action) => (
                          <ActionCheckbox
                            key={action.value}
                            module={module}
                            action={action.value}
                            label={action.label}
                            checked={hasAction(value, module, action.value)}
                            onToggle={handleToggleAction}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
