// Compartido por index.html y componentes.html: tema claro/oscuro y sidebar colapsable.
// Se carga en el <head>, después del <meta name="color-scheme">, para aplicar lo guardado antes de pintar.
(() => {
  const raiz = document.documentElement;
  // Todo lo que se guarda lleva prefijo, para no pisarse con otra app publicada en el mismo dominio.
  const PREFIJO = "demo-vendedores:";
  const leer = k => { try { return localStorage.getItem(PREFIJO + k); } catch { return null; } };
  const guardar = (k, v) => { try { v === null ? localStorage.removeItem(PREFIJO + k) : localStorage.setItem(PREFIJO + k, v); } catch {} };

  // Tema: tres opciones (según el sistema, claro, oscuro). Sin nada guardado la página sigue al sistema
  // (lo resuelve el CSS, sin JavaScript); "light" o "dark" se guardan solo cuando el usuario los fija.
  const sistemaOscuro = matchMedia("(prefers-color-scheme: dark)");
  let tema = leer("tema");
  function aplicarTema() {
    if (tema === "light" || tema === "dark") raiz.dataset.theme = tema; else delete raiz.dataset.theme;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = raiz.dataset.theme || "light dark";
    reflejarTema();
  }
  const TEMAS = [["sistema", "Según el sistema", "sistema"], ["light", "Claro", "sol"], ["dark", "Oscuro", "luna"]];
  const usar = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  function elegirTema(t) {
    tema = t === "light" || t === "dark" ? t : null;   // "sistema" = dejar de fijarlo
    guardar("tema", tema);
    aplicarTema();
  }
  // El botón de la barra muestra el tema elegido; el menú marca la opción y dice qué pide hoy el sistema.
  function reflejarTema() {
    const b = document.getElementById("tema"), m = document.getElementById("menu-tema");
    if (!b) return;
    const actual = tema === "light" || tema === "dark" ? tema : "sistema", [, nombre, dibujo] = TEMAS.find(t => t[0] === actual);
    b.innerHTML = usar(dibujo);
    b.setAttribute("aria-label", "Tema: " + nombre.toLowerCase());
    b.title = "Tema: " + nombre.toLowerCase();
    if (m) m.innerHTML = "<p>Tema</p>" + TEMAS.map(([k, t, d]) => `<button type="button" class="menu-op linea" data-tema="${k}" aria-pressed="${k === actual}">${usar(d)}<span>${t}${k === "sistema" ? `<small>Ahora: ${sistemaOscuro.matches ? "oscuro" : "claro"}</small>` : ""}</span></button>`).join("");
  }
  function armarMenuTema() {
    const b = document.getElementById("tema");
    if (!Object.hasOwn(HTMLElement.prototype, "popover")) {   // sin popover: el botón alterna entre claro y oscuro
      return b.addEventListener("click", () => elegirTema((raiz.dataset.theme || (sistemaOscuro.matches ? "dark" : "light")) === "dark" ? "light" : "dark"));
    }
    const m = document.createElement("div");
    m.className = "menu"; m.id = "menu-tema";
    m.setAttribute("popover", "auto"); m.setAttribute("role", "group"); m.setAttribute("aria-label", "Tema de la interfaz");
    document.body.append(m);
    b.setAttribute("popovertarget", "menu-tema");
    m.addEventListener("click", e => { const o = e.target.closest("[data-tema]"); if (o) { elegirTema(o.dataset.tema); m.hidePopover(); } });
    sistemaOscuro.addEventListener("change", reflejarTema);
    reflejarTema();
  }
  aplicarTema();

  // En pantallas angostas el menú es un popover que se abre desde la barra (mismo ancho que el CSS: 51.25em).
  // Sin soporte de popover no se marca nada y el menú queda en línea, como respaldo.
  const angosta = matchMedia("(max-width: 51.25em)");
  const hayPopover = Object.hasOwn(HTMLElement.prototype, "popover");
  if (hayPopover) raiz.dataset.menu = "popover";   // desde el <head>: evita que el menú se vea en línea antes de adaptarlo
  const menuMovil = () => hayPopover && angosta.matches;
  function adaptarMenu() {
    const s = document.getElementById("sidebar");
    // popovertarget hace que el propio botón abra y cierre el menú; con setAttribute, no con la propiedad.
    // También lo abre "Más", de la barra inferior del teléfono.
    const botones = [document.getElementById("alternar-sidebar"), ...document.querySelectorAll("[data-abre-menu]")];
    if (menuMovil()) { s.setAttribute("popover", "auto"); botones.forEach(b => b.setAttribute("popovertarget", "sidebar")); }
    else { s.removeAttribute("popover"); botones.forEach(b => b.removeAttribute("popovertarget")); }
    reflejar();
  }

  raiz.dataset.sidebar = leer("sidebar") || "abierto";
  function alternarSidebar() {
    if (menuMovil()) return;                        // en angosto lo maneja popovertarget
    raiz.dataset.sidebar = raiz.dataset.sidebar === "colapsado" ? "abierto" : "colapsado";
    guardar("sidebar", raiz.dataset.sidebar);
    reflejar();
  }
  function reflejar() {
    const b = document.getElementById("alternar-sidebar"), s = document.getElementById("sidebar");
    if (menuMovil()) {
      const abierto = s.matches(":popover-open");
      b.setAttribute("aria-expanded", abierto);
      b.title = (abierto ? "Cerrar" : "Abrir") + " el menú";
      s.querySelectorAll(".grupo a").forEach(a => a.removeAttribute("title"));
      return;
    }
    const colapsado = raiz.dataset.sidebar === "colapsado";
    b.setAttribute("aria-expanded", !colapsado);
    b.title = (colapsado ? "Mostrar" : "Ocultar") + " el menú (Ctrl + B)";
    // Colapsado solo quedan los iconos: el nombre de cada página pasa a ser su texto de ayuda
    document.querySelectorAll(".sidebar .grupo a").forEach(a => colapsado ? a.title = a.firstElementChild.nextSibling.textContent.trim() : a.removeAttribute("title"));
  }

  // Tablas apilables: cada celda guarda el título de su columna, que el CSS muestra cuando la tabla se apila.
  function etiquetarTablas() {
    document.querySelectorAll("table.apilable").forEach(tabla => {
      const titulos = [...tabla.querySelectorAll("thead th")].map(th => th.textContent.trim());
      tabla.querySelectorAll("tbody tr").forEach(tr => [...tr.children].forEach((td, k) => td.dataset.th = titulos[k] || ""));
    });
  }

  // Tabs que se desplazan: el CSS difumina el borde que tiene más opciones con una animación ligada al scroll.
  // Donde eso no existe, se observa la primera y la última tab y se marca el borde con una clase.
  function insinuarScroll() {
    if (CSS.supports("animation-timeline", "scroll()")) return;
    document.querySelectorAll(".tabs:not([data-observada])").forEach(fila => {
      const primera = fila.firstElementChild, ultima = fila.lastElementChild;
      if (!primera) return;
      fila.dataset.observada = "";
      const o = new IntersectionObserver(cambios => cambios.forEach(c =>
        fila.classList.toggle(c.target === primera ? "mas-inicio" : "mas-fin", c.intersectionRatio < 1)), { root: fila, threshold: 1, rootMargin: "1px" });
      o.observe(primera);
      if (ultima !== primera) o.observe(ultima);
    });
  }

  // Si el tema se cambia en otra pestaña, esta lo sigue.
  addEventListener("storage", e => { if (e.key === PREFIJO + "tema") { tema = e.newValue; aplicarTema(); } });

  addEventListener("DOMContentLoaded", () => {
    armarMenuTema();
    // Donde no hay anchor positioning, cada menú se ubica a mano debajo de su botón (o arriba si no entra).
    // "toggle" no burbujea: se escucha en la fase de captura.
    document.addEventListener("toggle", e => {
      const m = e.target;
      if (!m.matches?.(".menu[popover]") || e.newState !== "open" || CSS.supports("position-area", "block-end")) return;
      const boton = document.querySelector(`[popovertarget="${CSS.escape(m.id)}"]`);
      if (!boton) return;
      const t = boton.getBoundingClientRect(), r = m.getBoundingClientRect();
      m.style.top = (t.bottom + r.height + 8 <= innerHeight ? t.bottom : t.top - r.height - 8) + "px";
      m.style.left = Math.max(8, Math.min(t.left, innerWidth - r.width - 8)) + "px";
    }, true);
    document.getElementById("alternar-sidebar").addEventListener("click", alternarSidebar);
    addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); alternarSidebar(); } });
    const menu = document.getElementById("sidebar");
    menu.addEventListener("toggle", reflejar);
    // Los enlaces del menú navegan dentro de la misma página: hay que cerrarlo a mano al elegir uno
    menu.addEventListener("click", e => { if (e.target.closest("a") && menu.hasAttribute("popover")) menu.hidePopover(); });
    angosta.addEventListener("change", adaptarMenu);
    adaptarMenu();
    etiquetarTablas(); insinuarScroll();
    new MutationObserver(() => { etiquetarTablas(); insinuarScroll(); }).observe(document.body, { childList: true, subtree: true });   // la app repinta las tablas
  });
})();
