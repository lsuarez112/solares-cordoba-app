"use client"

import * as React from "react"
import {
  Building2,
  Loader2,
  Search,
  Star,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import { UserRoleBadge } from "~/components/users/user-role-badge"
import { useCompanyUsers } from "~/hooks/use-company-users"
import { usePermissionsStoreAdminSync } from "~/hooks/use-permissions-store-sync"
import type { Company } from "~/domain/companies/companies.schemas"
import type { UserCompanyMember } from "~/domain/user-companies/user-companies.schemas"
import type { BasicUser } from "~/stores/users.store"
import { useUsersStore } from "~/stores/users.store"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollableContent,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
type CompanyUsersModalProps = {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMembersChanged?: () => void
}

function MemberRow({
  member,
  pending,
  onSetDefault,
  onRemove,
}: {
  member: UserCompanyMember
  pending: boolean
  onSetDefault: () => void
  onRemove: () => void
}) {
  const displayName = member.user.full_name?.trim() || "Sin nombre"

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium">{displayName}</span>
          {member.is_default ? (
            <Badge variant="secondary" className="text-xs">
              <Star data-icon="inline-start" className="size-3 text-amber-500" />
              Predeterminada
            </Badge>
          ) : null}
          <Badge variant={member.user.active ? "outline" : "secondary"}>
            {member.user.active ? "Activo" : "Inactivo"}
          </Badge>
          {member.user.role ? (
            <UserRoleBadge
              roleId={member.user.role.id}
              roleName={member.user.role.name}
            />
          ) : (
            <Badge variant="secondary">Sin rol</Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!member.is_default ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            disabled={pending}
            onClick={onSetDefault}
          >
            Hacer predeterminada
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          onClick={onRemove}
          aria-label={`Desvincular ${displayName}`}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </div>
  )
}

function matchesMemberSearch(member: UserCompanyMember, search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return true

  const name = member.user.full_name?.toLowerCase() ?? ""
  const role = member.user.role?.name.toLowerCase() ?? ""
  return name.includes(query) || role.includes(query)
}

function MembersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function CompanyUsersModal({
  company,
  open,
  onOpenChange,
  onMembersChanged,
}: CompanyUsersModalProps) {
  usePermissionsStoreAdminSync()

  const basicUsers = useUsersStore((s) => s.basic)
  const fetchBasic = useUsersStore((s) => s.fetchBasic)
  const companyId = company?.id ?? null

  const { members, loading, pending, addUser, removeUser, setDefault } =
    useCompanyUsers(companyId, open)

  const [selectedUserId, setSelectedUserId] = React.useState<string>("")
  const [markAsDefault, setMarkAsDefault] = React.useState(false)
  const [memberSearch, setMemberSearch] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    void fetchBasic()
  }, [open, fetchBasic])

  React.useEffect(() => {
    if (!open) {
      setSelectedUserId("")
      setMarkAsDefault(false)
      setMemberSearch("")
    }
  }, [open])

  const filteredMembers = React.useMemo(
    () => members.filter((member) => matchesMemberSearch(member, memberSearch)),
    [members, memberSearch],
  )

  const assignedUserIds = React.useMemo(
    () => new Set(members.map((member) => member.user_id)),
    [members],
  )

  const availableUsers = React.useMemo(
    () =>
      basicUsers
        .filter((user) => !assignedUserIds.has(user.id))
        .sort((a, b) =>
          (a.full_name ?? "").localeCompare(b.full_name ?? "", "es"),
        ),
    [basicUsers, assignedUserIds],
  )

  const handleAddUser = async () => {
    if (!selectedUserId) return
    const ok = await addUser(selectedUserId, markAsDefault)
    if (ok) {
      setSelectedUserId("")
      setMarkAsDefault(false)
      onMembersChanged?.()
    }
  }

  const handleRemove = async (userId: string) => {
    const ok = await removeUser(userId)
    if (ok) onMembersChanged?.()
  }

  const handleSetDefault = async (userId: string) => {
    const ok = await setDefault(userId)
    if (ok) onMembersChanged?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="size-6 rounded object-contain"
              />
            ) : (
              <Building2 className="size-5 text-muted-foreground" />
            )}
            Usuarios de {company?.name ?? "la empresa"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Asigná o quitá usuarios vinculados a esta empresa. Cada usuario
            puede tener una empresa predeterminada.
          </DialogDescription>
        </DialogHeader>

        <DialogScrollableContent fill className="space-y-5">
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UserPlus className="size-3.5" />
              Agregar usuario
            </h3>

            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div className="space-y-2">
                <Label htmlFor="company-user-select">Usuario</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={pending || availableUsers.length === 0}
                >
                  <SelectTrigger id="company-user-select" className="w-full">
                    <SelectValue
                      placeholder={
                        availableUsers.length === 0
                          ? "No hay usuarios disponibles"
                          : "Seleccionar usuario..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableUsers.map((user: BasicUser) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name?.trim() || `Usuario ${user.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="company-user-default">
                    Empresa predeterminada
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Se usará como empresa principal del usuario.
                  </p>
                </div>
                <Switch
                  id="company-user-default"
                  checked={markAsDefault}
                  onCheckedChange={setMarkAsDefault}
                  disabled={pending || !selectedUserId}
                />
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                disabled={pending || !selectedUserId}
                onClick={() => void handleAddUser()}
              >
                {pending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <UserPlus data-icon="inline-start" />
                )}
                Agregar usuario
              </Button>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="size-3.5" />
                Usuarios asignados
              </h3>
              <Badge variant="secondary" className="tabular-nums">
                {memberSearch.trim()
                  ? `${filteredMembers.length} / ${members.length}`
                  : members.length}
              </Badge>
            </div>

            {!loading && members.length > 0 ? (
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Buscar por nombre o rol..."
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                />
              </InputGroup>
            ) : null}

            {loading ? (
              <MembersSkeleton />
            ) : members.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                Todavía no hay usuarios vinculados a esta empresa.
              </p>
            ) : filteredMembers.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                Ningún usuario coincide con &quot;{memberSearch.trim()}&quot;.
              </p>
            ) : (
              <ScrollArea className="h-[min(40vh,280px)]">
                <div className="space-y-2 pr-3">
                  {filteredMembers.map((member) => (
                    <MemberRow
                      key={member.user_id}
                      member={member}
                      pending={pending}
                      onSetDefault={() => void handleSetDefault(member.user_id)}
                      onRemove={() => void handleRemove(member.user_id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </section>
        </DialogScrollableContent>

        <DialogFooter className="shrink-0 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
