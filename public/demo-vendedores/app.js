/* =====================================================================
   Gestor de vendedores: vistas y acciones. Los datos y utilidades están en datos.js.
   Cada vista es una función que devuelve HTML; pintar() arma la página según la ruta.
   ===================================================================== */

/* ============================ Estado de pantalla ============================ */
// El período es uno solo para toda la app: lo que se elige en Reportes vale en Pedidos, Vendedores y la ficha.
let periodo = "d7", lecturaMin = 4;
const al = { vista: "vendedor", vendedor: "todos", tipo: "todos", estado: "abiertas", cerrados: null };
const pf = { vendedor: "todos", estado: "todos", orden: "recientes", q: "", pagina: 1, porPagina: 10, mostrados: 10 };
const telefono = matchMedia("(max-width: 36em)");
const MOTIVO_CAIDA = "Pedix rechazó la clave de lectura";

/* ============================ Piezas compartidas ============================ */
// Identidad de cada vendedor: color y logo. En la maqueta se guardan en este navegador.
const PALETA = ["#3987e5", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#0ca30c", "#9085e9", "#e34948"];
const colorDe = v => v.color || `var(--serie-${v.serie})`;
const colorPaleta = v => v.color || PALETA[v.serie - 1];          // el color de serie equivale a esa tinta de la paleta
const avatar = (v, clase = "") => `<span class="avatar ${clase}" style="--c:${colorDe(v)}">${v.logo ? `<img src="${v.logo}" alt="">` : esc(iniciales(v.nombre))}</span>`;
const punto = v => `<i class="punto serie" style="background:${colorDe(v)}"></i>`;
try {
  const guardados = JSON.parse(localStorage.getItem("demo-vendedores:vendedores") || "{}");
  vendedores.forEach(v => {
    const g = guardados[v.id] || {};
    if (/^#[0-9a-f]{6}$/i.test(g.color)) v.color = g.color;
    if (String(g.logo).startsWith("data:image/png;base64,")) v.logo = g.logo;
  });
} catch {}
function personalizar(id, cambios) {
  Object.assign(vendedor(id), cambios);
  try { localStorage.setItem("demo-vendedores:vendedores", JSON.stringify(Object.fromEntries(vendedores.map(v => [v.id, { color: v.color || null, logo: v.logo || null }])))); }
  catch { avisar("No se pudo guardar en este navegador"); }
}

const badgeConexion = v => v.conexion === "ok" ? '<span class="badge"><span class="punto"></span>Conectada</span>' : `<span class="badge destructive">${icono("aviso")}Sin conexión</span>`;
const badgeCatalogo = n => n === 0 ? '<span class="badge"><span class="punto"></span>Catálogo al día</span>' : `<span class="badge warning">${plural(n, "desincronizado", "desincronizados")}</span>`;
const ESTADOS = ["Pendiente", "Confirmado", "Entregado", "Cancelado"];
const badgeEstado = e => e === "Cancelado" ? '<span class="badge secondary">Cancelado</span>'
  : `<span class="badge"><span class="punto ${{ Pendiente: "ambar", Confirmado: "gris", Entregado: "" }[e]}"></span>${e === "Pendiente" ? "Por confirmar" : esc(e)}</span>`;
const tarde = p => espera(p) >= cfg.umbralEspera * 60;
const chipEspera = p => `<span class="espera${tarde(p) ? " tarde" : ""}" data-tip="Espera confirmación desde ${esc(fecha(p).toLowerCase())}${tarde(p) ? `\nPasó el límite de ${cfg.umbralEspera} h` : ""}">${icono("reloj")}${duracion(espera(p))}</span>`;
const tabs = (rotulo, dato, opciones, actual, clase = "") => `<div class="tabs ${clase}" role="group" aria-label="${rotulo}">
  ${opciones.map(([k, t]) => `<button type="button" data-${dato}="${k}" aria-pressed="${k === actual}">${t}</button>`).join("")}</div>`;
const selectorPeriodo = (clase = "push") => tabs("Período", "periodo", Object.entries(PERIODOS), periodo, clase);
const vacio = (titulo, texto) => `<div class="vacio">${icono("ok")}<b>${titulo}</b><span class="t-secundario">${texto}</span></div>`;
const tel = t => "+" + String(t).replace(/^(\d{2})(\d)(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4-$5");
// Un dato que no se pudo leer se muestra como guion, nunca como cero.
const oGuion = (v, valor) => v.conexion === "ok" ? valor : `<span class="sin-dato" data-tip="Sin datos desde ${esc(v.ultimaLectura)}">—</span>`;

// Aviso en línea cuando los totales de la página no incluyen a una tienda sin conexión.
function notaSinDatos() {
  const caidos = sinConexion();
  if (!caidos.length) return "";
  return `<div class="aviso warning">${icono("aviso")}<div><b>Los totales no incluyen todo</b>${caidos.map(v => `${esc(v.nombre)} está sin conexión desde ${esc(v.ultimaLectura)}: lo que haya vendido después no figura acá.`).join(" ")}</div></div>`;
}

// Línea mínima con la evolución de un vendedor: una sola serie, sin ejes, con el último punto marcado.
function spark(valores, color, rotulo) {
  const max = Math.max(...valores, 1), n = valores.length, x = k => 2 + k * (116 / (n - 1)), y = v => 26 - v / max * 22;
  return `<svg class="spark" viewBox="0 0 120 30" preserveAspectRatio="none" role="img" aria-label="${esc(rotulo)}" data-tip="${esc(rotulo)}">
    <polyline points="${valores.map((v, k) => `${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}" style="stroke:${color}"/>
    <circle cx="${x(n - 1)}" cy="${y(valores[n - 1]).toFixed(1)}" r="2.500" style="fill:${color}"/></svg>`;
}

let reloj;
// Aviso flotante. Si la acción se puede revertir, lleva "Deshacer" (también queda disponible en la pantalla).
function avisar(texto, deshacer) {
  const t = $("toast"), ocultar = () => t.replaceChildren();
  t.innerHTML = `<span>${esc(texto)}</span>${deshacer ? '<button class="btn link" type="button">Deshacer</button>' : ""}`;
  if (deshacer) t.querySelector("button").onclick = () => { deshacer(); pintar(); avisar("Listo, quedó como estaba"); };
  const programar = () => { clearTimeout(reloj); reloj = setTimeout(ocultar, deshacer ? 7000 : 3500); };
  t.onpointerenter = t.onfocusin = () => clearTimeout(reloj);   // no se va mientras se lo está usando
  t.onpointerleave = t.onfocusout = programar;
  programar();
}

/* ============================ Hoy ============================ */
// La entrada de la app: qué hay que hacer ahora. Tres colas, cada una con su acción directa.
function vistaHoy() {
  const pend = pendientes().sort((a, b) => espera(b) - espera(a)), demorados = pend.filter(tarde);
  const caidos = sinConexion(), criticas = abiertas().filter(a => gravedad(a) === 1);
  const porProducto = Object.values(Object.groupBy(criticas, a => a.sku)).sort((x, y) => y.length - x.length);
  const frase = [
    demorados.length && `${plural(demorados.length, "pedido espera", "pedidos esperan")} hace más de ${cfg.umbralEspera} h`,
    caidos.length && plural(caidos.length, "tienda sin conexión", "tiendas sin conexión"),
    criticas.length && `${plural(criticas.length, "producto", "productos")} con precio o stock distinto`,
  ].filter(Boolean);
  // Cada cola tiene alto fijo y su lista se desplaza adentro: la página no crece con la cantidad de pendientes.
  const cola = (titulo, n, cuerpo, pie = "", clase = "") => `<section class="cola ${clase}"><header><h2>${titulo}</h2>${n ? `<span class="badge cuenta secondary">${n}</span>` : ""}</header>
    <div class="cola-cuerpo" tabindex="0" role="region" aria-label="${titulo}">${cuerpo}</div>${pie}</section>`;

  const colaPedidos = cola("Pedidos por confirmar", pend.length,
    pend.length ? `<ul class="cola-lista">${pend.map(p => { const v = vendedor(p.vendedor); return `<li><button class="cola-item" type="button" data-pedido="${p.i}">
        ${chipEspera(p)}
        <span class="ci-cuerpo"><b><span class="t-dato">${esc(p.numero)}</span> ${esc(p.cliente)}</b>
          <span class="t-secundario">${punto(v)}${esc(v.nombre)}${p.tomado ? ` · ${p.tomado === YO ? "lo tomaste vos" : "lo tomó " + esc(quien(p.tomado))}` : ""}${v.conexion === "ok" ? "" : " · dato de " + esc(v.ultimaLectura)}</span></span>
        <span class="t-num">${pesos(p.total)}</span></button></li>`; }).join("")}</ul>`
      : vacio("Nada esperando", "Todos los pedidos están confirmados."),
    pend.length ? `<footer><button class="btn outline sm" type="button" data-accion="ver-pendientes">Abrir en Pedidos</button></footer>` : "", "principal");

  const colaTiendas = cola("Tiendas sin conexión", caidos.length,
    caidos.length ? `<ul class="cola-lista">${caidos.map(v => `<li class="cola-item fija">${avatar(v)}
        <span class="ci-cuerpo"><b>${esc(v.nombre)}</b><span class="t-secundario">Sin datos desde ${esc(v.ultimaLectura)}. ${MOTIVO_CAIDA}.</span>
          <span class="muestra" style="gap:6px;margin-top:6px"><button class="btn outline sm" type="button" data-accion="probar" data-v="${esc(v.id)}">Probar conexión</button>
            <a class="btn ghost sm" href="${whatsapp(v.telefono, `Hola, ${v.contacto.split(" ")[0]}. Desde ${v.ultimaLectura} no podemos leer tu tienda de Pedix. ¿Podés pasarnos una clave de lectura nueva?`)}" target="_blank" rel="noopener">${icono("mensaje")}Pedir clave nueva</a>
            <a class="btn ghost sm" href="#vendedor/${esc(v.id)}">Ver ficha</a></span></span></li>`).join("")}</ul>`
      : `<p class="cola-ok">${icono("ok")}Las ${vendedores.length} tiendas se leen bien.</p>`, "", "tiendas");

  const colaPrecios = cola("Precio y stock desalineados", criticas.length,
    criticas.length ? `<ul class="cola-lista">${porProducto.map(grupo => { const a = grupo[0]; return `<li><button class="cola-item" type="button" data-accion="ver-producto" data-sku="${esc(a.sku)}">
        <span class="ci-cuerpo"><b>${esc(a.producto)} <span class="t-dato t-secundario">${esc(a.sku)}</span></b>
          <span class="t-secundario">${grupo.map(x => `${esc(vendedor(x.vendedor).nombre)}: ${sinResolver(x).filter(c => GRUPO_DE[c.campo] === 1).map(c => esc(c.campo.toLowerCase()) + (c.pct != null ? " " + String(c.pct).replace("-", "−").replace(".", ",") + " %" : "")).join(", ")}`).join(" · ")}</span></span>
        ${grupo.length > 1 ? `<span class="badge warning">${grupo.length} vendedores</span>` : ""}${icono("ir")}</button></li>`; }).join("")}</ul>`
      : `<p class="cola-ok">${icono("ok")}Precios y stock coinciden con la master.</p>`,
    abiertas().length ? `<footer><a class="btn outline sm" href="#alertas">Ver las ${abiertas().length} alertas</a></footer>` : "");

  return `<div class="cabecera"><div><h1 class="t-pagina">Hoy</h1>
      <p class="t-secundario">${mayuscula(new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }))} · ${frase.length ? frase.join(", ") + "." : "No hay nada urgente."}</p></div></div>
    <div class="colas">${colaPedidos}<div class="colas-lado">${colaTiendas}${colaPrecios}</div></div>
    <section class="bloque" aria-labelledby="hoy-tabla">
      <div class="cabecera" style="align-items:center"><h2 class="t-seccion" id="hoy-tabla">El día por tienda</h2>
        <input class="input push" id="buscar-tienda" style="width:240px" type="search" placeholder="Buscar tienda o zona" aria-label="Buscar tienda" value="${esc(tablaHoy.q)}"></div>
      <div class="tabla" tabindex="0" role="region" aria-labelledby="hoy-tabla"><table class="apilable" id="tabla-hoy">
        <thead><tr>${[["Vendedor", "texto"], ["Pedidos hoy", "numero"], ["Ventas hoy", "numero"], ["Por confirmar", "numero"], ["Espera más larga", "numero"], ["Última lectura", "numero"]]
          .map(([t, tipo], k) => `<th scope="col" data-type="${tipo}"${k ? ' class="num"' : ""}><button type="button" class="th-orden">${t}</button></th>`).join("")}</tr></thead>
        <tbody>${vendedores.map(v => { const s = stats(v, "hoy"), suyos = pend.filter(p => p.vendedor === v.id), ok = v.conexion === "ok"; return `<tr class="${ok ? "" : "fila-caida"}" data-busca="${esc((v.nombre + " " + v.zona).toLowerCase())}">
          <td data-value="${esc(v.nombre)}">${punto(v)} <a class="btn link sin-raya" href="#vendedor/${esc(v.id)}">${esc(v.nombre)}</a></td>
          <td class="num" data-value="${ok ? s.pedidos : -1}">${oGuion(v, s.pedidos)}</td><td class="num" data-value="${ok ? s.ventas : -1}">${oGuion(v, pesos(s.ventas))}</td>
          <td class="num" data-value="${suyos.length}">${suyos.length}${ok ? "" : ' <span class="t-secundario">al cierre</span>'}</td>
          <td class="num" data-value="${suyos.length ? espera(suyos[0]) : 0}">${suyos.length ? chipEspera(suyos[0]) : "—"}</td>
          <td class="num" data-value="${v.lecturaMin}">${ok ? hace(v.lecturaMin) : `<span class="t-destructivo">${hace(v.lecturaMin)}</span>`}</td></tr>`; }).join("")}</tbody>
      </table></div>
      <p class="sr" role="status" id="tabla-hoy-estado"></p>
      <p class="t-secundario">Un guion significa que el dato no se pudo leer; no es un cero.</p></section>`;
}

// Tabla "El día por tienda": buscar y ordenar sin rehacer la tabla (se mueven y se ocultan las filas que ya existen).
const tablaHoy = { q: "", col: -1, dir: "ascending" };
const comparador = new Intl.Collator("es", { numeric: true, sensitivity: "base" });
function aplicarTablaHoy(anunciar = false) {
  const tabla = $("tabla-hoy");
  if (!tabla) return;
  const cuerpo = tabla.tBodies[0], cabezas = [...tabla.tHead.rows[0].cells], q = tablaHoy.q.trim().toLowerCase();
  cabezas.forEach((th, k) => k === tablaHoy.col ? th.setAttribute("aria-sort", tablaHoy.dir) : th.removeAttribute("aria-sort"));
  if (tablaHoy.col >= 0) {
    const numero = cabezas[tablaHoy.col].dataset.type === "numero", signo = tablaHoy.dir === "ascending" ? 1 : -1, valor = tr => tr.cells[tablaHoy.col].dataset.value;
    [...cuerpo.rows].sort((a, b) => signo * (numero ? valor(a) - valor(b) : comparador.compare(valor(a), valor(b))))
      .forEach(tr => cuerpo.moveBefore ? cuerpo.moveBefore(tr, null) : cuerpo.append(tr));
  }
  let visibles = 0;
  for (const tr of cuerpo.rows) { tr.hidden = !!q && !tr.dataset.busca.includes(q); visibles += !tr.hidden; }
  if (anunciar) $("tabla-hoy-estado").textContent = `${plural(visibles, "tienda", "tiendas")}${tablaHoy.col >= 0 ? `, por ${cabezas[tablaHoy.col].textContent.trim().toLowerCase()}, ${tablaHoy.dir === "ascending" ? "de menor a mayor" : "de mayor a menor"}` : ""}`;
}

/* ============================ Alertas ============================ */
const coincide = c => (al.estado === "abiertas") === !silenciado(c) && (al.tipo === "todos" || GRUPO_DE[c.campo] === +al.tipo);
const camposVista = a => activos(a).filter(coincide).sort((x, y) => GRUPO_DE[x.campo] - GRUPO_DE[y.campo]);
const fechaEn = dias => masDias(HOY, dias).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

function filaCampo(a, c) {
  const i = alertas.indexOf(a), j = a.campos.indexOf(c), sil = silenciado(c), g = GRUPO_DE[c.campo];
  const largo = Math.max(c.master.length, c.vendedor.length) >= 30, dif = largo && !sil ? difPalabras(c.master, c.vendedor) : null;
  const tipo = largo ? "" : "t-dato", ap = sil ? " apagado" : "";
  return `<div class="fila"><div class="nombre${ap}"><span class="badge tipo t${g}">${esc(c.campo)}</span><span class="sr"> (${GRUPOS[g]})</span></div>
    <div class="${tipo}${ap}" data-rotulo="Master">${esc(c.master)}</div>
    <div class="${tipo}${ap}" data-rotulo="Vendedor">${dif ? `<span class="difp">${dif}</span>` : `<mark>${esc(c.vendedor)}</mark>`}${c.pct != null && !sil ? `<span class="pct">${String(c.pct).replace("-", "−").replace(".", ",")} %</span>` : ""}</div>
    <div class="accion">${sil
      ? `<span class="t-secundario">${c.ignorado ? "Ignorado hasta que cambie" : `Pospuesto hasta el ${fechaEn(c.pospuesto)}`}</span><button class="btn ghost sm tono-ambar" type="button" data-accion="alertar" data-a="${i}" data-c="${j}">${icono("alerta")}Volver a alertar</button>`
      : `<button class="btn ghost sm tono-rojo" type="button" popovertarget="mi-${i}-${j}">${icono("ojo-no")}Ignorar…</button>
        <div class="menu" popover id="mi-${i}-${j}">
          <button type="button" class="menu-op con-icono tono-rojo" data-accion="ignorar" data-a="${i}" data-c="${j}">${icono("ojo-no")}<span><b>Ignorar hasta que cambie</b><small>Vuelve a alertar si la master o el vendedor cambian este valor.</small></span></button>
          <button type="button" class="menu-op con-icono tono-ambar" data-accion="posponer" data-a="${i}" data-c="${j}">${icono("reloj")}<span><b>Posponer ${cfg.posponerDias} días</b><small>Vuelve a alertar el ${fechaEn(cfg.posponerDias)} si sigue distinto.</small></span></button>
        </div>`}</div></div>`;
}

// Una tarjeta por producto de un vendedor. En la vista por producto el título es el vendedor.
function tarjetaAlerta(a, porProducto = false) {
  const i = alertas.indexOf(a), v = vendedor(a.vendedor), campos = camposVista(a), quedan = sinResolver(a).length;
  const estados = [
    a.reabierta && `<span class="badge warning" data-tip="Ya se había corregido y volvió a aparecer">Reabierta</span>`,
    a.aviso && `<span class="badge secondary">${icono("mensaje")}Avisado ${hace(a.aviso.min)} · ${esc(quien(a.aviso.quien))}</span>`,
    a.tomada && `<span class="badge secondary">${icono("usuario")}${a.tomada === YO ? "La tomaste vos" : "La tomó " + esc(quien(a.tomada))}</span>`,
  ].filter(Boolean).join("");
  return `<article class="alerta">
    <header>
      <h3 class="t-cuerpo">${porProducto ? `${punto(v)}<a class="btn link sin-raya" href="#vendedor/${esc(v.id)}/catalogo">${esc(v.nombre)}</a>` : `${esc(a.producto)} <span class="t-dato t-secundario">${esc(a.sku)}</span>`}</h3>
      ${estados}
      <p class="t-secundario">Detectada ${hace(a.horas * 60)}${porProducto && v.conexion !== "ok" ? ` · <span class="t-destructivo">sin conexión: dato de ${esc(v.ultimaLectura)}</span>` : ""}</p>
    </header>
    <div class="dif">
      <div class="fila th"><div>Campo</div><div>En la master</div><div>En el vendedor</div><div></div></div>
      ${campos.map(c => filaCampo(a, c)).join("")}
    </div>
    ${al.estado !== "abiertas" || !quedan ? "" : `<footer>
      <a class="btn outline sm" href="${enlace(linkProducto(v, a.sku))}" target="_blank" rel="noopener">Corregir<span class="largo">en Pedix</span> ${icono("fuera")}</a>
      <button class="btn ghost sm tono-verde" type="button" data-accion="avisar" data-a="${i}">${icono("mensaje")}${a.aviso ? "Volver a avisar" : "Avisar"}</button>
      <button class="btn ghost sm push tono-azul" type="button" data-accion="tomar" data-a="${i}">${icono("usuario")}${a.tomada === YO ? "Soltar" : a.tomada ? "Tomarla yo" : "Lo tomo"}</button>
    </footer>`}
  </article>`;
}

function vistaAlertas() {
  const ab = abiertas(), afectados = new Set(ab.map(a => a.vendedor)).size;
  const visibles = alertas.filter(a => (al.vendedor === "todos" || a.vendedor === al.vendedor) && camposVista(a).length)
    .sort((x, y) => gravedad(x) - gravedad(y) || y.horas - x.horas);
  const grupos = al.vista === "vendedor"
    ? vendedores.map(v => ({ clave: "v:" + v.id, v, items: visibles.filter(a => a.vendedor === v.id) }))
    : CATALOGO.map(([sku, nombre]) => ({ clave: "p:" + sku, sku, nombre, items: visibles.filter(a => a.sku === sku) }));
  const conItems = grupos.filter(g => g.items.length).sort((x, y) => y.items.filter(a => gravedad(a) === 1).length - x.items.filter(a => gravedad(a) === 1).length || y.items.length - x.items.length);
  // Los grupos arrancan cerrados: primero se ve el panorama (quién, cuántas y de qué tipo) y se abre lo que se va a resolver.
  al.cerrados ??= new Set(conItems.map(g => g.clave));
  // Un badge de color por tipo de diferencia, con la cantidad de campos de ese tipo en el grupo
  const tipos = items => { const campos = items.flatMap(a => camposVista(a)); return `<span class="g-tipos">${Object.entries(GRUPOS).map(([g, nombre]) => { const n = campos.filter(c => GRUPO_DE[c.campo] === +g).length; return n ? `<span class="badge tipo t${g}">${n} · ${nombre}</span>` : ""; }).join("")}</span>`; };

  const grupoHtml = g => {
    const n = g.items.length, abierta = al.estado === "abiertas";
    if (g.v) {
      const v = g.v;
      return `<details class="grupo-alertas${v.conexion === "ok" ? "" : " caida"}" data-grupo="${esc(g.clave)}"${al.cerrados.has(g.clave) ? "" : " open"}>
        <summary>${avatar(v)}<span class="g-titulo"><b>${esc(v.nombre)}</b><span class="t-secundario">${plural(n, "producto", "productos")}</span>${tipos(g.items)}</span>${v.conexion === "ok" ? "" : badgeConexion(v)}</summary>
        <div class="g-cuerpo">
          ${v.conexion === "ok" ? "" : `<div class="aviso destructive">${icono("aviso")}<div><b>Sin conexión desde ${esc(v.ultimaLectura)}</b>Estas alertas pueden estar desactualizadas: quizá ya las corrigió y todavía no lo sabemos.
            <span class="muestra" style="margin-top:8px"><button class="btn outline sm" type="button" data-accion="probar" data-v="${esc(v.id)}">Probar conexión</button></span></div></div>`}
          ${abierta ? `<div class="g-acciones"><button class="btn primary sm" type="button" data-accion="avisar-vendedor" data-v="${esc(v.id)}">${icono("mensaje")}${n > 1 ? `Avisar por ${n === 2 ? "las dos" : "las " + n}` : "Avisar al vendedor"}</button>
            <a class="btn outline sm" href="${enlace(v.admin)}" target="_blank" rel="noopener">Abrir su admin ${icono("fuera")}</a></div>` : ""}
          ${g.items.map(a => tarjetaAlerta(a)).join("")}
        </div></details>`;
    }
    // Por producto: si el mismo campo difiere en varios vendedores, lo más probable es un solo problema (cambió la master).
    const comunes = n > 1 ? [...new Set(g.items.flatMap(a => sinResolver(a).map(c => c.campo)))].filter(campo => g.items.every(a => sinResolver(a).some(c => c.campo === campo))) : [];
    return `<details class="grupo-alertas" data-grupo="${esc(g.clave)}"${al.cerrados.has(g.clave) ? "" : " open"}>
      <summary><span class="g-titulo"><b>${esc(g.nombre)} <span class="t-dato t-secundario">${esc(g.sku)}</span></b><span class="t-secundario">${n > 1 ? `Distinto en ${n} vendedores` : "Distinto en 1 vendedor"}</span>${tipos(g.items)}</span>${n > 1 ? `<span class="badge warning">${n} vendedores</span>` : ""}</summary>
      <div class="g-cuerpo">
        ${comunes.length && abierta ? `<div class="aviso">${icono("aviso")}<div><b>Probablemente es un solo problema</b>${esc(comunes.join(" y "))} ${comunes.length > 1 ? "difieren" : "difiere"} en los ${n} vendedores. Si cambió en la master y no se propagó, alcanza con avisarles juntos.
          <span class="muestra" style="margin-top:8px"><button class="btn primary sm" type="button" data-accion="avisar-producto" data-sku="${esc(g.sku)}">${icono("mensaje")}Avisar a los ${n}</button></span></div></div>` : ""}
        ${g.items.map(a => tarjetaAlerta(a, true)).join("")}
      </div></details>`;
  };

  return `<div class="cabecera">
      <div><h1 class="t-pagina">Alertas</h1>
        <p class="t-secundario">${ab.length ? `${plural(ab.length, "producto desincronizado", "productos desincronizados")} en ${plural(afectados, "vendedor", "vendedores")}` : "Todos los catálogos coinciden con la master"}</p></div>
      ${tabs("Agrupar", "al-vista", [["vendedor", "Por vendedor"], ["producto", "Por producto"]], al.vista, "push")}
    </div>
    <div class="filtros">
      <span class="select"><select data-al="vendedor" aria-label="Vendedor">
        <option value="todos">Todos los vendedores</option>
        ${vendedores.map(v => `<option value="${esc(v.id)}"${v.id === al.vendedor ? " selected" : ""}>${esc(v.nombre)}</option>`).join("")}
      </select></span>
      <span class="select"><select data-al="tipo" aria-label="Tipo de diferencia">
        <option value="todos">Todos los campos</option>
        ${Object.entries(GRUPOS).map(([k, t]) => `<option value="${k}"${k === String(al.tipo) ? " selected" : ""}>${t}</option>`).join("")}
      </select></span>
      ${tabs("Estado", "al-estado", [["abiertas", "Sin resolver"], ["silenciadas", "Ignoradas y pospuestas"]], al.estado, "push")}
    </div>
    <div class="lista">${conItems.length ? conItems.map(grupoHtml).join("") : al.estado === "abiertas"
      ? vacio("Nada para resolver", "Los productos de este filtro coinciden con la master.")
      : vacio("No hay diferencias ignoradas ni pospuestas", "Cuando ignores o pospongas una, queda acá para poder volver a alertarla.")}</div>
    <p class="muestra t-secundario" style="gap:6px 8px">Tipos de diferencia: ${Object.entries(GRUPOS).map(([g, nombre]) => `<span class="badge tipo t${g}">${nombre}</span>`).join("")}</p>
    <p class="t-secundario">Pedix solo permite leer los catálogos: las diferencias se detectan acá y se corrigen desde el admin de cada vendedor. Una alerta avisada se cierra sola cuando la siguiente lectura la encuentra corregida, y se reabre si vuelve a aparecer.</p>`;
}

// Mensajes al vendedor. La cola permite avisar a varios vendedores seguidos (un mensaje a cada uno).
const nombreDePila = v => (v.contacto || v.nombre).split(" ")[0];
const mensajeAlertas = (v, lista) => cfg.plantilla.replaceAll("{contacto}", nombreDePila(v)).replaceAll("{vendedor}", v.nombre)
  .replaceAll("{diferencias}", lista.map(a => `• ${a.producto} (${a.sku})\n` + sinResolver(a).map(c => `   – ${c.campo}: debería ser "${c.master}" y figura "${c.vendedor}"`).join("\n")).join("\n\n"));
const mensajePedido = p => { const v = vendedor(p.vendedor); return cfg.plantillaPedido.replaceAll("{contacto}", nombreDePila(v)).replaceAll("{vendedor}", v.nombre)
  .replaceAll("{pedido}", p.numero).replaceAll("{cliente}", p.cliente).replaceAll("{total}", pesos(p.total)).replaceAll("{espera}", duracion(espera(p))); };
let colaAviso = [];
function abrirAviso(cola) {
  colaAviso = cola.filter(x => x.v);
  if (!colaAviso.length) return;
  mostrarAviso();
  if (!$("dlg-aviso").open) $("dlg-aviso").showModal();
}
function mostrarAviso() {
  const x = colaAviso[0];
  $("dlg-para").textContent = `Para ${x.v.contacto || x.v.nombre}${x.v.contacto ? ", de " + x.v.nombre : ""} · ${tel(x.v.telefono)}${colaAviso.length > 1 ? ` · mensaje 1 de ${colaAviso.length}` : ""}`;
  $("dlg-texto").value = x.texto;
  $("dlg-texto").setSelectionRange(0, 0); $("dlg-texto").scrollTop = 0;   // se lee desde el principio
  $("dlg-whatsapp").href = whatsapp(x.v.telefono, x.texto);
}
function avisoHecho(canal) {
  const x = colaAviso.shift();
  (x.alertas || []).forEach(a => { a.aviso = { min: 0, quien: YO }; });
  if (x.pedido) x.pedido.aviso = { min: 0, quien: YO };
  registrar(`${canal === "WhatsApp" ? "Avisó por WhatsApp" : "Copió el aviso"}: ${x.pedido ? "pedido " + x.pedido.numero : x.alertas.map(a => a.producto).join(", ")}`, x.v.id);
  if (colaAviso.length) return mostrarAviso();
  $("dlg-aviso").close();
  pintar();
  avisar(canal === "WhatsApp" ? "Quedó marcado como avisado" : "Mensaje copiado y marcado como avisado");
}

/* ============================ Vendedores ============================ */
const diasDelPeriodo = () => periodo === "d30" ? 30 : 7;
const serieVentas = v => Array.from({ length: diasDelPeriodo() }, (_, k) => celda(diasDelPeriodo() - 1 - k, v.id).ventas);

function vistaVendedores() {
  const total = stats(null, periodo).ventas, n = diasDelPeriodo();
  // Los que tienen problemas van primero: sin conexión, después los que tienen más alertas.
  const orden = [...vendedores].sort((a, b) => (a.conexion === "ok") - (b.conexion === "ok") || alertasDe(b.id).length - alertasDe(a.id).length);
  return `<div class="cabecera"><div><h1 class="t-pagina">Vendedores</h1>
      <p class="t-secundario">${vendedores.length} tiendas de la cuenta master. Primero las que necesitan atención.</p></div>${selectorPeriodo()}</div>
    <div class="vendedores">${orden.map(v => {
      const s = stats(v, periodo), ant = stats(v, periodo, true), ok = v.conexion === "ok", suyos = pendientes().filter(p => p.vendedor === v.id);
      return `<a class="vcard${ok ? "" : " caida"}" href="#vendedor/${esc(v.id)}">
        <header>${avatar(v)}<div><h2>${esc(v.nombre)}</h2><span class="t-secundario">${esc(v.zona)}</span></div>
          <span class="ir">${icono("ir")}<span class="sr">Abrir ficha</span></span></header>
        <div class="muestra" style="gap:6px">${badgeConexion(v)}${badgeCatalogo(alertasDe(v.id).length)}</div>
        <div class="venta"><span class="t-secundario">Ventas · ${PERIODOS[periodo].toLowerCase()}</span>
          <div class="venta-fila"><b>${pesos(s.ventas)}</b>${spark(serieVentas(v), colorDe(v), `Ventas por día, últimos ${n} días`)}</div>
          <span class="t-secundario">${variacion(s.ventas, ant.ventas)} frente a ${PREVIO[periodo]}</span></div>
        <dl class="cifras">
          <div><dt>Parte del total</dt><dd>${total ? porcentaje(s.ventas / total * 100) : "—"}</dd></div>
          <div><dt>Pedidos hoy</dt><dd>${oGuion(v, stats(v, "hoy").pedidos)}</dd></div>
          <div><dt>Por confirmar</dt><dd>${oGuion(v, suyos.length)}</dd></div>
        </dl>
        <p class="vcard-pie${ok ? "" : " t-destructivo"}">${icono("reloj")}${ok ? `Última lectura ${hace(v.lecturaMin)}` : `Sin datos desde ${esc(v.ultimaLectura)}`}</p>
      </a>`; }).join("")}</div>`;
}

const FICHA_TABS = [["resumen", "Resumen"], ["pedidos", "Pedidos"], ["catalogo", "Catálogo"], ["actividad", "Actividad"], ["tienda", "Tienda"]];
let vistaMovil = false;

function listaActividad(items) {
  if (!items.length) return vacio("Sin actividad todavía", "Acá queda quién avisó, ignoró o cambió algo, y cuándo.");
  return `<ul class="actividad">${items.map(x => `<li><span class="avatar chico ${x.quien === "sistema" ? "sistema" : ""}">${x.quien === "sistema" ? icono("releer") : esc(iniciales(usuario(x.quien).nombre))}</span>
    <span><b>${x.quien === "sistema" ? "Sistema" : esc(usuario(x.quien).nombre)}</b> ${esc(x.texto.charAt(0).toLowerCase() + x.texto.slice(1))}${x.vendedor && vendedor(x.vendedor) ? ` <span class="t-secundario">· ${esc(vendedor(x.vendedor).nombre)}</span>` : ""}</span>
    <time class="t-secundario">${hace((Date.now() - x.t) / 6e4)}</time></li>`).join("")}</ul>`;
}

function vistaFicha(v, tab) {
  const ok = v.conexion === "ok", suyas = alertasDe(v.id), s = stats(v, periodo), ant = stats(v, periodo, true), total = stats(null, periodo).ventas;
  const [a, b] = RANGOS[periodo], suyos = pedidosDe(v.id), delPeriodo = suyos.filter(p => p.dia >= a && p.dia < b), porConfirmar = suyos.filter(p => p.estado === "Pendiente").sort((x, y) => espera(y) - espera(x));
  const kpi = (titulo, valor, pie = "") => `<div class="kpi"><span>${titulo}</span><b>${valor}</b><small>${pie}</small></div>`;
  const paneles = {
    resumen: () => `<div class="kpis">
        ${kpi("Ventas", pesos(s.ventas), `${variacion(s.ventas, ant.ventas)}<span class="largo"> frente a ${PREVIO[periodo]}</span>`)}
        ${kpi("Pedidos", s.pedidos, `${variacion(s.pedidos, ant.pedidos)}<span class="largo"> frente a ${PREVIO[periodo]}</span>`)}
        ${kpi("Ticket promedio", s.pedidos ? pesos(s.ticket) : "—", variacion(s.ticket, ant.ticket))}
        ${kpi("Cancelados", `${s.cancelados} <em>de ${s.pedidos}</em>`, s.pedidos ? porcentaje(s.cancelacion) : "")}
        ${kpi("Parte del total", total ? porcentaje(s.ventas / total * 100) : "—", "de las ventas de todos")}
      </div>
      <div class="graficos">
        <div class="tarjeta"><h2>Pedidos por día · últimos ${diasDelPeriodo()} días</h2>${columnasDias(diasDelPeriodo(), [v])}</div>
        <div class="tarjeta"><h2>Para resolver</h2>
          <ul class="renglones">
            <li><button class="renglon-ir" type="button" data-fichatab="pedidos"><span>${ok ? plural(porConfirmar.length, "pedido por confirmar", "pedidos por confirmar") : `${plural(porConfirmar.length, "pedido por confirmar", "pedidos por confirmar")} al cierre`}</span>${porConfirmar.length ? chipEspera(porConfirmar[0]) : ""}${icono("ir")}</button></li>
            <li><button class="renglon-ir" type="button" data-fichatab="catalogo"><span>${suyas.length ? plural(suyas.length, "producto desincronizado", "productos desincronizados") : "Catálogo al día"}</span>${suyas.filter(x => gravedad(x) === 1).length ? `<span class="badge warning">${suyas.filter(x => gravedad(x) === 1).length} de precio o stock</span>` : ""}${icono("ir")}</button></li>
          </ul>
          <h2 style="margin-top:8px">Últimos pedidos</h2>
          <ul class="renglones">${suyos.slice(0, 4).map(p => `<li><button class="renglon-ir" type="button" data-pedido="${p.i}"><span><span class="t-dato">${esc(p.numero)}</span> ${esc(p.cliente)}<br><span class="t-secundario">${fecha(p)}</span></span><span class="t-num">${pesos(p.total)}</span></button></li>`).join("") || '<li class="t-secundario">Todavía no entró ningún pedido.</li>'}</ul>
        </div>
      </div>`,
    pedidos: () => delPeriodo.length ? `<p class="t-secundario">${plural(delPeriodo.length, "pedido", "pedidos")} · ${pesos(resumen(delPeriodo).ventas)} en ventas${porConfirmar.length ? ` · ${porConfirmar.length} por confirmar` : ""}</p>
        ${tablaPedidos(delPeriodo.slice(0, 25), { rotulo: "Pedidos de " + v.nombre, conVendedor: false })}
        <div class="muestra"><button class="btn outline sm" type="button" data-accion="ver-pedidos" data-v="${esc(v.id)}">Abrir en Pedidos, con filtros y búsqueda</button>${delPeriodo.length > 25 ? `<span class="t-secundario">Se muestran los 25 más recientes.</span>` : ""}</div>`
      : vacio("Sin pedidos en este período", "Probá con un período más largo."),
    catalogo: () => {
      const filas = CATALOGO.map(([sku, nombre, precio]) => ({ sku, nombre, precio, a: alertas.find(x => x.vendedor === v.id && x.sku === sku && activos(x).length) }));
      const alDia = filas.filter(f => !f.a || !sinResolver(f.a).length).length;
      return `<p class="t-secundario">${alDia} de ${filas.length} productos coinciden con la master${ok ? "" : ` · leído ${esc(v.ultimaLectura)}`}</p>
        <div class="tabla" tabindex="0" role="region" aria-label="Catálogo de ${esc(v.nombre)}"><table class="apilable">
          <thead><tr><th>Producto</th><th>Código</th><th class="num">Precio en la master</th><th>Estado</th><th>Qué difiere</th><th></th></tr></thead>
          <tbody>${filas.map(f => { const abiertos = f.a ? sinResolver(f.a) : [], sil = f.a ? activos(f.a).filter(silenciado) : [];
            return `<tr><td>${esc(f.nombre)}</td><td class="t-dato">${esc(f.sku)}</td><td class="num">${pesos(f.precio)}</td>
              <td>${abiertos.length ? '<span class="badge warning">Desincronizado</span>' : sil.length ? '<span class="badge secondary">Ignorado</span>' : '<span class="badge"><span class="punto"></span>Al día</span>'}</td>
              <td>${abiertos.length ? abiertos.map(c => esc(c.campo)).join(", ") : sil.length ? `<span class="t-secundario">${sil.map(c => esc(c.campo)).join(", ")}</span>` : ""}</td>
              <td class="num"><a class="btn ghost sm icon" href="${enlace(linkProducto(v, f.sku))}" target="_blank" rel="noopener" aria-label="Abrir ${esc(f.nombre)} en Pedix" data-tip="Abrir en Pedix">${icono("fuera")}</a></td></tr>`; }).join("")}</tbody>
        </table></div>
        ${suyas.length ? `<div class="muestra"><button class="btn primary sm" type="button" data-accion="ver-alertas" data-v="${esc(v.id)}">Ver el detalle y resolver</button><button class="btn outline sm" type="button" data-accion="avisar-vendedor" data-v="${esc(v.id)}">${icono("mensaje")}Avisar al vendedor</button></div>` : ""}`;
    },
    actividad: () => listaActividad(actividad.filter(x => x.vendedor === v.id)),
    // La tienda embebida es opcional: si Pedix prohíbe mostrarla dentro de otra página, queda el enlace.
    tienda: () => `<div class="tienda">
        <header><b>Tienda online</b><span class="t-dato t-secundario">${esc(v.tienda.replace("https://", ""))}</span>
          ${tabs("Tamaño de la vista", "movil", [["0", "Escritorio"], ["1", "Móvil"]], vistaMovil ? "1" : "0", "push")}
          <a class="btn outline sm" href="${enlace(v.tienda)}" target="_blank" rel="noopener">Abrir aparte ${icono("fuera")}</a></header>
        <div class="marco${vistaMovil ? " movil" : ""}" id="marco"><iframe src="${enlace(v.tienda, "about:blank")}" title="Tienda de ${esc(v.nombre)}" loading="lazy"></iframe></div>
      </div>
      <p class="t-secundario">Si el recuadro queda en blanco es porque Pedix no permite mostrar la tienda dentro de otra página (X-Frame-Options o frame-ancestors). Hay que confirmarlo con Pedix antes de construir esta pestaña; mientras tanto, "Abrir aparte" siempre funciona.</p>`,
  };
  return `<div class="cabecera ficha-cabeza">
      <div><h1 class="t-pagina" style="display:flex;align-items:center;gap:12px">${avatar(v)} ${esc(v.nombre)}</h1>
        <p class="t-secundario ficha-meta"><span>${esc(v.zona)}</span>${v.contacto ? `<span>${icono("mensaje")}<a class="btn link" href="${whatsapp(v.telefono, "")}" target="_blank" rel="noopener">${esc(v.contacto)}</a></span>` : ""}
          <span class="${ok ? "" : "t-destructivo"}">${icono("reloj")}${ok ? `Última lectura ${hace(v.lecturaMin)}` : `Sin datos desde ${esc(v.ultimaLectura)}`}</span></p></div>
      <span class="muestra push">
        <button class="btn outline" type="button" data-accion="abrir-exportar" data-v="${esc(v.id)}">${icono("bajar")}Exportar</button>
        <a class="btn outline" href="${enlace(v.tienda)}" target="_blank" rel="noopener">Abrir tienda ${icono("fuera")}</a>
        <a class="btn primary" href="${enlace(v.admin)}" target="_blank" rel="noopener">Abrir admin ${icono("fuera")}</a>
      </span>
    </div>
    ${ok ? "" : `<div class="aviso destructive">${icono("aviso")}<div><b>Sin conexión con esta tienda</b>${MOTIVO_CAIDA}. Lo de abajo es lo leído ${esc(v.ultimaLectura)}; lo de hoy no se conoce.
      <span class="muestra" style="margin-top:8px"><button class="btn outline sm" type="button" data-accion="probar" data-v="${esc(v.id)}">Probar conexión</button><a class="btn ghost sm" href="#configuracion">Cargar una clave nueva</a></span></div></div>`}
    <div class="filtros">${tabs("Secciones de la ficha", "fichatab", FICHA_TABS.map(([k, t]) => [k, k === "catalogo" && suyas.length ? `${t} <span class="badge warning cuenta">${suyas.length}</span>` : k === "pedidos" && porConfirmar.length ? `${t} <span class="badge secondary cuenta">${porConfirmar.length}</span>` : t]), tab)}
      ${["resumen", "pedidos"].includes(tab) ? selectorPeriodo() : ""}</div>
    <div class="panel-ficha">${paneles[tab]()}</div>`;
}

/* ============================ Pedidos ============================ */
// Todos los pedidos de todas las tiendas en una sola lista. Es de solo lectura: el estado se cambia en Pedix.
// La misma tabla de pedidos en la lista general, la ficha del vendedor y el día del calendario.
// La fila entera abre el detalle. Las clases c-* ubican cada dato cuando la tabla pasa a tarjetas (ver .pedidos en estilos.css).
function tablaPedidos(lista, { rotulo, conVendedor = true, conProductos = true, soloHora = false, ocultas = new Set() }) {
  const ver = c => !ocultas.has(c);
  conVendedor &&= ver("vendedor"); conProductos &&= ver("productos");
  return `<div class="tabla" tabindex="0" role="region" aria-label="${esc(rotulo)}"><table class="apilable pedidos">
    <thead><tr><th>Pedido</th>${ver("fecha") ? `<th>${soloHora ? "Hora" : "Fecha"}</th>` : ""}${conVendedor ? "<th>Vendedor</th>" : ""}${ver("cliente") ? "<th>Cliente</th>" : ""}${conProductos ? "<th>Productos</th>" : ""}${ver("estado") ? "<th>Estado</th>" : ""}${ver("total") ? '<th class="num">Total</th>' : ""}</tr></thead>
    <tbody>${lista.map(p => { const v = vendedor(p.vendedor); return `<tr class="clic" data-pedido="${p.i}">
      <td class="c-num"><button class="btn link t-dato" type="button" data-pedido="${p.i}" aria-label="Ver el pedido ${esc(p.numero)}">${esc(p.numero)}</button></td>
      ${ver("fecha") ? `<td class="c-fecha">${soloHora ? horaDe(p) : fecha(p)}</td>` : ""}
      ${conVendedor ? `<td class="c-vend">${punto(v)} ${esc(v.nombre)}</td>` : ""}
      ${ver("cliente") ? `<td class="c-cliente">${esc(p.cliente)}</td>` : ""}
      ${conProductos ? `<td class="c-prod"><span data-tip="${esc(p.items.map(i => `${i.cantidad} × ${i.nombre}`).join("\n"))}"><span class="elipsis">${esc(p.items[0].nombre)}</span>${p.items.length > 1 ? ` <span class="t-secundario">+${p.items.length - 1}</span>` : ""}</span></td>` : ""}
      ${ver("estado") ? `<td class="c-estado"><span class="estado-espera">${badgeEstado(p.estado)}${p.estado === "Pendiente" ? chipEspera(p) : ""}</span></td>` : ""}${ver("total") ? `<td class="c-total num">${pesos(p.total)}</td>` : ""}
    </tr>`; }).join("")}</tbody>
  </table></div>`;
}

function pedidosFiltrados() {
  const [a, b] = RANGOS[periodo], q = pf.q.trim().toLowerCase();
  const lista = pedidos.filter(p => p.dia >= a && p.dia < b &&
    (pf.vendedor === "todos" || p.vendedor === pf.vendedor) && (pf.estado === "todos" || p.estado === pf.estado) &&
    (!q || p.numero.includes(q) || p.cliente.toLowerCase().includes(q) || p.items.some(i => i.nombre.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))));
  // "Más tiempo esperando": los que están por confirmar primero, del que más espera al que menos.
  const pend = p => p.estado === "Pendiente";
  return pf.orden === "espera" ? lista.sort((x, y) => pend(y) - pend(x) || (pend(x) ? espera(y) - espera(x) : x.i - y.i)) : lista;
}

function listaPedidos() {
  const lista = pedidosFiltrados(), r = resumen(lista);
  if (!lista.length) return vacio("Ningún pedido con estos filtros", "Probá con otro período, vendedor o estado.");
  const cabeza = `<p class="t-secundario">${plural(lista.length, "pedido", "pedidos")} · ${pesos(r.ventas)} en ventas${r.pendientes ? ` · ${r.pendientes} por confirmar` : ""}</p>`;
  // Teléfono: en vez de páginas, "Cargar más" al final de la lista.
  if (telefono.matches) {
    const visibles = lista.slice(0, pf.mostrados), quedan = lista.length - visibles.length;
    return `${cabeza}${tablaPedidos(visibles, { rotulo: "Pedidos" })}
      ${quedan ? `<button class="btn outline" type="button" data-accion="cargar-mas">Cargar ${Math.min(quedan, 10)} más <span class="t-secundario">· quedan ${quedan}</span></button>` : `<p class="t-secundario" style="text-align:center">No hay más pedidos.</p>`}`;
  }
  // Paginación simulada sobre la lista ya filtrada; en la versión real la resuelve el DataTable (o el servidor).
  const paginas = Math.ceil(lista.length / pf.porPagina);
  pf.pagina = Math.min(Math.max(pf.pagina, 1), paginas);
  const desde = (pf.pagina - 1) * pf.porPagina, pagina = lista.slice(desde, desde + pf.porPagina);
  return `${cabeza}${tablaPedidos(pagina, { rotulo: "Pedidos" })}
    <div class="paginacion">
      <span class="t-secundario">${desde + 1}–${desde + pagina.length} de ${lista.length}</span>
      <div>
        <label><span class="t-secundario">Filas por página</span>
          <span class="select"><select data-pf="porPagina">${[10, 25, 50].map(n => `<option${n === pf.porPagina ? " selected" : ""}>${n}</option>`).join("")}</select></span></label>
        <span class="t-secundario">Página ${pf.pagina} de ${paginas}</span>
        <span class="muestra" style="gap:6px">
          <button class="btn outline sm icon" type="button" data-accion="pagina-antes" aria-label="Página anterior"${pf.pagina === 1 ? " disabled" : ""}>${icono("volver")}</button>
          <button class="btn outline sm icon" type="button" data-accion="pagina-despues" aria-label="Página siguiente"${pf.pagina === paginas ? " disabled" : ""}>${icono("ir")}</button>
        </span>
      </div>
    </div>`;
}

const selVendedor = () => `<span class="select"><select data-pf="vendedor" aria-label="Vendedor">
  <option value="todos">Todos los vendedores</option>
  ${vendedores.map(v => `<option value="${esc(v.id)}"${v.id === pf.vendedor ? " selected" : ""}>${esc(v.nombre)}</option>`).join("")}</select></span>`;
const selEstado = () => `<span class="select"><select data-pf="estado" aria-label="Estado">
  <option value="todos">Todos los estados</option>
  ${ESTADOS.map(e => `<option value="${e}"${e === pf.estado ? " selected" : ""}>${e === "Pendiente" ? "Por confirmar" : e}</option>`).join("")}</select></span>`;
const selOrden = () => `<span class="select"><select data-pf="orden" aria-label="Orden">
  ${[["recientes", "Más recientes primero"], ["espera", "Más tiempo esperando"]].map(([k, t]) => `<option value="${k}"${k === pf.orden ? " selected" : ""}>${t}</option>`).join("")}</select></span>`;
const filtrosActivos = () => (pf.vendedor !== "todos") + (pf.estado !== "todos") + (pf.orden !== "recientes");
function pintarFiltros() {
  $("dlg-filtros-cuerpo").innerHTML = `<div class="campo"><span>Período</span>${selectorPeriodo("")}</div>
    <label class="campo"><span>Vendedor</span>${selVendedor()}</label><label class="campo"><span>Estado</span>${selEstado()}</label><label class="campo"><span>Orden</span>${selOrden()}</label>`;
}

function vistaPedidos() {
  const r = stats(null, periodo), pend = pendientes(), demorados = pend.filter(tarde).length, rotulo = PERIODOS[periodo].toLowerCase();
  return `<div class="cabecera">
      <div><h1 class="t-pagina">Pedidos</h1><p class="t-secundario">Todos los pedidos que entran en las tiendas de los vendedores, en un solo lugar.</p></div>
      <button class="btn outline push" type="button" data-accion="exportar-pedidos">${icono("bajar")}Exportar</button>
    </div>
    <div class="kpis">
      <div class="kpi"><span>Pedidos · ${rotulo}</span><b>${r.pedidos}</b><small>${variacion(r.pedidos, stats(null, periodo, true).pedidos)}<span class="largo"> frente a ${PREVIO[periodo]}</span></small></div>
      <div class="kpi"><span>Ventas · ${rotulo}</span><b>${pesos(r.ventas)}</b><small>${variacion(r.ventas, stats(null, periodo, true).ventas)}<span class="largo"> frente a ${PREVIO[periodo]}</span></small></div>
      <button class="kpi accion" type="button" data-accion="ver-pendientes"><span>Por confirmar · ahora</span><b>${pend.length}</b><small>${demorados ? `<span class="t-destructivo">${demorados} hace más de ${cfg.umbralEspera} h</span>` : "Ninguno pasó el límite"}<span class="largo"> · ver cola</span></small></button>
    </div>
    ${notaSinDatos()}
    ${telefono.matches ? `<div class="filtros">
        <input class="input" id="buscar-pedido" type="search" placeholder="Número, cliente o producto" aria-label="Buscar pedido" value="${esc(pf.q)}">
        <button class="btn outline" type="button" data-accion="abrir-filtros">${icono("filtro")}Filtros${filtrosActivos() ? ` <span class="badge cuenta secondary">${filtrosActivos()}</span>` : ""}<span class="t-secundario">· ${rotulo}</span></button>
      </div>` : `<div class="filtros">
        <input class="input" id="buscar-pedido" style="width:210px" type="search" placeholder="Número, cliente o producto" aria-label="Buscar pedido" value="${esc(pf.q)}">
        ${selVendedor()}${selEstado()}${selOrden()}
        ${selectorPeriodo()}
      </div>`}
    <div class="lista" id="lista-pedidos">${listaPedidos()}</div>
    <p class="t-secundario">La lista es de lectura: para confirmar, entregar o cancelar un pedido, abrilo en el admin de Pedix de ese vendedor.</p>`;
}

// Detalle del pedido en un panel lateral: la lista sigue a la vista atrás.
let pedidoAbierto = null;
function abrirPedido(p) {
  pedidoAbierto = p;
  const v = vendedor(p.vendedor), pend = p.estado === "Pendiente";
  $("dlg-pedido-cuerpo").innerHTML = `<header class="sheet-cabeza"><div><h2 class="t-seccion">Pedido <span class="t-dato" style="font-size:0.9375rem">${esc(p.numero)}</span></h2>
        <p class="t-secundario">${fecha(p)} · ${punto(v)}${esc(v.nombre)}</p></div>
      <button class="btn ghost icon sm push" aria-label="Cerrar">${icono("cerrar")}</button></header>
    <div class="sheet-cuerpo">
      <div class="muestra" style="gap:6px">${badgeEstado(p.estado)}${pend ? chipEspera(p) : ""}
        ${p.tomado ? `<span class="badge secondary">${icono("usuario")}${p.tomado === YO ? "Lo tomaste vos" : "Lo tomó " + esc(quien(p.tomado))}</span>` : ""}
        ${p.aviso ? `<span class="badge secondary">${icono("mensaje")}Vendedor avisado ${hace(p.aviso.min)}</span>` : ""}</div>
      ${v.conexion === "ok" ? "" : `<div class="aviso destructive">${icono("aviso")}<div><b>Dato de ${esc(v.ultimaLectura)}</b>La tienda está sin conexión: el estado pudo haber cambiado.</div></div>`}
      <section><h3>Cliente</h3><dl class="datos">
        <dt>Nombre</dt><dd>${esc(p.cliente)}</dd>
        <dt>Teléfono</dt><dd><a class="btn link" href="${whatsapp(p.telefono, "")}" target="_blank" rel="noopener">${tel(p.telefono)}</a></dd>
        <dt>Entrega</dt><dd>${esc(p.entrega)}</dd>
        ${p.direccion ? `<dt>Dirección</dt><dd>${esc(p.direccion)}</dd>` : ""}
        <dt>Pago</dt><dd>${esc(p.pago)}</dd></dl></section>
      <section><h3>Productos</h3><ul class="renglones">
        ${p.items.map(i => `<li><span>${i.cantidad} × ${esc(i.nombre)}<br><span class="t-dato t-secundario">${esc(i.sku)}</span></span><span class="t-num push">${pesos(i.precio * i.cantidad)}</span></li>`).join("")}
        <li><b>Total</b><b class="t-num push">${pesos(p.total)}</b></li></ul></section>
      <p class="t-secundario">El estado del pedido se cambia en el admin de Pedix del vendedor.</p>
    </div>
    <div class="acciones">
      ${pend ? `<button class="btn ghost tono-azul" type="button" data-accion="tomar-pedido">${icono("usuario")}${p.tomado === YO ? "Soltar" : p.tomado ? "Tomarlo yo" : "Lo tomo"}</button>
        <button class="btn outline tono-verde" type="button" data-accion="avisar-pedido">${icono("mensaje")}Avisar<span class="largo">al vendedor</span></button>` : ""}
      <a class="btn primary" href="${enlace(linkPedido(v, p))}" target="_blank" rel="noopener">Abrir en Pedix ${icono("fuera")}</a>
    </div>`;
  if (!$("dlg-pedido").open) $("dlg-pedido").showModal();
}

// Los textos vienen de Pedix (clientes, productos): si traen ; o comillas van entre comillas, y si empiezan
// como una fórmula (=, +, -, @) se les antepone un apóstrofo para que la planilla no los ejecute.
const celdaCSV = x => {
  let t = String(x ?? "");
  if (typeof x === "string" && /^[=+\-@\t\r]/.test(t) && !/^-?[\d.,]+$/.test(t)) t = "'" + t;
  return /[;"\n\r]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
};
// Excel con configuración regional es-AR espera punto y coma como separador y BOM para leer tildes y ñ.
function descargarCSV(nombre, lineas) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + lineas.map(l => l.map(celdaCSV).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ============================ Reportes ============================ */
let medida = "ventas", vistaReporte = "resumen";

/* ---------- Fechas y calendario ---------- */
const HOY = new Date(); HOY.setHours(0, 0, 0, 0);
const masDias = (f, n) => { const x = new Date(f); x.setDate(x.getDate() + n); return x; };
const diasAtras = f => Math.round((HOY - f) / 864e5);            // 0 = hoy, negativo = futuro
const lunesDe = f => masDias(f, -((f.getDay() + 6) % 7));
const mayuscula = t => t.charAt(0).toUpperCase() + t.slice(1);
const DIAS_CON_DATOS = 60;                                        // la maqueta solo tiene pedidos de los últimos 60 días
const hayDatos = f => diasAtras(f) >= 0 && diasAtras(f) < DIAS_CON_DATOS;
const cal = { vista: "mes", ref: new Date(HOY) };

// Índice día × vendedor, para no recorrer todos los pedidos en cada celda.
const indice = {};
pedidos.forEach(p => { const c = indice[p.dia + "|" + p.vendedor] ||= { n: 0, ventas: 0 }; c.n++; if (p.estado !== "Cancelado") c.ventas += p.total; });
const celda = (dia, id) => indice[dia + "|" + id] || { n: 0, ventas: 0 };
const totalDia = dia => vendedores.reduce((t, v) => { const c = celda(dia, v.id); return { n: t.n + c.n, ventas: t.ventas + c.ventas }; }, { n: 0, ventas: 0 });
const totalRango = (desde, cuantos) => Array.from({ length: cuantos }, (_, k) => masDias(desde, k)).filter(hayDatos)
  .reduce((t, f) => { const c = totalDia(diasAtras(f)); return { n: t.n + c.n, ventas: t.ventas + c.ventas }; }, { n: 0, ventas: 0 });

// Columnas de pedidos por día. Con varios vendedores cada columna se apila por vendedor, que es lo que
// agrega información; con uno solo es una columna simple en su color. El detalle sale al pasar el cursor.
function columnasDias(n, vs) {
  const dias = Array.from({ length: n }, (_, k) => n - 1 - k), totales = dias.map(dd => vs.reduce((s, v) => s + celda(dd, v.id).n, 0)), max = Math.max(...totales, 1);
  const rotulo = (dd, largo) => dd === 0 ? "Hoy" : mayuscula(masDias(HOY, -dd).toLocaleDateString("es-AR", largo ? { weekday: "long", day: "numeric", month: "long" } : n > 10 ? { day: "numeric", month: "numeric" } : { weekday: "short" }).replace(".", ""));
  return `<div class="columnas${n > 10 ? " densa" : ""}" role="img" aria-label="Pedidos por día, últimos ${n} días. El detalle está en la tabla de abajo.">
      ${dias.map((dd, k) => `<div class="col" data-tip="${esc(rotulo(dd, true) + ": " + plural(totales[k], "pedido", "pedidos") + (vs.length > 1 ? "\n" + vs.map(v => `${v.nombre}: ${v.conexion !== "ok" && dd === 0 ? "sin datos" : celda(dd, v.id).n}`).join("\n") : ""))}">
        <span class="tot">${n > 10 ? "" : dd === 0 && vs.every(v => v.conexion !== "ok") ? "—" : totales[k]}</span>
        <span class="pila-v" style="--h:${(totales[k] / max).toFixed(3)};animation-delay:${k * (n > 10 ? 12 : 40)}ms">${vs.map(v => celda(dd, v.id).n ? `<i style="flex:${celda(dd, v.id).n};background:${colorDe(v)}"></i>` : "").join("")}</span></div>`).join("")}
    </div>
    <div class="dias">${dias.map((dd, k) => `<span>${n > 10 && dd % 5 !== 0 ? "" : rotulo(dd)}</span>`).join("")}</div>
    ${vs.length > 1 ? `<div class="leyenda">${vs.map(v => `<span>${punto(v)}${esc(v.nombre)}</span>`).join("")}</div>` : ""}`;
}

function vistaResumen() {
  const t = stats(null, periodo), ant = stats(null, periodo, true);
  const filas = vendedores.map(v => ({ v, s: stats(v, periodo), ant: stats(v, periodo, true) })).sort((a, b) => b.s[medida] - a.s[medida]);
  const max = Math.max(...filas.map(f => f.s[medida]), 1);
  const kpi = (titulo, valor, pie) => `<div class="kpi"><span>${titulo}</span><b>${valor}</b><small>${pie}</small></div>`;
  const frente = `<span class="largo"> frente a ${PREVIO[periodo]}</span>`;   // en teléfono queda solo la variación
  return `<div class="kpis">
      ${kpi("Total de ventas", pesos(t.ventas), `${variacion(t.ventas, ant.ventas)}${frente}`)}
      ${kpi("Pedidos", t.pedidos, `${variacion(t.pedidos, ant.pedidos)}${frente}`)}
      ${kpi("Ticket promedio", t.pedidos ? pesos(t.ticket) : "—", `${variacion(t.ticket, ant.ticket)}${frente}`)}
      ${kpi("Cancelados", `${t.cancelados} <em>de ${t.pedidos}</em>`, `${variacion(t.cancelacion, ant.cancelacion, true)}<span class="largo"> · pasó de ${porcentaje(ant.cancelacion)} a ${porcentaje(t.cancelacion)}</span>`)}
    </div>
    ${notaSinDatos()}
    <div class="graficos">
      <div class="tarjeta"><div class="cabecera" style="align-items:center"><h2>${medida === "ventas" ? "Ventas" : "Pedidos"} por vendedor · ${PERIODOS[periodo].toLowerCase()}</h2>
          ${tabs("Qué se mide", "medida", [["ventas", "Ventas"], ["pedidos", "Pedidos"]], medida, "push")}</div>
        <div class="gbarras">${filas.map((f, k) => `<div class="gfila" data-tip="${esc(`${f.v.nombre}\n${pesos(f.s.ventas)} en ${plural(f.s.pedidos, "pedido", "pedidos")}\n${t.ventas ? porcentaje(f.s.ventas / t.ventas * 100) + " de las ventas" : ""}`)}">
          <span class="gnombre">${avatar(f.v, "chico")}<span>${esc(f.v.nombre)}</span></span>
          <span class="pista"><i style="width:${f.s[medida] / max * 100}%;background:${colorDe(f.v)};animation-delay:${k * 60}ms"></i></span>
          <span class="t-num valor">${medida === "ventas" ? pesosCorto(f.s.ventas) : f.s.pedidos}</span></div>`).join("")}</div>
      </div>
      <div class="tarjeta"><h2>Pedidos por día · últimos ${diasDelPeriodo()} días</h2>
        ${columnasDias(diasDelPeriodo(), vendedores)}
      </div>
    </div>
    <div class="cabecera"><h2 class="t-seccion">Indicadores por vendedor</h2><button class="btn outline sm push" type="button" data-accion="exportar-indicadores">${icono("bajar")}Exportar</button></div>
    <div class="tabla" tabindex="0" role="region" aria-label="Indicadores por vendedor"><table class="apilable">
      <thead><tr><th>Vendedor</th><th class="num">Ventas</th><th class="num">Variación</th><th class="num">Parte del total</th><th class="num">Pedidos</th><th class="num">Ticket promedio</th><th class="num">Cancelados</th><th class="num">Por confirmar</th></tr></thead>
      <tbody>${filas.map(f => `<tr><td>${punto(f.v)} <a class="btn link sin-raya" href="#vendedor/${esc(f.v.id)}">${esc(f.v.nombre)}</a>${f.v.conexion === "ok" ? "" : ` <span class="badge destructive" data-tip="Sin datos desde ${esc(f.v.ultimaLectura)}">Incompleto</span>`}</td>
        <td class="num">${pesos(f.s.ventas)}</td><td class="num">${variacion(f.s.ventas, f.ant.ventas)}</td><td class="num">${t.ventas ? porcentaje(f.s.ventas / t.ventas * 100) : "—"}</td>
        <td class="num">${f.s.pedidos}</td><td class="num">${f.s.pedidos ? pesos(f.s.ticket) : "—"}</td>
        <td class="num">${f.s.pedidos ? `${f.s.cancelados} de ${f.s.pedidos} <span class="t-secundario">${porcentaje(f.s.cancelacion)}</span>` : "—"}</td>
        <td class="num">${oGuion(f.v, pendientes().filter(p => p.vendedor === f.v.id).length)}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="t-secundario">Las ventas no cuentan los pedidos cancelados. La variación compara con el período anterior de igual duración. En cancelados, bajar es bueno: por eso una baja va en verde.</p>`;
}

function calMes() {
  const primero = new Date(cal.ref.getFullYear(), cal.ref.getMonth(), 1), ultimo = new Date(cal.ref.getFullYear(), cal.ref.getMonth() + 1, 0);
  const inicio = lunesDe(primero), semanas = Math.ceil((diasAtras(inicio) - diasAtras(ultimo) + 1) / 7);
  const fechas = Array.from({ length: semanas * 7 }, (_, k) => masDias(inicio, k));
  const max = Math.max(...fechas.filter(hayDatos).map(f => totalDia(diasAtras(f)).n), 1);
  return `<div class="cmes">
    ${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(x => `<div class="sem">${x}</div>`).join("")}
    ${fechas.map(f => {
      const dia = diasAtras(f), clases = (f.getMonth() !== cal.ref.getMonth() ? " fuera" : "") + (dia === 0 ? " hoy" : "");
      if (!hayDatos(f)) return `<div class="cdia vacia${clases}"><span class="num">${f.getDate()}</span></div>`;
      const t = totalDia(dia);
      return `<button class="cdia${clases}" type="button" data-cal-dia="${+f}" data-tip="${esc(vendedores.map(v => `${v.nombre}: ${celda(dia, v.id).n}`).join("\n"))}">
        <span class="num">${f.getDate()}</span>
        <span><b>${t.n}</b> <small>${t.n === 1 ? "pedido" : "pedidos"}</small></span>
        <small class="monto">${t.n ? pesosCorto(t.ventas) : ""}</small>
        <span class="pila" style="width:${t.n / max * 100}%">${vendedores.map(v => celda(dia, v.id).n ? `<i style="flex:${celda(dia, v.id).n};background:${colorDe(v)}"></i>` : "").join("")}</span>
      </button>`; }).join("")}
  </div>`;
}

// Semana: una tarjeta por vendedor (más una con el total) y, adentro, sus siete días.
function calSemana() {
  const lunes = lunesDe(cal.ref), fechas = Array.from({ length: 7 }, (_, k) => masDias(lunes, k));
  const de = (f, v) => hayDatos(f) ? (v ? celda(diasAtras(f), v.id) : totalDia(diasAtras(f))) : { n: 0, ventas: 0 };
  const tarjeta = v => {
    const dias = fechas.map(f => de(f, v)), t = dias.reduce((s, c) => ({ n: s.n + c.n, ventas: s.ventas + c.ventas }), { n: 0, ventas: 0 });
    return `<article class="scard${v ? "" : " todos"}">
      <header><h3>${v ? punto(v) + esc(v.nombre) : "Todos los vendedores"}</h3><span class="t-secundario">${plural(t.n, "pedido", "pedidos")}${t.n ? " · " + pesos(t.ventas) : ""}</span></header>
      <ul class="sdias">${fechas.map((f, k) => {
        const c = dias[k], hoy = diasAtras(f) === 0 ? " hoy" : "";
        const corto = mayuscula(f.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "")), largo = f.toLocaleDateString("es-AR", { weekday: "long", day: "numeric" });
        // Lo visible va abreviado; el lector de pantalla recibe la frase completa
        const cab = `<span class="d" aria-hidden="true"><span class="w3">${corto}</span><span class="w1">${corto[0]}</span> ${f.getDate()}</span>`;
        if (!hayDatos(f)) return `<li><div class="sdia vacia${hoy}">${cab}<span class="sr">${largo}: sin datos</span></div></li>`;
        return `<li><button class="sdia${hoy}" type="button" data-cal-dia="${+f}" data-tip="${mayuscula(largo)}: ${plural(c.n, "pedido", "pedidos")}${c.n ? ", " + pesos(c.ventas) : ""}">
          ${cab}<b aria-hidden="true">${c.n || "—"}</b><small aria-hidden="true">${c.n ? pesosCorto(c.ventas) : "&nbsp;"}</small>
          <span class="sr">${largo}: ${plural(c.n, "pedido", "pedidos")}${c.n ? ", " + pesos(c.ventas) : ""}. Ver el día</span></button></li>`;
      }).join("")}</ul>
    </article>`;
  };
  return `<div class="semana">${tarjeta(null)}${vendedores.map(tarjeta).join("")}</div>`;
}

function calDia() {
  if (!hayDatos(cal.ref)) return vacio("Sin pedidos para mostrar", `La maqueta tiene pedidos de los últimos ${DIAS_CON_DATOS} días.`);
  const dia = diasAtras(cal.ref), delDia = pedidos.filter(p => p.dia === dia);
  return `<div class="tabla" tabindex="0" role="region" aria-label="Resumen del día por vendedor"><table class="apilable">
      <thead><tr><th>Vendedor</th><th class="num">Pedidos</th><th class="num">Ventas</th><th class="num">Ticket promedio</th><th class="num">Por confirmar</th></tr></thead>
      <tbody>${vendedores.map(v => { const r = resumen(delDia.filter(p => p.vendedor === v.id)), sinDato = v.conexion !== "ok" && dia === 0, o = x => sinDato ? oGuion(v, x) : x;
        return `<tr><td>${punto(v)} ${esc(v.nombre)}</td>
        <td class="num">${o(r.pedidos)}</td><td class="num">${o(pesos(r.ventas))}</td><td class="num">${r.pedidos ? pesos(r.ticket) : "—"}</td><td class="num">${o(r.pendientes)}</td></tr>`; }).join("")}</tbody>
    </table></div>
    ${delDia.length ? `<h2 style="margin-top:4px">Pedidos del día</h2>${tablaPedidos(delDia, { rotulo: "Pedidos del día", conProductos: false, soloHora: true })}` : ""}`;
}

function vistaCalendario() {
  const lunes = lunesDe(cal.ref);
  const titulo = cal.vista === "mes" ? mayuscula(cal.ref.toLocaleDateString("es-AR", { month: "long", year: "numeric" }))
    : cal.vista === "semana" ? `Semana del ${lunes.getDate()} al ${masDias(lunes, 6).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}`
    : mayuscula(cal.ref.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }));
  const t = cal.vista === "mes" ? totalRango(new Date(cal.ref.getFullYear(), cal.ref.getMonth(), 1), new Date(cal.ref.getFullYear(), cal.ref.getMonth() + 1, 0).getDate())
    : cal.vista === "semana" ? totalRango(lunes, 7) : totalRango(cal.ref, 1);
  return `<div class="tarjeta">
    <div><h2 class="t-seccion">${titulo}</h2>
      <p class="t-secundario">${plural(t.n, "pedido", "pedidos")} · ${pesos(t.ventas)} en ventas</p></div>
    <div class="cal-controles">
      <span role="group" aria-label="Moverse en el calendario">
        <button class="btn outline sm icon" type="button" style="width:30px" data-accion="cal-antes" aria-label="Anterior">${icono("volver")}</button>
        <button class="btn outline sm" type="button" data-accion="cal-hoy">Hoy</button>
        <button class="btn outline sm icon" type="button" style="width:30px" data-accion="cal-despues" aria-label="Siguiente">${icono("ir")}</button>
      </span>
      ${tabs("Vista del calendario", "cal-vista", [["mes", "Mes"], ["semana", "Semana"], ["dia", "Día"]], cal.vista)}
    </div>
    ${cal.vista === "mes" ? `<div class="leyenda">${vendedores.map(v => `<span>${punto(v)}${esc(v.nombre)}</span>`).join("")}</div>` : ""}
    ${{ mes: calMes, semana: calSemana, dia: calDia }[cal.vista]()}
  </div>
  <p class="t-secundario">${cal.vista === "mes" ? "Cada día muestra sus pedidos, las ventas y una barra con la parte de cada vendedor. Hacé clic en un día para ver el detalle. " : cal.vista === "semana" ? "Cada tarjeta muestra los pedidos de un vendedor día por día. Tocá un día para ver el detalle. " : ""}La maqueta tiene pedidos de los últimos ${DIAS_CON_DATOS} días.</p>`;
}

function vistaReportes() {
  return `<div class="cabecera"><div><h1 class="t-pagina">Reportes</h1><p class="t-secundario">Ventas y pedidos de todos los vendedores.</p></div>
      <button class="btn outline push" type="button" data-accion="abrir-exportar">${icono("bajar")}Exportar</button></div>
    <div class="filtros">
      ${tabs("Vista del reporte", "reporte", [["resumen", "Resumen"], ["calendario", "Calendario"]], vistaReporte)}
      ${vistaReporte === "resumen" ? selectorPeriodo() : ""}
    </div>
    ${vistaReporte === "resumen" ? vistaResumen() : vistaCalendario()}`;
}

/* ============================ Exportar ============================ */
// Un solo diálogo arma todos los reportes: cada botón "Exportar" de la app lo abre con lo que se está viendo ya elegido.
// En la versión real conviene generarlos en el servidor (mismo cálculo para el CSV, un .xlsx o un envío por correo).
const REPORTES = [
  ["vendedores", "Ventas por vendedor", "Una fila por vendedor: ventas, pedidos, ticket promedio, cancelados, parte del total y variación."],
  ["tiempo", "Ventas en el tiempo", "Ventas y pedidos de cada vendedor por día, semana o mes, para ver la evolución."],
  ["productos", "Ventas por producto", "Unidades y ventas de cada producto, del más al menos vendido."],
  ["mix", "Productos por vendedor", "Qué vende cada vendedor: unidades y ventas de cada producto en su tienda."],
  ["detalle", "Detalle de pedidos", "Un renglón por producto de cada pedido. Sirve de base para armar tablas dinámicas propias."],
  ["pendientes", "Pedidos por confirmar", "Los pedidos que siguen sin confirmar y cuántas horas llevan esperando."],
];
const PERIODOS_EXPORT = [["hoy", "Hoy"], ["d7", "Últimos 7 días"], ["d30", "Últimos 30 días"], ["semana", "Esta semana"], ["mes", "Este mes"], ["mesPasado", "El mes pasado"], ["fechas", "Entre dos fechas"]];
const iso = f => `${f.getFullYear()}-${dosCifras(f.getMonth() + 1)}-${dosCifras(f.getDate())}`;
const deIso = t => new Date(t + "T00:00");
const fechaLarga = f => f.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
const decimal = n => n.toFixed(1).replace(".", ",");
const PRIMER_DIA = masDias(HOY, -(DIAS_CON_DATOS - 1));
const ex = { tipo: "vendedores", periodo: "d30", vendedor: "todos", grupo: "dia", desde: iso(masDias(HOY, -29)), hasta: iso(HOY) };

// Período elegido como [desde, hasta], recortado a los días que tienen datos.
function rangoExport() {
  const mes = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  let [desde, hasta] = {
    hoy: [HOY, HOY], d7: [masDias(HOY, -6), HOY], d30: [masDias(HOY, -29), HOY], semana: [lunesDe(HOY), HOY], mes: [mes, HOY],
    mesPasado: [new Date(mes.getFullYear(), mes.getMonth() - 1, 1), masDias(mes, -1)],
    fechas: [deIso(ex.desde || iso(HOY)), deIso(ex.hasta || iso(HOY))],
  }[ex.periodo];
  if (desde > hasta) [desde, hasta] = [hasta, desde];
  return [desde < PRIMER_DIA ? PRIMER_DIA : desde, hasta > HOY ? HOY : hasta];
}

function armarReporte() {
  const [desde, hasta] = rangoExport(), a = diasAtras(hasta), b = diasAtras(desde) + 1;   // pedidos con a <= dia < b
  const vs = ex.vendedor === "todos" ? vendedores : [vendedor(ex.vendedor)];
  const enRango = pedidos.filter(p => p.dia >= a && p.dia < b);
  const lista = enRango.filter(p => ex.vendedor === "todos" || p.vendedor === ex.vendedor), validos = lista.filter(p => p.estado !== "Cancelado");
  const cancelados = l => l.filter(p => p.estado === "Cancelado").length;
  const estado = p => p.estado === "Pendiente" ? "Por confirmar" : p.estado;
  const dia = p => masDias(HOY, -p.dia);
  let lineas = [];

  if (ex.tipo === "vendedores") {
    const total = resumen(enRango).ventas, hayPrevio = b + (b - a) <= DIAS_CON_DATOS;   // el período anterior, de igual duración
    lineas = [["Vendedor", "Zona", "Ventas", "Parte del total %", "Pedidos", "Ticket promedio", "Pedidos cancelados", "Cancelados %", "Por confirmar", "Ventas período anterior", "Variación %", "Datos completos"],
      ...vs.map(v => {
        const suyos = lista.filter(p => p.vendedor === v.id), r = resumen(suyos);
        const antes = hayPrevio ? resumen(pedidos.filter(p => p.vendedor === v.id && p.dia >= b && p.dia < b + (b - a))).ventas : null;
        return [v.nombre, v.zona, r.ventas, total ? decimal(r.ventas / total * 100) : "", r.pedidos, Math.round(r.ticket), cancelados(suyos), decimal(r.cancelacion), r.pendientes,
          antes ?? "", antes ? decimal((r.ventas - antes) / antes * 100) : "", v.conexion === "ok" ? "Sí" : "No: sin conexión desde " + v.ultimaLectura];
      })];
  }
  if (ex.tipo === "tiempo") {
    const clave = f => ex.grupo === "dia" ? iso(f) : ex.grupo === "semana" ? iso(lunesDe(f)) : iso(f).slice(0, 7);
    const rotulo = k => ex.grupo === "dia" ? fechaLarga(deIso(k)) : ex.grupo === "semana" ? "Semana del " + fechaLarga(deIso(k))
      : mayuscula(deIso(k + "-01").toLocaleDateString("es-AR", { month: "long", year: "numeric" }));
    const porClave = {};
    lista.forEach(p => (porClave[clave(dia(p)) + "|" + p.vendedor] ||= []).push(p));
    // Se recorren todos los días del rango, así los períodos sin pedidos salen en cero en vez de faltar
    const claves = [...new Set(Array.from({ length: b - a }, (_, k) => clave(masDias(desde, k))))];
    lineas = [["Período", "Vendedor", "Pedidos", "Ventas", "Ticket promedio", "Pedidos cancelados"],
      ...claves.flatMap(k => vs.map(v => { const l = porClave[k + "|" + v.id] || [], r = resumen(l); return [rotulo(k), v.nombre, r.pedidos, r.ventas, Math.round(r.ticket), cancelados(l)]; }))];
  }
  if (ex.tipo === "productos" || ex.tipo === "mix") {
    const porVendedor = ex.tipo === "mix", acum = {};
    validos.forEach(p => p.items.forEach(i => {
      const x = acum[(porVendedor ? p.vendedor + "|" : "") + i.sku] ||= { v: p.vendedor, sku: i.sku, nombre: i.nombre, unidades: 0, ventas: 0, pedidos: 0, tiendas: new Set() };
      x.unidades += i.cantidad; x.ventas += i.precio * i.cantidad; x.pedidos++; x.tiendas.add(p.vendedor);
    }));
    const filas = Object.values(acum).sort((x, y) => y.ventas - x.ventas), total = filas.reduce((t, x) => t + x.ventas, 0);
    lineas = porVendedor
      ? [["Vendedor", "SKU", "Producto", "Unidades", "Ventas", "Pedidos", "Parte de las ventas del vendedor %"],
          ...vs.flatMap(v => { const suyas = filas.filter(x => x.v === v.id), t = suyas.reduce((n, x) => n + x.ventas, 0);
            return suyas.map(x => [v.nombre, x.sku, x.nombre, x.unidades, x.ventas, x.pedidos, decimal(x.ventas / t * 100)]); })]
      : [["SKU", "Producto", "Unidades", "Ventas", "Pedidos", "Precio promedio", "Parte de las ventas %", "Vendedores que lo vendieron"],
          ...filas.map(x => [x.sku, x.nombre, x.unidades, x.ventas, x.pedidos, Math.round(x.ventas / x.unidades), decimal(x.ventas / total * 100), x.tiendas.size])];
  }
  if (ex.tipo === "detalle") lineas = [["Pedido", "Fecha", "Hora", "Vendedor", "Zona", "Cliente", "Teléfono", "Entrega", "Dirección", "Pago", "Estado", "SKU", "Producto", "Cantidad", "Precio unitario", "Subtotal", "Total del pedido"],
    ...lista.flatMap(p => { const v = vendedor(p.vendedor); return p.items.map(i =>
      [p.numero, fechaLarga(dia(p)), horaDe(p), v.nombre, v.zona, p.cliente, tel(p.telefono), p.entrega, p.direccion ?? "", p.pago, estado(p), i.sku, i.nombre, i.cantidad, i.precio, i.precio * i.cantidad, p.total]); })];
  if (ex.tipo === "pendientes") lineas = [["Pedido", "Fecha", "Hora", "Horas esperando", "Pasó el límite", "Vendedor", "Cliente", "Teléfono", "Entrega", "Total"],
    ...lista.filter(p => p.estado === "Pendiente").sort((x, y) => espera(y) - espera(x))
      .map(p => [p.numero, fechaLarga(dia(p)), horaDe(p), decimal(espera(p) / 60), tarde(p) ? "Sí" : "No", vendedor(p.vendedor).nombre, p.cliente, tel(p.telefono), p.entrega, p.total])];

  const nombre = [{ vendedores: "ventas-por-vendedor", tiempo: "ventas-por-" + ex.grupo, productos: "ventas-por-producto", mix: "productos-por-vendedor", detalle: "detalle-de-pedidos", pendientes: "pedidos-por-confirmar" }[ex.tipo],
    iso(desde), iso(hasta), ...(ex.vendedor === "todos" ? [] : [ex.vendedor])].join("_") + ".csv";
  return { lineas, nombre, desde, hasta, pedidos: lista.length };
}

// Refleja el estado en el diálogo: campos que aplican y qué va a traer el archivo.
function reflejarExportar() {
  $("exp-campo-desde").hidden = $("exp-campo-hasta").hidden = ex.periodo !== "fechas";
  $("exp-campo-grupo").hidden = ex.tipo !== "tiempo";
  const r = armarReporte(), n = r.lineas.length - 1;
  $("exp-descargar").disabled = n < 1;
  $("exp-resumen").textContent = n < 1 ? "No hay datos para ese período y vendedor."
    : `${plural(n, "renglón", "renglones")} · ${plural(r.pedidos, "pedido", "pedidos")} · ${+r.desde === +r.hasta ? fechaLarga(r.desde) : `del ${fechaLarga(r.desde)} al ${fechaLarga(r.hasta)}`}`;
}
function abrirExportar(inicial = {}) {
  Object.assign(ex, inicial);
  // autofocus va en la opción elegida: es donde arranca el teclado al abrir
  $("exp-tipos").innerHTML = REPORTES.map(([k, nombre, ayuda]) => `<label class="opcion"><input type="radio" name="exp-tipo" value="${k}"${k === ex.tipo ? " checked autofocus" : ""}>
    <span><b>${nombre}</b><span class="t-secundario">${ayuda}</span></span></label>`).join("");
  $("exp-periodo").innerHTML = PERIODOS_EXPORT.map(([k, t]) => `<option value="${k}"${k === ex.periodo ? " selected" : ""}>${t}</option>`).join("");
  $("exp-vendedor").innerHTML = `<option value="todos">Todos los vendedores</option>` + vendedores.map(v => `<option value="${esc(v.id)}"${v.id === ex.vendedor ? " selected" : ""}>${esc(v.nombre)}</option>`).join("");
  $("exp-grupo").value = ex.grupo;
  for (const k of ["desde", "hasta"]) Object.assign($("exp-" + k), { min: iso(PRIMER_DIA), max: iso(HOY), value: ex[k] });
  reflejarExportar();
  $("dlg-exportar").showModal();
}
// Desde el calendario se propone exportar justo lo que se está viendo (ese mes, esa semana o ese día).
function exportarLoVisible() {
  const lunes = lunesDe(cal.ref), [desde, hasta] = cal.vista === "mes" ? [new Date(cal.ref.getFullYear(), cal.ref.getMonth(), 1), new Date(cal.ref.getFullYear(), cal.ref.getMonth() + 1, 0)]
    : cal.vista === "semana" ? [lunes, masDias(lunes, 6)] : [cal.ref, cal.ref];
  const dentro = f => iso(f < PRIMER_DIA ? PRIMER_DIA : f > HOY ? HOY : f);
  return { tipo: cal.vista === "dia" ? "detalle" : "tiempo", grupo: "dia", periodo: "fechas", vendedor: "todos", desde: dentro(desde), hasta: dentro(hasta) };
}
$("dlg-exportar").addEventListener("change", e => {
  if (e.target.name === "exp-tipo") ex.tipo = e.target.value;
  else if (e.target.dataset.ex) ex[e.target.dataset.ex] = e.target.value;
  reflejarExportar();
});
$("exp-descargar").addEventListener("click", () => {
  const r = armarReporte();
  descargarCSV(r.nombre, r.lineas);
  registrar("Exportó el reporte " + REPORTES.find(x => x[0] === ex.tipo)[1], ex.vendedor === "todos" ? null : ex.vendedor);
  $("dlg-exportar").close();
  avisar("Reporte descargado: " + r.nombre);
});

/* ============================ Configuración ============================ */
const sw = (clave, marcado, etiqueta) => `<input class="switch" type="checkbox" switch role="switch"${marcado ? " checked" : ""} aria-label="${etiqueta}" data-switch="${clave}">`;
const sel = (clave, opciones) => `<span class="select" style="min-width:230px"><select data-cfg="${clave}">${opciones.map(([v, t]) => `<option value="${v}"${String(cfg[clave]) === String(v) ? " selected" : ""}>${t}</option>`).join("")}</select></span>`;
const numero = (clave, sufijo, etiqueta) => `<label class="con-sufijo"><input class="input" data-cfg="${clave}" value="${String(cfg[clave]).replace(".", ",")}" inputmode="decimal" aria-label="${etiqueta}"><i>${sufijo}</i></label>`;
const fila = (titulo, ayuda, control) => `<div class="ajuste"><div><b>${titulo}</b><span class="t-secundario">${ayuda}</span></div>${control}</div>`;

// El logo se reduce a 128 px antes de guardarlo, para que pese poco.
function leerLogo(archivo) {
  return new Promise((listo, error) => {
    const img = new Image();
    img.onload = () => {
      const L = 128, lienzo = document.createElement("canvas"), e = Math.min(L / img.width, L / img.height);
      lienzo.width = lienzo.height = L;
      lienzo.getContext("2d").drawImage(img, (L - img.width * e) / 2, (L - img.height * e) / 2, img.width * e, img.height * e);
      URL.revokeObjectURL(img.src);
      listo(lienzo.toDataURL("image/png"));
    };
    img.onerror = error;
    img.src = URL.createObjectURL(archivo);
  });
}

let cfgTab = "vendedores", filtroActividad = "todos";
const CFG_TABS = [["vendedores", "Vendedores"], ["alertas", "Alertas"], ["avisos", "Avisos"], ["usuarios", "Usuarios"], ["actividad", "Actividad"]];

function cfgVendedores() {
  // Cada vendedor tiene un color distinto: las tintas que ya usa otro quedan deshabilitadas.
  const usadoPor = (c, v) => vendedores.find(x => x !== v && colorPaleta(x) === c);
  return `<section class="bloque"><header class="con-accion"><div><h2 class="t-seccion">Vendedores</h2><p class="t-secundario">Conexión con cada tienda y cómo se la identifica en tarjetas, gráficos y calendario. Además del color, cada vendedor lleva sus iniciales o su logo.</p></div>
      <button class="btn primary sm" type="button" data-accion="alta-vendedor">${icono("sumar")}Agregar vendedor</button></header>
    <div class="ajustes">${vendedores.map(v => `<div class="ajuste identidad">
      <div class="quien">${avatar(v)}<div><b>${esc(v.nombre)}</b><span class="t-secundario">${esc(v.zona)}</span></div></div>
      <div class="conexion-v">${badgeConexion(v)}<span class="t-secundario">${v.conexion === "ok" ? `Leída ${hace(v.lecturaMin)}` : `${MOTIVO_CAIDA} · ${esc(v.ultimaLectura)}`}</span></div>
      <span class="muestra push" style="gap:6px">
        <button class="btn outline sm" type="button" data-accion="probar" data-v="${esc(v.id)}">Probar conexión</button>
        <button class="btn ghost sm" type="button" data-accion="cambiar-clave" data-v="${esc(v.id)}">Cambiar clave</button>
        <button class="btn ghost sm t-destructivo" type="button" data-accion="baja-vendedor" data-v="${esc(v.id)}">Dar de baja</button>
      </span>
      <div class="identidad-fila">
        <div class="colores-v" role="group" aria-label="Color de ${esc(v.nombre)}">
          ${PALETA.map(c => { const otro = usadoPor(c, v); return `<button class="tinta" type="button" style="background:${c}" data-color="${c}" data-v="${esc(v.id)}" aria-pressed="${colorPaleta(v) === c}" aria-label="Color ${c}${otro ? ", en uso" : ""}"${otro ? ` disabled data-tip="Lo usa ${esc(otro.nombre)}"` : ""}></button>`; }).join("")}
        </div>
        <label class="btn outline sm">${v.logo ? "Cambiar logo" : "Subir logo"}<input type="file" accept="image/*" hidden data-logo="${esc(v.id)}"></label>
        ${v.logo ? `<button class="btn ghost sm" type="button" data-accion="quitar-logo" data-v="${esc(v.id)}">Quitar logo</button>` : ""}
        <label class="campo-linea push"><span class="t-secundario">WhatsApp</span><input class="input" type="tel" inputmode="tel" data-tel="${esc(v.id)}" value="${esc(tel(v.telefono))}" aria-label="WhatsApp de ${esc(v.nombre)}"></label>
      </div>
    </div>`).join("")}</div>
    <p class="t-secundario">En esta maqueta los cambios se guardan solo en este navegador.</p></section>`;
}

function vistaConfiguracion() {
  const paneles = {
    vendedores: cfgVendedores,
    // Antes eran dos pestañas ("Qué se compara" y "Reglas"); son la misma decisión: cuándo algo genera una alerta.
    alertas: () => `${Object.entries(GRUPOS).map(([g, nombre]) => `<section class="bloque"><header><h2 class="t-seccion"><i class="sev s${g}"></i>${nombre}</h2>
        <p class="t-secundario">${{ 1: "Van primero en la lista y en la página Hoy.", 2: "Después de precio y stock.", 3: "Al final de cada grupo." }[g]}</p></header>
      <div class="ajustes">${CAMPOS.filter(c => c[2] === +g).map(([c, ayuda]) => fila(c, ayuda, sw("campo:" + c, cfg.campos[c], "Alertar por " + c))).join("")}
        ${g === "1" ? fila("Tolerancia de precio", "Diferencias menores a este porcentaje no generan alerta. Útil para redondeos.", numero("tolerancia", "%", "Tolerancia de precio en porcentaje")) : ""}</div></section>`).join("")}
    <section class="bloque"><header><h2 class="t-seccion">Lectura de catálogos</h2></header>
      <div class="ajustes">
        ${fila("Volver a leer los catálogos", "Además de cuando Pedix avisa de un cambio, por si algún aviso no llega.",
          sel("releer", [["15", "Cada 15 minutos"], ["60", "Cada hora"], ["360", "Cada 6 horas"], ["1440", "Una vez al día"]]))}
        ${fila("Marcar una tienda sin conexión", "Horas sin poder leerla antes de marcarla y dejar de mostrar sus datos de hoy.", numero("horasSinConexion", "h", "Horas sin conexión"))}
      </div></section>
    <section class="bloque"><header><h2 class="t-seccion">Ignorar y posponer</h2></header>
      <div class="ajustes">
        ${fila("Una diferencia ignorada vuelve a alertar", "Cuánto dura la decisión de ignorar un campo.",
          sel("vigencia", [["master", "Cuando cambia el valor"], ["30", "A los 30 días"], ["nunca", "Nunca"]]))}
        ${fila("Posponer dura", "Días que una diferencia pospuesta queda sin alertar.", numero("posponerDias", "d", "Días de posponer"))}
      </div></section>`,
    avisos: () => `<section class="bloque"><header><h2 class="t-seccion">Avisos fuera de la app</h2><p class="t-secundario">Para enterarse sin tener el gestor abierto.</p></header>
      <div class="ajustes">
        ${fila("Pedido sin confirmar", `Avisa cuando un pedido lleva más de este tiempo esperando. También es el límite que lo resalta en rojo.`, `<span class="muestra">${numero("umbralEspera", "h", "Horas de espera")}${sw("avisoPedidos", cfg.avisoPedidos, "Avisar por pedidos sin confirmar")}</span>`)}
        ${fila("Tienda sin conexión", `Avisa cuando una tienda queda marcada sin conexión (${cfg.horasSinConexion} h sin poder leerla).`, sw("avisoConexion", cfg.avisoConexion, "Avisar por tienda sin conexión"))}
        ${fila("Canal", "Por dónde llegan esos dos avisos.", sel("canal", [["whatsapp", "WhatsApp"], ["email", "Correo"], ["ambos", "WhatsApp y correo"]]))}
        ${fila("A quién", "Quién los recibe.", sel("destino", [["todos", "Todos los usuarios de Operación"], ...usuarios.map(u => [u.id, u.nombre])]))}
        ${fila("Resumen diario por correo", "Un correo por día con las alertas sin resolver.", sw("resumenEmail", cfg.resumenEmail, "Resumen diario por correo"))}
        ${fila("Correo de destino", "A dónde llega el resumen.", `<input class="input" style="width:260px" type="email" name="email" autocomplete="email" data-cfg="email" value="${esc(cfg.email)}" placeholder="nombre@ejemplo.com" aria-label="Correo de destino">`)}
      </div></section>
    <section class="bloque"><header><h2 class="t-seccion">Mensajes al vendedor</h2><p class="t-secundario">Salen por WhatsApp al contacto de cada tienda. Se pueden editar antes de enviar.</p></header>
      <label class="campo"><span>Por diferencias de catálogo</span>
        <textarea class="input" data-cfg="plantilla">${esc(cfg.plantilla)}</textarea>
        <span class="t-secundario">Se reemplazan {contacto}, {vendedor} y {diferencias}.</span></label>
      <label class="campo"><span>Por un pedido sin confirmar</span>
        <textarea class="input" style="min-height:96px" data-cfg="plantillaPedido">${esc(cfg.plantillaPedido)}</textarea>
        <span class="t-secundario">Se reemplazan {contacto}, {vendedor}, {pedido}, {cliente}, {total} y {espera}.</span></label>
    </section>`,
    usuarios: () => `<section class="bloque"><header class="con-accion"><div><h2 class="t-seccion">Usuarios</h2><p class="t-secundario">Quién entra al gestor y qué puede hacer.</p></div>
        <button class="btn primary sm" type="button" data-accion="invitar">${icono("sumar")}Invitar usuario</button></header>
      <div class="ajustes">${usuarios.map(u => `<div class="ajuste">
        <div class="quien"><span class="avatar">${esc(iniciales(u.nombre))}</span><div><b>${esc(u.nombre)}${u.id === YO ? ' <span class="badge secondary">Vos</span>' : ""}</b><span class="t-secundario">${esc(u.email)} · ${u.visto ? "activo " + hace(u.visto) : "activo ahora"}</span></div></div>
        <span class="select" style="min-width:170px"><select data-rol="${esc(u.id)}" aria-label="Rol de ${esc(u.nombre)}"${u.id === YO ? " disabled" : ""}>${ROLES.map(([k, t]) => `<option value="${k}"${u.rol === k ? " selected" : ""}>${t}</option>`).join("")}</select></span>
      </div>`).join("")}</div>
      <dl class="roles">${ROLES.map(([, t, ayuda]) => `<div><dt>${t}</dt><dd class="t-secundario">${ayuda}</dd></div>`).join("")}</dl></section>`,
    actividad: () => `<section class="bloque"><header class="con-accion"><div><h2 class="t-seccion">Actividad</h2><p class="t-secundario">Quién avisó, ignoró, tomó o cambió algo, y cuándo.</p></div>
        <span class="select" style="min-width:190px"><select data-actividad aria-label="Filtrar por persona">
          <option value="todos">Todas las personas</option>${[...usuarios.map(u => [u.id, u.nombre]), ["sistema", "Sistema"]].map(([k, t]) => `<option value="${k}"${k === filtroActividad ? " selected" : ""}>${t}</option>`).join("")}</select></span></header>
      ${listaActividad(actividad.filter(x => filtroActividad === "todos" || x.quien === filtroActividad))}</section>`,
  };
  return `<div class="cabecera"><div><h1 class="t-pagina">Configuración</h1>
      <p class="t-secundario">Los cambios se aplican al instante y se pueden deshacer desde el aviso que aparece abajo.</p></div></div>
    <div class="config">
      ${tabs("Secciones de configuración", "cfgtab", CFG_TABS, cfgTab, "vertical")}
      <div class="panel-config">${paneles[cfgTab]()}</div>
    </div>`;
}

/* ============================ Navegación ============================ */
const PAGINAS = { hoy: "Hoy", alertas: "Alertas", pedidos: "Pedidos", vendedores: "Vendedores", reportes: "Reportes", configuracion: "Configuración" };
function ruta() {
  const [pagina, id, tab] = location.hash.slice(1).split("/");
  if (pagina === "vendedor" && vendedor(id)) return { pagina: "ficha", v: vendedor(id), tab: FICHA_TABS.some(t => t[0] === tab) ? tab : "resumen" };
  return { pagina: pagina in PAGINAS ? pagina : "hoy" };
}

// En una fila de tabs que se desplaza, la elegida queda a la vista (el repintado vuelve el scroll a cero).
function centrarTabs() {
  document.querySelectorAll(".tabs").forEach(t => {
    const b = t.querySelector('[aria-pressed="true"]');
    if (b && t.scrollWidth > t.clientWidth) t.scrollLeft += b.getBoundingClientRect().left - t.getBoundingClientRect().left - (t.clientWidth - b.offsetWidth) / 2;
  });
}

// Frescura de los datos, siempre visible en la barra: hace cuánto se leyó y si alguna tienda quedó afuera.
function pintarFrescura() {
  const caidos = sinConexion().length;
  $("frescura").innerHTML = `<span class="punto${caidos ? " rojo" : ""}"></span><span><span class="largo">Última lectura </span>${hace(lecturaMin)}${caidos ? ` <span class="t-destructivo">· ${caidos} sin conexión</span>` : ""}</span>${icono("releer")}`;
  $("frescura").setAttribute("aria-label", `Última lectura ${hace(lecturaMin)}${caidos ? `, ${plural(caidos, "tienda", "tiendas")} sin conexión` : ""}. Volver a leer ahora`);
}
function pintarCuentas() {
  const cuentas = { alertas: abiertas().length, pedidos: pendientes().length };
  document.querySelectorAll("[data-cuenta]").forEach(b => { b.textContent = cuentas[b.dataset.cuenta]; b.hidden = !cuentas[b.dataset.cuenta]; });
}

function pintar(animar = false) {
  const r = ruta(), nav = r.pagina === "ficha" ? "vendedores" : r.pagina;
  const html = r.pagina === "ficha" ? vistaFicha(r.v, r.tab) : { hoy: vistaHoy, alertas: vistaAlertas, pedidos: vistaPedidos, vendedores: vistaVendedores, reportes: vistaReportes, configuracion: vistaConfiguracion }[r.pagina]();
  $("contenido").innerHTML = `<div class="pagina"${animar ? "" : ' style="animation:none"'}>${html}</div>`;
  centrarTabs(); aplicarTablaHoy();
  $("miga").innerHTML = r.pagina === "ficha" ? `<a href="#vendedores">Vendedores</a> / <b>${esc(r.v.nombre)}</b>` : `<b>${PAGINAS[r.pagina]}</b>`;
  // En la barra inferior, "Más" queda marcado cuando la página actual vive en ese menú
  document.querySelectorAll("[data-nav]").forEach(a => a.dataset.nav === nav || (a.dataset.nav === "mas" && ["reportes", "configuracion"].includes(nav)) ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  pintarCuentas(); pintarFrescura();
  if ($("dlg-filtros").open) pintarFiltros();
  document.title = `${r.pagina === "ficha" ? r.v.nombre : PAGINAS[r.pagina]} · Gestor de vendedores`;
}
addEventListener("hashchange", () => { pintar(true); document.querySelector("main").scrollTo(0, 0); scrollTo(0, 0); });
telefono.addEventListener("change", () => pintar());
setInterval(() => { lecturaMin++; vendedores.forEach(v => v.lecturaMin++); pintarFrescura(); }, 6e4);

/* ============================ Acciones ============================ */
// Releer las tiendas. Cierra el ciclo de las alertas: lo que se avisó y ya está corregido se resuelve solo.
function comprobar() {
  lecturaMin = 0;
  const resueltas = alertas.filter(a => a.aviso && sinResolver(a).length && vendedor(a.vendedor).conexion === "ok");
  vendedores.forEach(v => { if (v.conexion === "ok") v.lecturaMin = 0; });
  resueltas.forEach(a => { a.resuelta = true; actividad.unshift({ t: Date.now(), quien: "sistema", texto: `Se resolvió sola al releer: ${a.producto}`, vendedor: a.vendedor }); });
  const caidos = sinConexion();
  pintar();
  avisar((resueltas.length ? `Lectura hecha. Se resolvió sola: ${resueltas.map(a => `${a.producto} (${vendedor(a.vendedor).nombre})`).join(", ")}.` : "Lectura hecha: sin cambios.")
    + (caidos.length ? ` ${caidos.map(v => v.nombre).join(", ")} sigue sin conexión.` : ""),
    resueltas.length ? () => resueltas.forEach(a => { a.resuelta = false; }) : undefined);
}

function confirmar(titulo, texto, boton, alAceptar) {
  $("conf-titulo").textContent = titulo; $("conf-texto").textContent = texto; $("conf-si").textContent = boton;
  $("dlg-confirmar").onclose = () => { if ($("dlg-confirmar").returnValue === "si") alAceptar(); };
  $("dlg-confirmar").returnValue = "";
  $("dlg-confirmar").showModal();
}

document.addEventListener("click", e => {
  const tinta = e.target.closest("[data-color]");
  if (tinta) { personalizar(tinta.dataset.v, { color: tinta.dataset.color }); return pintar(); }
  const diaCal = e.target.closest("[data-cal-dia]");
  if (diaCal) { cal.vista = "dia"; cal.ref = new Date(+diaCal.dataset.calDia); return pintar(); }
  const renglon = e.target.closest("[data-pedido]");
  if (renglon && !e.target.closest("a")) return abrirPedido(pedidos[renglon.dataset.pedido]);
  const tab = e.target.closest(".tabs button");
  if (tab) {
    const dato = tab.dataset;
    if (dato.medida) medida = dato.medida;
    if (dato.reporte) vistaReporte = dato.reporte;
    if (dato.cfgtab) cfgTab = dato.cfgtab;
    if (dato.calVista) cal.vista = dato.calVista;
    if (dato.alEstado) { al.estado = dato.alEstado; al.cerrados = null; }
    if (dato.alVista) { al.vista = dato.alVista; al.cerrados = null; }
    if (dato.periodo) { periodo = dato.periodo; pf.pagina = 1; pf.mostrados = 10; }
    if (dato.fichatab) return location.hash = `vendedor/${ruta().v.id}/${dato.fichatab}`;
    if (dato.movil) {   // no se repinta: recargaría la tienda embebida
      vistaMovil = dato.movil === "1";
      $("marco").classList.toggle("movil", vistaMovil);
      tab.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === tab));
      return;
    }
    return pintar();
  }
  const irTab = e.target.closest("[data-fichatab]");
  if (irTab) return location.hash = `vendedor/${ruta().v.id}/${irTab.dataset.fichatab}`;
  const b = e.target.closest("[data-accion]");
  if (!b) return;
  const accion = b.dataset.accion, a = alertas[b.dataset.a], c = a?.campos[b.dataset.c], v = vendedor(b.dataset.v);

  // --- Alertas ---
  if (accion === "ignorar") { c.ignorado = true; registrar(`Ignoró hasta que cambie: ${c.campo} de ${a.producto}`, a.vendedor); pintar(); return avisar(`${c.campo}: ignorado hasta que cambie el valor`, () => { c.ignorado = false; }); }
  if (accion === "posponer") { c.pospuesto = cfg.posponerDias; registrar(`Pospuso ${cfg.posponerDias} días: ${c.campo} de ${a.producto}`, a.vendedor); pintar(); return avisar(`${c.campo}: pospuesto hasta el ${fechaEn(cfg.posponerDias)}`, () => { c.pospuesto = 0; }); }
  if (accion === "alertar") { c.ignorado = false; c.pospuesto = 0; registrar(`Volvió a alertar: ${c.campo} de ${a.producto}`, a.vendedor); pintar(); return avisar(`${c.campo}: vuelve a alertarse`); }
  if (accion === "tomar") {
    const era = a.tomada; a.tomada = era === YO ? null : YO;
    registrar(`${a.tomada ? "Tomó" : "Soltó"} la alerta de ${a.producto}`, a.vendedor); pintar();
    return avisar(a.tomada ? "La tomaste: los demás ven que la estás resolviendo" : "La soltaste", () => { a.tomada = era; });
  }
  if (accion === "avisar") return abrirAviso([{ v: vendedor(a.vendedor), alertas: [a], texto: mensajeAlertas(vendedor(a.vendedor), [a]) }]);
  if (accion === "avisar-vendedor") { const suyas = alertasDe(v.id); return abrirAviso([{ v, alertas: suyas, texto: mensajeAlertas(v, suyas) }]); }
  if (accion === "avisar-producto") return abrirAviso(abiertas().filter(x => x.sku === b.dataset.sku).map(x => ({ v: vendedor(x.vendedor), alertas: [x], texto: mensajeAlertas(vendedor(x.vendedor), [x]) })));
  if (accion === "comprobar") return comprobar();
  if (accion === "salir") return cerrarSesion();
  if (accion === "probar") {
    registrar("Probó la conexión", v.id);
    return avisar(v.conexion === "ok" ? `Conexión correcta con ${v.nombre}` : `${v.nombre} sigue sin responder: ${MOTIVO_CAIDA.toLowerCase()}. Hace falta una clave nueva.`);
  }
  if (accion === "ver-producto") { Object.assign(al, { vista: "producto", vendedor: "todos", tipo: "todos", estado: "abiertas" }); al.cerrados = new Set(CATALOGO.map(x => "p:" + x[0]).filter(k => k !== "p:" + b.dataset.sku)); return location.hash = "alertas"; }
  if (accion === "ver-alertas") { Object.assign(al, { vista: "vendedor", vendedor: b.dataset.v, estado: "abiertas", tipo: "todos", cerrados: new Set() }); return location.hash = "alertas"; }

  // --- Pedidos ---
  if (accion === "ver-pendientes") { Object.assign(pf, { vendedor: "todos", estado: "Pendiente", orden: "espera", q: "", pagina: 1, mostrados: 10 }); if (periodo === "hoy") periodo = "d7"; return ruta().pagina === "pedidos" ? pintar() : location.hash = "pedidos"; }
  if (accion === "ver-pedidos") { Object.assign(pf, { vendedor: b.dataset.v, estado: "todos", q: "", pagina: 1, mostrados: 10 }); return location.hash = "pedidos"; }
  if (accion === "abrir-filtros") { pintarFiltros(); return $("dlg-filtros").showModal(); }
  if (accion === "limpiar-filtros") { Object.assign(pf, { vendedor: "todos", estado: "todos", orden: "recientes", pagina: 1, mostrados: 10 }); return pintar(); }
  if (accion === "cargar-mas") { pf.mostrados += 10; return $("lista-pedidos").innerHTML = listaPedidos(); }
  if (accion === "tomar-pedido") {
    const p = pedidoAbierto; p.tomado = p.tomado === YO ? null : YO;
    registrar(`${p.tomado ? "Tomó" : "Soltó"} el pedido ${p.numero}`, p.vendedor); pintar(); return abrirPedido(p);
  }
  if (accion === "avisar-pedido") { const p = pedidoAbierto; return abrirAviso([{ v: vendedor(p.vendedor), pedido: p, texto: mensajePedido(p) }]); }
  if (accion === "pagina-antes" || accion === "pagina-despues") {   // se repinta solo la lista y el foco sigue en la paginación
    pf.pagina += accion === "pagina-antes" ? -1 : 1;
    $("lista-pedidos").innerHTML = listaPedidos();
    return ($("lista-pedidos").querySelector(`[data-accion="${accion}"]:enabled`) || $("lista-pedidos").querySelector(".paginacion .btn:enabled"))?.focus();
  }

  // --- Exportar: todos los botones abren el mismo diálogo, con lo que se está viendo ya elegido ---
  if (accion === "abrir-exportar") return abrirExportar(b.dataset.v ? { tipo: "tiempo", grupo: "dia", vendedor: b.dataset.v, periodo }
    : vistaReporte === "calendario" ? exportarLoVisible() : { tipo: "vendedores", vendedor: "todos", periodo });
  if (accion === "exportar-indicadores") return abrirExportar({ tipo: "vendedores", vendedor: "todos", periodo });
  if (accion === "exportar-pedidos") return abrirExportar({ tipo: pf.estado === "Pendiente" ? "pendientes" : "detalle", vendedor: pf.vendedor, periodo });

  // --- Configuración ---
  if (accion === "quitar-logo") personalizar(b.dataset.v, { logo: null });
  if (accion === "alta-vendedor") { $("form-vendedor").reset(); $("alta-prueba").textContent = ""; return $("dlg-vendedor").showModal(); }
  if (accion === "cambiar-clave") return avisar("En la versión real se abre un campo para pegar la clave nueva y probarla antes de guardar.");
  if (accion === "baja-vendedor") return confirmar(`¿Dar de baja a ${v.nombre}?`, "Se deja de leer su tienda y sale de las colas de trabajo. Sus pedidos y su historial se conservan en los reportes. Se puede reactivar después.", "Dar de baja",
    () => { registrar("Dio de baja la tienda (simulado)", v.id); avisar("En la maqueta la baja no se aplica: quedó registrada en Actividad."); });
  if (accion === "invitar") return avisar("En la versión real se pide correo y rol, y se envía una invitación.");
  if (accion === "cal-hoy") cal.ref = new Date(HOY);
  if (accion === "cal-antes" || accion === "cal-despues") {
    const paso = accion === "cal-antes" ? -1 : 1;
    cal.ref = cal.vista === "mes" ? new Date(cal.ref.getFullYear(), cal.ref.getMonth() + paso, 1) : masDias(cal.ref, cal.vista === "semana" ? 7 * paso : paso);
  }
  pintar();
});

// Refleja un cambio de configuración, avisa y ofrece deshacerlo.
function cambiarCfg(clave, valor, texto) {
  const campo = clave.startsWith("campo:") ? clave.slice(6) : null, antes = campo ? cfg.campos[campo] : cfg[clave];
  if (campo) cfg.campos[campo] = valor; else cfg[clave] = valor;
  registrar(texto);
  pintar();
  avisar(texto, () => { if (campo) cfg.campos[campo] = antes; else cfg[clave] = antes; });
}

document.addEventListener("change", e => {
  const t = e.target, dato = t.dataset;
  if (t.closest("#dlg-exportar, #dlg-vendedor")) return;
  if (dato.al) { al[dato.al] = t.value; al.cerrados = null; return pintar(); }
  if (dato.switch) {
    const clave = dato.switch, campo = clave.startsWith("campo:") ? clave.slice(6) : null;
    return cambiarCfg(clave, t.checked, campo ? `${campo}: ${t.checked ? "vuelve a alertar" : "ya no alerta"}` : `${t.getAttribute("aria-label")}: ${t.checked ? "activado" : "desactivado"}`);
  }
  if (dato.logo) {
    const id = dato.logo, archivo = t.files[0];
    if (archivo) leerLogo(archivo).then(logo => { personalizar(id, { logo }); pintar(); avisar("Logo actualizado"); }, () => avisar("No se pudo leer esa imagen"));
    return;
  }
  if (dato.tel) { const digitos = t.value.replace(/\D/g, ""); if (digitos.length < 10) { t.value = tel(vendedor(dato.tel).telefono); return avisar("Ese número parece incompleto"); } vendedor(dato.tel).telefono = digitos; return avisar("WhatsApp actualizado"); }
  if (dato.rol) { const u = usuario(dato.rol), antes = u.rol; u.rol = t.value; registrar(`Cambió el rol de ${u.nombre} a ${ROLES.find(r => r[0] === u.rol)[1]}`); return avisar(`${u.nombre} ahora es ${ROLES.find(r => r[0] === u.rol)[1]}`, () => { u.rol = antes; }); }
  if ("actividad" in dato) { filtroActividad = t.value; return pintar(); }
  if (dato.pf) { const k = dato.pf; pf[k] = k === "porPagina" ? +t.value : t.value; pf.pagina = 1; pf.mostrados = 10; return pintar(); }
  const clave = dato.cfg;
  if (!clave) return;
  if (["tolerancia", "horasSinConexion", "umbralEspera", "posponerDias"].includes(clave)) {
    const valor = Math.max(0, parseFloat(t.value.replace(",", ".")) || 0), n = () => abiertas().length;
    cambiarCfg(clave, valor, { tolerancia: `Tolerancia de precio: ${String(valor).replace(".", ",")} %`, horasSinConexion: `Sin conexión a las ${valor} h`, umbralEspera: `Límite de espera: ${valor} h`, posponerDias: `Posponer dura ${valor} días` }[clave]);
    if (clave === "tolerancia") $("toast").firstElementChild.textContent += `. ${plural(n(), "producto alerta", "productos alertan")} ahora`;
    return;
  }
  if (["plantilla", "plantillaPedido", "email"].includes(clave)) { cfg[clave] = t.value; return avisar("Guardado"); }
  cambiarCfg(clave, t.value, `${t.closest(".ajuste")?.querySelector("b")?.textContent ?? "Configuración"}: ${t.selectedOptions?.[0]?.textContent ?? t.value}`);
});

// La búsqueda repinta solo la lista, para no perder el foco del campo mientras se escribe.
document.addEventListener("input", e => {
  if (e.target.id !== "buscar-pedido") return;
  pf.q = e.target.value; pf.pagina = 1; pf.mostrados = 10;
  $("lista-pedidos").innerHTML = listaPedidos();
});

// "toggle" no burbujea: se escucha en la fase de captura.
document.addEventListener("toggle", e => {
  const m = e.target;
  // Grupos de alertas: se recuerda cuáles quedaron cerrados para que el repintado no los vuelva a abrir
  if (m.matches?.("details[data-grupo]")) return void (al.cerrados ??= new Set())[m.open ? "delete" : "add"](m.dataset.grupo);
}, true);

/* ---------- Diálogos ---------- */
$("dlg-copiar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("dlg-texto").value); }
  catch { $("dlg-texto").select(); document.execCommand("copy"); }
  avisoHecho("copia");
});
$("dlg-whatsapp").addEventListener("click", () => {
  $("dlg-whatsapp").href = whatsapp(colaAviso[0].v.telefono, $("dlg-texto").value);   // con lo que se haya editado
  setTimeout(() => avisoHecho("WhatsApp"));
});
$("dlg-aviso").addEventListener("close", () => { colaAviso = []; if (pedidoAbierto && $("dlg-pedido").open) abrirPedido(pedidoAbierto); });
$("dlg-pedido").addEventListener("close", () => { pedidoAbierto = null; });

// Alta de vendedor: no se agrega sin probar antes la conexión con su tienda.
let altaProbada = false;
$("alta-probar").addEventListener("click", () => {
  const f = $("form-vendedor"), ok = f.tienda.validity.valid && f.clave.value.trim().length >= 6;
  altaProbada = ok;
  $("alta-prueba").className = "estado-prueba " + (ok ? "bien" : "mal");
  $("alta-prueba").innerHTML = ok ? `${icono("ok")}Conexión correcta: se leyeron ${CATALOGO.length} productos.` : `${icono("aviso")}No se pudo leer la tienda. Revisá la dirección y la clave.`;
});
$("dlg-vendedor").addEventListener("click", e => { if (e.target.closest("[data-cerrar]")) $("dlg-vendedor").close(); });
$("form-vendedor").addEventListener("submit", e => {
  const f = e.target;
  if (!altaProbada) { e.preventDefault(); $("alta-prueba").className = "estado-prueba mal"; return $("alta-prueba").innerHTML = `${icono("aviso")}Probá la conexión antes de agregarlo.`; }
  const id = f.nombre.value.trim().toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vendedor-" + vendedores.length;
  if (vendedor(id)) { e.preventDefault(); return $("alta-prueba").innerHTML = `${icono("aviso")}Ya hay un vendedor con ese nombre.`; }
  vendedores.push({ id, nombre: f.nombre.value.trim(), zona: f.zona.value.trim(), conexion: "ok", lecturaMin: 0, contacto: "", telefono: f.telefono.value.replace(/\D/g, "") || "5493510000000",
    ultimoNumero: 0, n: { hoy: 0, d7: 0, d30: 0, previos: 0 }, color: PALETA.find(c => !vendedores.some(x => colorPaleta(x) === c)) || "#888888", tienda: f.tienda.value, admin: ADMIN });
  registrar("Agregó la tienda", id);
  altaProbada = false;
  setTimeout(() => { pintar(); avisar(`${f.nombre.value.trim()} agregado. La primera lectura completa tarda unos minutos.`); });
});

/* ---------- Ayuda al pasar el cursor: una sola burbuja para gráficos, textos cortados y estados ---------- */
const tip = $("tip");
function mostrarTip(el) {
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
  tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, innerWidth - t.width - 8)) + "px";
  tip.style.top = (r.top - t.height - 8 < 8 ? r.bottom + 8 : r.top - t.height - 8) + "px";
}
document.addEventListener("pointerover", e => { const el = e.target.closest?.("[data-tip]"); if (el && e.pointerType !== "touch") mostrarTip(el); else tip.hidden = true; });
document.addEventListener("focusin", e => { const el = e.target.closest?.("[data-tip]"); if (el?.matches(":focus-visible")) mostrarTip(el); });
document.addEventListener("focusout", () => { tip.hidden = true; });
document.addEventListener("scroll", () => { tip.hidden = true; }, true);

/* ---------- Sesión ---------- */
const raiz = document.documentElement;
function abrirSesion(recordar) {
  try { (recordar ? localStorage : sessionStorage).setItem("demo-vendedores:sesion", "1"); } catch {}
  raiz.dataset.sesion = "si";
  registrar("Inició sesión");
  if (location.hash.slice(1)) location.hash = "hoy"; else pintar(true);
}
function cerrarSesion() {
  try { localStorage.removeItem("demo-vendedores:sesion"); sessionStorage.removeItem("demo-vendedores:sesion"); } catch {}
  document.querySelectorAll(":popover-open").forEach(p => p.hidePopover());
  document.querySelectorAll("dialog[open]").forEach(dlg => dlg.close());
  registrar("Cerró sesión");
  raiz.dataset.sesion = "no";
  $("login-estado").textContent = "Cerraste la sesión.";
  $("clave").value = "";
  $("email").focus();
}
$("form-login").addEventListener("submit", e => {
  e.preventDefault();   // los campos vacíos o un correo mal escrito los frena el navegador (required, type=email)
  abrirSesion($("recordar").checked);
});
$("ver-clave").addEventListener("click", e => {
  const ver = $("clave").type === "password";
  $("clave").type = ver ? "text" : "password";
  e.currentTarget.setAttribute("aria-pressed", ver);
  e.currentTarget.innerHTML = icono(ver ? "ojo-no" : "ojo");
});
$("olvide").addEventListener("click", () => { $("login-estado").textContent = "En la versión real te llega un enlace al correo para elegir una contraseña nueva."; });

// Tabla de Hoy: ordenar al tocar un título de columna y filtrar al escribir
document.addEventListener("click", e => {
  const boton = e.target.closest("#tabla-hoy .th-orden");
  if (!boton) return;
  const col = boton.parentElement.cellIndex;
  tablaHoy.dir = tablaHoy.col === col && tablaHoy.dir === "ascending" ? "descending" : "ascending";
  tablaHoy.col = col;
  aplicarTablaHoy(true);
});
document.addEventListener("input", e => { if (e.target.id === "buscar-tienda") { tablaHoy.q = e.target.value; aplicarTablaHoy(true); } });

pintar(true);
