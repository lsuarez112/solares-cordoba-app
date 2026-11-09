import { redirect } from "react-router"

/** /config no tiene página propia: lleva a Configuración general. */
export function loader() {
  return redirect("/config/general")
}

export default function ConfigIndexRoute() {
  return null
}
