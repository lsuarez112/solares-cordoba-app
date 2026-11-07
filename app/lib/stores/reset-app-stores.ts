import { useCategoriesStore } from "~/stores/categories.store"
import { useCompaniesStore } from "~/stores/companies.store"
import { usePermissionsStore } from "~/stores/permissions.store"
import { useProductsStore } from "~/stores/products.store"
import { useRolesStore } from "~/stores/roles.store"
import { useSuppliersStore } from "~/stores/suppliers.store"
import { useUsersStore } from "~/stores/users.store"

/** Limpia todos los stores de datos de sesión (usuarios, roles, permisos, productos, categorías, proveedores, empresas). */
export function resetAppStores() {
  useUsersStore.getState().reset()
  useRolesStore.getState().reset()
  usePermissionsStore.getState().reset()
  useProductsStore.getState().reset()
  useCategoriesStore.getState().reset()
  useSuppliersStore.getState().reset()
  useCompaniesStore.getState().reset()
}
