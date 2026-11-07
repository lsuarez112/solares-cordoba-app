"use client"

import * as React from "react"
import { Save, Users } from "lucide-react"

import { CompanyLogoSection } from "./company-logo-section"
import { useCompanyForm } from "~/hooks/use-company-form"
import { PROVINCES_AR } from "~/lib/suppliers/supplier-form.constants"
import { appToast } from "~/lib/toast"
import { companiesService } from "~/services/companies.service"
import { useCompaniesStore } from "~/stores/companies.store"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogScrollableContent,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import type { Company } from "~/domain/companies/companies.schemas"

type CompanyModalProps = {
  canManageUsers?: boolean
  onOpenUsers?: (company: Company) => void
}

export function CompanyModal({
  canManageUsers = false,
  onOpenUsers,
}: CompanyModalProps) {
  const modalOpen = useCompaniesStore((s) => s.modalOpen)
  const editingCompany = useCompaniesStore((s) => s.editingCompany)
  const closeModal = useCompaniesStore((s) => s.closeModal)
  const update = useCompaniesStore((s) => s.update)

  const [pendingLogoFile, setPendingLogoFile] = React.useState<File | null>(
    null,
  )
  const [pendingLogoPreview, setPendingLogoPreview] = React.useState<
    string | null
  >(null)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)

  const clearPendingLogo = React.useCallback(() => {
    if (pendingLogoPreview) {
      URL.revokeObjectURL(pendingLogoPreview)
    }
    setPendingLogoFile(null)
    setPendingLogoPreview(null)
  }, [pendingLogoPreview])

  React.useEffect(() => {
    if (!modalOpen) {
      clearPendingLogo()
      setUploadingLogo(false)
    }
  }, [modalOpen, clearPendingLogo])

  const { form, isSubmitting, submitError, isEditing, onSubmit } =
    useCompanyForm({
      company: editingCompany,
      open: modalOpen,
      pendingLogoFile,
      onSuccess: closeModal,
      onClearPendingLogo: clearPendingLogo,
    })

  const displayedLogoUrl = isEditing
    ? editingCompany?.logo_url ?? null
    : pendingLogoPreview

  const handleLogoFileSelect = async (file: File) => {
    if (isEditing && editingCompany) {
      setUploadingLogo(true)
      try {
        const logoUrl = await companiesService.uploadLogo(
          editingCompany.id,
          file,
        )
        const updated = await update(editingCompany.id, { logo_url: logoUrl })
        if (!updated) {
          appToast.error("No se pudo guardar el logo", {
            description: "El archivo se subió, pero falló la actualización.",
          })
          return
        }
        appToast.success("Logo actualizado", {
          description: "El logo de la empresa se guardó correctamente.",
        })
      } catch {
        appToast.error("No se pudo subir el logo", {
          description: "Revisá el archivo e intentá de nuevo.",
        })
      } finally {
        setUploadingLogo(false)
      }
      return
    }

    if (pendingLogoPreview) {
      URL.revokeObjectURL(pendingLogoPreview)
    }
    setPendingLogoFile(file)
    setPendingLogoPreview(URL.createObjectURL(file))
  }

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(next) => {
        if (!next) closeModal()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>
            {isEditing ? "Editar empresa" : "Nueva empresa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <DialogScrollableContent fill className="space-y-6">
              <CompanyLogoSection
                logoUrl={displayedLogoUrl}
                isEditing={isEditing}
                uploading={uploadingLogo}
                disabled={isSubmitting}
                onFileSelect={handleLogoFileSelect}
                onClearPending={clearPendingLogo}
              />

              <Separator />

              <section className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Datos principales
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nombre comercial *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Solares del Sur"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legal_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón social</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Solares S.A."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CUIT / Tax ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="20-12345678-9"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          value={field.value ? "true" : "false"}
                          onValueChange={(value) =>
                            field.onChange(value === "true")
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Activa</SelectItem>
                            <SelectItem value="false">Inactiva</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contacto
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contacto@empresa.com"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+54 351..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Sitio web</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ubicación
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Av. Colón 1234"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Córdoba"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {PROVINCES_AR.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input placeholder="Argentina" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {submitError ? (
                <p className="text-sm text-destructive">{submitError}</p>
              ) : null}
            </DialogScrollableContent>

            <DialogFooter className="shrink-0 flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:justify-between">
              {isEditing && canManageUsers && editingCompany ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || uploadingLogo}
                  onClick={() => onOpenUsers?.(editingCompany)}
                >
                  <Users data-icon="inline-start" />
                  Gestionar usuarios
                </Button>
              ) : null}
              <div className="flex gap-2 sm:ml-auto">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingLogo}>
                <Save data-icon="inline-start" />
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar cambios"
                    : "Crear empresa"}
              </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
