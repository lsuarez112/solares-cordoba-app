import { usePermissionsStore } from "~/stores/permissions.store"
import { useProductsStore } from "~/stores/products.store"
import { useRolesStore } from "~/stores/roles.store"
import { useUsersStore } from "~/stores/users.store"

/** Limpia todos los stores de datos de sesión (usuarios, roles, permisos, productos). */
export function resetAppStores() {
  useUsersStore.getState().reset()
  useRolesStore.getState().reset()
  usePermissionsStore.getState().reset()
  useProductsStore.getState().reset()
}
