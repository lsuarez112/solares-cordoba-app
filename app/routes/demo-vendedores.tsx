import { redirect } from "react-router"

/**
 * Demo estática del gestor de vendedores (HTML/CSS/JS plano en public/demo-vendedores).
 * Esta ruta solo lleva /demo-vendedores al archivo: no pasa por los layouts ni por la sesión.
 */
export function loader() {
  return redirect("/demo-vendedores/index.html")
}
