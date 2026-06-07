import { useProductsStore } from "~/stores/products.store"

/** Sincroniza categorías del catálogo de productos tras cambios en el módulo de categorías. */
export function syncProductsCategories() {
  useProductsStore.setState({ categoriesInitialized: false })
  void useProductsStore.getState().fetchCategories()
  void useProductsStore.getState().fetchAll({ force: true })
}
