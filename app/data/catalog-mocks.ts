import type { CatalogColumn } from "~/components/catalog/catalog-browse-table"

export type ProductoRow = {
  codigo: string
  nombre: string
  categoria: string
  potencia: string
  precio: string
  stock: string
}

export type TipoProductoRow = {
  codigo: string
  nombre: string
  descripcion: string
  productos: string
  estado: string
}

export const TIPOS_PRODUCTO_COLUMNS: CatalogColumn<TipoProductoRow>[] = [
  { key: "codigo", header: "Código", skeletonClassName: "w-[72px]" },
  { key: "nombre", header: "Nombre", skeletonClassName: "w-[160px]" },
  { key: "descripcion", header: "Descripción", skeletonClassName: "w-[200px]" },
  { key: "productos", header: "Productos", skeletonClassName: "w-[80px]" },
  { key: "estado", header: "Estado", skeletonClassName: "w-[80px]" },
]

export const PRODUCTOS_COLUMNS: CatalogColumn<ProductoRow>[] = [
  { key: "codigo", header: "Código", skeletonClassName: "w-[72px]" },
  { key: "nombre", header: "Nombre", skeletonClassName: "w-[180px]" },
  { key: "categoria", header: "Categoría", skeletonClassName: "w-[100px]" },
  { key: "potencia", header: "Potencia", skeletonClassName: "w-[80px]" },
  { key: "precio", header: "Precio", skeletonClassName: "w-[90px]" },
  { key: "stock", header: "Stock", skeletonClassName: "w-[60px]" },
]

export type KitRow = {
  codigo: string
  nombre: string
  potencia: string
  items: string
  precio: string
  estado: string
}

export const KITS_COLUMNS: CatalogColumn<KitRow>[] = [
  { key: "codigo", header: "Código", skeletonClassName: "w-[72px]" },
  { key: "nombre", header: "Nombre", skeletonClassName: "w-[200px]" },
  { key: "potencia", header: "Potencia", skeletonClassName: "w-[80px]" },
  { key: "items", header: "Componentes", skeletonClassName: "w-[90px]" },
  { key: "precio", header: "Precio", skeletonClassName: "w-[100px]" },
  { key: "estado", header: "Estado", skeletonClassName: "w-[80px]" },
]

export type ProveedorRow = {
  codigo: string
  nombre: string
  contacto: string
  cuit: string
  estado: string
}

export const PROVEEDORES_COLUMNS: CatalogColumn<ProveedorRow>[] = [
  { key: "codigo", header: "Código", skeletonClassName: "w-[72px]" },
  { key: "nombre", header: "Nombre", skeletonClassName: "w-[180px]" },
  { key: "contacto", header: "Contacto", skeletonClassName: "w-[160px]" },
  { key: "cuit", header: "CUIT", skeletonClassName: "w-[120px]" },
  { key: "estado", header: "Estado", skeletonClassName: "w-[80px]" },
]

export type StockMovementRow = {
  fecha: string
  producto: string
  tipo: string
  cantidad: string
  deposito: string
}

export const STOCK_MOVEMENTS_COLUMNS: CatalogColumn<StockMovementRow>[] = [
  { key: "fecha", header: "Fecha", skeletonClassName: "w-[90px]" },
  { key: "producto", header: "Producto", skeletonClassName: "w-[180px]" },
  { key: "tipo", header: "Tipo", skeletonClassName: "w-[80px]" },
  { key: "cantidad", header: "Cantidad", skeletonClassName: "w-[70px]" },
  { key: "deposito", header: "Depósito", skeletonClassName: "w-[100px]" },
]
