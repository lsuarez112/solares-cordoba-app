/* =====================================================================
   Datos de ejemplo y utilidades. Hay una sola tienda real (Córdoba); los otros tres
   vendedores son inventados y embeben la misma tienda hasta tener las suyas.
   En la versión real todo esto sale de la API (ver critica.md, sección 3).
   ===================================================================== */
const TIENDA = "https://pedix.app/colchones-y-hogar-cordoba";
const ADMIN = "https://admin.pedix.app";

// Quién usa el gestor. YO es la persona que tiene la sesión abierta en la maqueta.
const ROLES = [["admin", "Administrador", "Configura, da de alta vendedores y usuarios."], ["operacion", "Operación", "Resuelve alertas y pedidos. No cambia la configuración."], ["lectura", "Solo lectura", "Ve todo y exporta. No resuelve ni avisa."]];
const usuarios = [
  { id: "julio", nombre: "Julio Serrano", email: "julio@colchonesyhogar.com.ar", rol: "admin", visto: 0 },
  { id: "marina", nombre: "Marina Ledesma", email: "marina@colchonesyhogar.com.ar", rol: "operacion", visto: 35 },
  { id: "tomas", nombre: "Tomás Rivas", email: "tomas@colchonesyhogar.com.ar", rol: "lectura", visto: 5760 },
];
const YO = "julio";
const usuario = id => usuarios.find(u => u.id === id);
const quien = id => id === YO ? "vos" : id === "sistema" ? "el sistema" : usuario(id)?.nombre.split(" ")[0] ?? id;

const minutoActual = new Date().getHours() * 60 + new Date().getMinutes();
const CORTE_VM = 1120;   // Villa María dejó de leerse ayer a las 18:40

const vendedores = [
  { id: "cordoba", nombre: "Colchones y Hogar Córdoba", zona: "Córdoba Capital", conexion: "ok", lecturaMin: 4, contacto: "Andrea Bustos", telefono: "5493515550142", ultimoNumero: 1042, cancela: 0.05, n: { hoy: 7, d7: 46, d30: 188, previos: 171 } },
  { id: "carlos-paz", nombre: "Descanso Carlos Paz", zona: "Villa Carlos Paz", conexion: "ok", lecturaMin: 4, contacto: "Raúl Ferreyra", telefono: "5493541555087", ultimoNumero: 388, cancela: 0.06, n: { hoy: 4, d7: 27, d30: 121, previos: 128 } },
  { id: "rio-cuarto", nombre: "Sueños del Sur", zona: "Río Cuarto", conexion: "ok", lecturaMin: 6, contacto: "Paula Giménez", telefono: "5493585550311", ultimoNumero: 311, cancela: 0.04, n: { hoy: 2, d7: 19, d30: 84, previos: 70 } },
  { id: "villa-maria", nombre: "Casa Villa María", zona: "Villa María", conexion: "error", ultimaLectura: "ayer a las 18:40", lecturaMin: minutoActual + 1440 - CORTE_VM, contacto: "Hugo Maldonado", telefono: "5493535550976", ultimoNumero: 197, cancela: 0.13, n: { hoy: 0, d7: 8, d30: 52, previos: 61 } },
].map((v, i) => ({ ...v, serie: i + 1, tienda: TIENDA, admin: ADMIN }));   // serie = su color en los gráficos

// Pedidos de ejemplo: 60 días por vendedor, generados con una semilla fija para que la maqueta
// muestre siempre lo mismo. `n` fija cuántos caen hoy, en 7 días, en 30 y en los 30 anteriores.
const CATALOGO = [
  ["COL-140", "Colchón Resortes Premium 140×190", 489900], ["COL-160", "Colchón Espuma Alta Densidad 160×200", 612000],
  ["SOM-140", "Sommier Clásico 140×190", 318400], ["RES-140", "Respaldo tapizado 140", 172100],
  ["SAB-QUE", "Juego de sábanas Queen 400 hilos", 96000], ["PRO-IMP", "Protector impermeable 140×190", 42000], ["ALM-VIS", "Almohada Viscoelástica", 38500],
];
const NOMBRES = ["Lucía", "Martín", "Sofía", "Diego", "Valentina", "Nicolás", "Camila", "Federico", "Julieta", "Matías", "Carolina", "Gustavo"];
const APELLIDOS = ["Gómez", "Fernández", "López", "Díaz", "Pereyra", "Romero", "Sosa", "Álvarez", "Torres", "Ruiz", "Acosta", "Molina"];
const generador = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const azar = generador(20261116);
const entre = (a, b) => a + Math.floor(azar() * (b - a + 1));
const uno = lista => lista[Math.floor(azar() * lista.length)];

const pedidos = vendedores.flatMap(v => {
  const diasAtras = [...Array(v.n.hoy).fill(0),
    ...Array.from({ length: v.n.d7 - v.n.hoy }, () => entre(1, 6)),
    ...Array.from({ length: v.n.d30 - v.n.d7 }, () => entre(7, 29)),
    ...Array.from({ length: v.n.previos }, () => entre(30, 59))];
  return diasAtras.map(dia => {
    const disponibles = [...CATALOGO];
    const items = Array.from({ length: uno([1, 1, 1, 2, 2, 3]) }, () => {
      const [sku, nombre, precio] = disponibles.splice(Math.floor(azar() * disponibles.length), 1)[0];
      return { sku, nombre, precio, cantidad: precio < 100000 && azar() < 0.4 ? 2 : 1 };
    });
    const r = azar();
    let minuto = dia > 0 ? entre(540, 1260) : minutoActual > 560 ? entre(540, minutoActual - 5) : entre(0, minutoActual);
    // Una tienda sin conexión no puede tener pedidos posteriores a su última lectura
    if (v.conexion !== "ok" && dia === 1 && minuto > CORTE_VM) minuto = 2 * CORTE_VM - minuto;
    return {
      vendedor: v.id, dia, items, minuto,
      cliente: uno(NOMBRES) + " " + uno(APELLIDOS),
      entrega: uno(["Envío a domicilio", "Envío a domicilio", "Retiro en local"]),
      total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
      estado: dia === 0 ? (r < 0.55 ? "Pendiente" : "Confirmado")
        : r < v.cancela ? "Cancelado"
        : dia <= 2 ? (r < 0.2 ? "Pendiente" : r < 0.65 ? "Confirmado" : "Entregado") : "Entregado",
    };
  }).sort((a, b) => a.dia - b.dia || b.minuto - a.minuto).map((p, i) => ({ ...p, numero: "#" + String(v.ultimoNumero - i).padStart(4, "0") }));
}).sort((a, b) => a.dia - b.dia || b.minuto - a.minuto);

// Datos de contacto y pago: salen de otro generador para no alterar los pedidos de arriba.
const azar2 = generador(77), uno2 = lista => lista[Math.floor(azar2() * lista.length)];
const CALLES = ["Av. Colón", "Bv. San Juan", "Av. Sabattini", "Belgrano", "Rivadavia", "9 de Julio", "Av. Vélez Sarsfield", "San Martín", "Obispo Trejo", "Av. Libertador"];
pedidos.forEach((p, i) => {
  p.i = i;
  p.telefono = "549351" + String(5000000 + Math.floor(azar2() * 4999999));
  p.direccion = p.entrega === "Retiro en local" ? null : `${uno2(CALLES)} ${100 + Math.floor(azar2() * 4800)}, ${vendedores.find(v => v.id === p.vendedor).zona}`;
  p.pago = uno2(["Transferencia", "Transferencia", "Mercado Pago", "Tarjeta de crédito", "Efectivo al recibir"]);
});
// Un pedido que ya tomó otra persona, para mostrar el estado
const pedidoTomado = pedidos.find(p => p.estado === "Pendiente" && p.dia === 1 && p.vendedor === "cordoba");
if (pedidoTomado) pedidoTomado.tomado = "marina";

// Indicadores: todo sale de la lista de pedidos. Las ventas no cuentan los pedidos cancelados.
const RANGOS = { hoy: [0, 1], d7: [0, 7], d30: [0, 30] };
const PERIODOS = { hoy: "Hoy", d7: "7 días", d30: "30 días" };
const PREVIO = { hoy: "ayer", d7: "los 7 días previos", d30: "los 30 días previos" };
function resumen(lista) {
  const validos = lista.filter(p => p.estado !== "Cancelado"), ventas = validos.reduce((s, p) => s + p.total, 0);
  return { pedidos: lista.length, ventas, ticket: validos.length ? ventas / validos.length : 0,
    cancelados: lista.length - validos.length,
    cancelacion: lista.length ? (lista.length - validos.length) / lista.length * 100 : 0,
    pendientes: lista.filter(p => p.estado === "Pendiente").length };
}
// Resumen de un vendedor (o de todos si v es null) en un período, o en el período anterior equivalente.
function stats(v, per, anterior = false) {
  let [a, b] = RANGOS[per];
  if (anterior) [a, b] = [b, b + (b - a)];
  return resumen(pedidos.filter(p => (!v || p.vendedor === v.id) && p.dia >= a && p.dia < b));
}
const pedidosDe = id => pedidos.filter(p => p.vendedor === id);
const pendientes = () => pedidos.filter(p => p.estado === "Pendiente");
// Minutos que lleva esperando un pedido por confirmar: es el dato que ordena la cola de trabajo.
const espera = p => Math.max(1, p.dia * 1440 + minutoActual - p.minuto);

// Una alerta = un producto de un vendedor que no coincide con la master, con el detalle campo por campo.
// `horas` es hace cuánto se detectó; `pct` la diferencia de precio, para aplicar la tolerancia.
// Estados: aviso (a quién y cuándo se le avisó), tomada (quién la está resolviendo), reabierta, resuelta.
// Cada campo puede estar ignorado (hasta que cambie el valor) o pospuesto (días que faltan).
const d = (campo, master, vendedor, pct) => ({ campo, master, vendedor, pct });
const alertas = [
  { vendedor: "carlos-paz", sku: "COL-140", producto: "Colchón Resortes Premium 140×190", horas: 0.6, campos: [
      d("Precio", "$ 489.900", "$ 459.900", -6.1), d("Precio de oferta", "$ 439.900", "Sin oferta")] },
  { vendedor: "carlos-paz", sku: "ALM-VIS", producto: "Almohada Viscoelástica", horas: 5, campos: [
      d("Descripción", "Espuma viscoelástica de 50 kg/m³, funda lavable con cierre. Garantía 2 años.", "Espuma viscoelástica, funda lavable. Garantía 1 año.")] },
  { vendedor: "carlos-paz", sku: "SAB-QUE", producto: "Juego de sábanas Queen 400 hilos", horas: 21, aviso: { min: 1200, quien: "marina" }, campos: [
      d("Disponibilidad", "Disponible", "Sin stock")] },
  { vendedor: "rio-cuarto", sku: "SOM-140", producto: "Sommier Clásico 140×190", horas: 72, tomada: "marina", campos: [
      d("Imagen principal", "sommier-140-v2.jpg", "sommier-140.jpg")] },
  { vendedor: "rio-cuarto", sku: "SAB-QUE", producto: "Juego de sábanas Queen 400 hilos", horas: 7, campos: [
      d("Precio", "$ 96.000", "$ 94.900", -1.1)] },   // queda por debajo de la tolerancia inicial (2 %)
  { vendedor: "villa-maria", sku: "COL-140", producto: "Colchón Resortes Premium 140×190", horas: 50, aviso: { min: 2900, quien: "julio" }, campos: [
      d("Precio", "$ 489.900", "$ 429.900", -12.2)] },
  { vendedor: "villa-maria", sku: "COL-160", producto: "Colchón Espuma Alta Densidad 160×200", horas: 120, campos: [
      d("Nombre", "Colchón Espuma Alta Densidad 160×200", "Colchon espuma 160x200"), d("Categoría", "Colchones › Espuma", "Ofertas")] },
  { vendedor: "villa-maria", sku: "ALM-VIS", producto: "Almohada Viscoelástica", horas: 52, reabierta: true, campos: [
      d("Precio", "$ 38.500", "$ 35.000", -9.1), d("Variantes", "Estándar, Cervical", "Estándar")] },
  { vendedor: "villa-maria", sku: "PRO-IMP", producto: "Protector impermeable 140×190", horas: 74, campos: [
      d("Producto faltante", "Publicado", "No está en su catálogo")] },
  { vendedor: "villa-maria", sku: "SOM-140", producto: "Sommier Clásico 140×190", horas: 144, campos: [
      d("Disponibilidad", "Disponible", "Sin stock"), d("Imagen principal", "sommier-140-v2.jpg", "sommier-140.jpg")] },
];

// Qué se compara. El grupo ordena las alertas: lo que le cuesta plata al cliente va primero.
const CAMPOS = [
  ["Precio", "El precio de lista es distinto al de la master.", 1],
  ["Precio de oferta", "Falta la oferta de la master o tiene otro valor.", 1],
  ["Disponibilidad", "El producto figura sin stock o disponible al revés que en la master.", 1],
  ["Producto faltante", "Un producto publicado en la master no está en el catálogo del vendedor.", 1],
  ["Nombre", "El nombre del producto no coincide.", 2],
  ["Categoría", "El producto está en otra categoría.", 2],
  ["Variantes", "Faltan o sobran variantes (medidas, modelos).", 2],
  ["Imagen principal", "La foto principal no es la de la master.", 3],
  ["Descripción", "El texto del producto no coincide.", 3],
];
const GRUPOS = { 1: "Precio y stock", 2: "Nombre y categoría", 3: "Imagen y descripción" };
const GRUPO_DE = Object.fromEntries(CAMPOS.map(([c, , g]) => [c, g]));

const cfg = {
  campos: Object.fromEntries(CAMPOS.map(([c]) => [c, true])),
  tolerancia: 2, releer: "60", vigencia: "master", posponerDias: 7, horasSinConexion: 6,
  umbralEspera: 2,                                   // horas: pasado esto, un pedido por confirmar se resalta y se avisa
  avisoPedidos: true, avisoConexion: true, canal: "whatsapp", destino: "julio",
  resumenEmail: true, email: "julio@colchonesyhogar.com.ar",
  plantilla: "Hola, {contacto}. Encontramos diferencias entre tu tienda y el catálogo master:\n\n{diferencias}\n\n¿Podés corregirlo desde tu admin de Pedix? Gracias.",
  plantillaPedido: "Hola, {contacto}. El pedido {pedido} de {cliente} ({total}) espera confirmación desde hace {espera}. ¿Podés confirmarlo desde tu admin de Pedix? Gracias.",
};

// Auditoría: quién hizo qué y cuándo. Cada acción de la maqueta agrega un renglón.
const actividad = [
  [35, "marina", "Tomó la alerta de Sommier Clásico 140×190", "rio-cuarto"],
  [1200, "marina", "Avisó por WhatsApp: Juego de sábanas Queen 400 hilos", "carlos-paz"],
  [minutoActual + 1440 - CORTE_VM - cfg.horasSinConexion * 60, "sistema", "La tienda quedó marcada sin conexión", "villa-maria"],
  [2900, "julio", "Avisó por WhatsApp: Colchón Resortes Premium 140×190", "villa-maria"],
  [4400, "julio", "Cambió la tolerancia de precio de 1 % a 2 %", null],
  [5760, "tomas", "Exportó el reporte Ventas por vendedor", null],
  [7300, "sistema", "Se resolvió sola al releer: Respaldo tapizado 140 (Categoría)", "cordoba"],
  [8700, "julio", "Ignoró hasta que cambie: Descripción de Almohada Viscoelástica", "rio-cuarto"],
].filter(([min]) => min > 0).map(([min, quienFue, texto, vend]) => ({ t: Date.now() - min * 6e4, quien: quienFue, texto, vendedor: vend }));
const registrar = (texto, vend = null) => actividad.unshift({ t: Date.now(), quien: YO, texto, vendedor: vend });

/* ============================ Utilidades ============================ */
const $ = id => document.getElementById(id);
// Todo dato que viene de fuera (Pedix, lo que escribe el usuario) pasa por esc() antes de entrar al HTML,
// para que un nombre o una descripción con etiquetas no pueda ejecutar código. Los enlaces, además, solo http(s).
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ESCAPES[c]);
const enlace = (u, siNo = "#") => /^https?:\/\//i.test(u) ? esc(u) : siNo;
const icono = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const plural = (n, uno, muchos) => `${n} ${n === 1 ? uno : muchos}`;
// Importes: una sola regla. Completo en indicadores y tablas; compacto solo dentro de los gráficos.
const pesos = n => "$ " + Math.round(n).toLocaleString("es-AR");
const COMPACTO = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 });
const pesosCorto = n => "$ " + COMPACTO.format(n);
const porcentaje = n => n.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " %";
// Variación frente al período anterior: la flecha lleva el color, el número queda en tinta normal.
// `bajarEsBueno` invierte el color (cancelados): la flecha sigue diciendo hacia dónde fue el número.
const variacion = (actual, anterior, bajarEsBueno = false) => {
  if (!anterior) return '<span class="var">Sin datos previos</span>';
  const x = (actual - anterior) / anterior * 100, sube = x >= 0, bueno = Math.abs(x) < 0.05 ? null : sube !== bajarEsBueno;
  return `<span class="var"><i class="${bueno === null ? "" : bueno ? "sube" : "baja"}" aria-hidden="true">${sube ? "▲" : "▼"}</i><span class="sr">${sube ? "Subió" : "Bajó"}</span> ${porcentaje(Math.abs(x))}</span>`;
};
const dosCifras = n => String(n).padStart(2, "0");
const horaDe = p => dosCifras(Math.floor(p.minuto / 60)) + ":" + dosCifras(p.minuto % 60);
const fecha = p => (p.dia === 0 ? "Hoy" : p.dia === 1 ? "Ayer" : new Date(Date.now() - p.dia * 864e5).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })) + ", " + horaDe(p);
const hace = m => m < 1 ? "recién" : m < 60 ? `hace ${Math.round(m)} min` : m < 1440 ? `hace ${Math.floor(m / 60)} h` : `hace ${plural(Math.floor(m / 1440), "día", "días")}`;
const duracion = m => m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${Math.floor(m / 60)} h${m < 600 && m % 60 >= 1 ? " " + Math.floor(m % 60) + " min" : ""}` : `${Math.floor(m / 1440)} d${Math.floor(m % 1440 / 60) ? " " + Math.floor(m % 1440 / 60) + " h" : ""}`;
const vendedor = id => vendedores.find(v => v.id === id);
const iniciales = n => n.split(" ").filter(p => p.length > 2).slice(0, 2).map(p => p[0]).join("").toUpperCase();
const sinConexion = () => vendedores.filter(v => v.conexion !== "ok");

// Enlaces directos al admin de Pedix: el valor del gestor es dejarte en el lugar exacto.
// PENDIENTE: confirmar con Pedix el formato real de estas rutas antes de implementarlas.
const linkProducto = (v, sku) => `${v.admin}/productos?buscar=${encodeURIComponent(sku)}`;
const linkPedido = (v, p) => `${v.admin}/pedidos/${encodeURIComponent(p.numero.replace("#", ""))}`;
const whatsapp = (telefono, texto) => `https://wa.me/${encodeURIComponent(telefono)}?text=${encodeURIComponent(texto)}`;

// Un campo cuenta si la configuración lo compara y, si es de precio, supera la tolerancia.
const cuenta = c => cfg.campos[c.campo] && !(c.pct != null && Math.abs(c.pct) < cfg.tolerancia);
const silenciado = c => c.ignorado || c.pospuesto > 0;
const activos = a => a.resuelta ? [] : a.campos.filter(cuenta);
const sinResolver = a => activos(a).filter(c => !silenciado(c));
const abiertas = () => alertas.filter(a => sinResolver(a).length);
const alertasDe = id => abiertas().filter(a => a.vendedor === id);
const gravedad = a => Math.min(...sinResolver(a).map(c => GRUPO_DE[c.campo]), 9);   // 1 = precio y stock

// Diferencia palabra por palabra entre dos textos largos: lo que falta va tachado y lo agregado, resaltado.
function difPalabras(master, otro) {
  const a = master.split(/\s+/), b = otro.split(/\s+/), n = a.length, m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  if (t[0][0] < 2) return null;                                  // casi nada en común: no vale la pena marcarlo
  const partes = [];
  const sumar = (tipo, palabra) => { const u = partes.at(-1); u && u[0] === tipo ? u[1].push(palabra) : partes.push([tipo, [palabra]]); };
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { sumar("", a[i]); i++; j++; }
    else if (i < n && (j >= m || t[i + 1][j] >= t[i][j + 1])) sumar("del", a[i++]);
    else sumar("ins", b[j++]);
  }
  return partes.map(([tipo, palabras]) => tipo ? `<${tipo}>${esc(palabras.join(" "))}</${tipo}>` : esc(palabras.join(" "))).join(" ");
}
