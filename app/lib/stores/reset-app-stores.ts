import { useCategoriesStore } from "~/stores/categories.store"
import { useCompanyStore } from "~/stores/company.store"
import { usePermissionsStore } from "~/stores/permissions.store"
import { useProductsStore } from "~/stores/products.store"
import { useRolesStore } from "~/stores/roles.store"
import { useUsersStore } from "~/stores/users.store"

/** Limpia todos los stores de datos de sesión. */
export function resetAppStores() {
  useUsersStore.getState().reset()
  useRolesStore.getState().reset()
  usePermissionsStore.getState().reset()
  useProductsStore.getState().reset()
  useCategoriesStore.getState().reset()
  useCompanyStore.getState().reset()
}
