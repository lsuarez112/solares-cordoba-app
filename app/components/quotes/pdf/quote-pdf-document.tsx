/**
 * PDF del presupuesto (A4) con @react-pdf/renderer. Se carga con import() dinámico
 * desde lib/quotes/quote-pdf.ts para no sumar la librería al bundle inicial.
 *
 * Paginación: encabezado, encabezado de la tabla y pie se repiten en cada hoja
 * (`fixed`); las filas no se parten (`wrap={false}`) y los totales tampoco.
 */
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { GRID_TYPE_LABELS } from "~/lib/products/grid-type.utils"
import { dmy, rateSourceLabel, type QuoteDocument } from "~/lib/quotes/quote-document"

// Sin guionado: las descripciones cortan por palabra.
Font.registerHyphenationCallback((word) => [word])

const PRIMARY = "#1a6ac0"
const MUTED = "#6b6b6b"
const BORDER = "#d9d9d9"
const ZEBRA = "#f6f7f9"

const usd = (v: number) => v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ars = (v: number) => `$ ${Math.round(v).toLocaleString("es-AR")}`
const qty = (v: number) => v.toLocaleString("es-AR", { maximumFractionDigits: 2 })

const COLS = {
  code: "12%",
  desc: "40%",
  qty: "8%",
  unit: "13%",
  sub: "13%",
  ars: "14%",
} as const

const s = StyleSheet.create({
  page: {
    paddingTop: 112,
    paddingBottom: 64,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f1f1f",
  },
  header: {
    position: "absolute",
    top: 28,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY,
  },
  headerLeft: { flexDirection: "row", gap: 10, maxWidth: "60%" },
  logo: { maxHeight: 48, maxWidth: 120, objectFit: "contain" },
  companyName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8, color: MUTED, lineHeight: 1.35 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: PRIMARY, letterSpacing: 1 },
  docNumber: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 2 },
  draftTag: { marginTop: 3, fontSize: 7.5, color: "#a15c00", fontFamily: "Helvetica-Bold" },
  watermark: {
    position: "absolute",
    top: 380,
    left: 70,
    fontSize: 90,
    color: "#000000",
    opacity: 0.05,
    transform: "rotate(-30deg)",
    fontFamily: "Helvetica-Bold",
  },
  blocks: { flexDirection: "row", gap: 12, marginBottom: 14 },
  block: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 8 },
  blockTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  kv: { flexDirection: "row", justifyContent: "space-between", marginTop: 1.5 },
  table: { borderWidth: 1, borderColor: BORDER },
  th: { flexDirection: "row", backgroundColor: PRIMARY, color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 8 },
  tr: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: BORDER },
  cell: { paddingVertical: 4, paddingHorizontal: 5 },
  right: { textAlign: "right" },
  totals: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalsBox: { width: "52%", borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 8 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  totalsHead: { flexDirection: "row", justifyContent: "space-between", color: MUTED, fontSize: 7.5 },
  grand: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  label: { width: "32%" },
  num: { width: "34%", textAlign: "right" },
  notes: { marginTop: 14, borderLeftWidth: 2, borderLeftColor: PRIMARY, paddingLeft: 8 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 7.5,
    color: MUTED,
  },
})

function Header({ doc }: { doc: QuoteDocument }) {
  const c = doc.company
  const location = [c?.address, c?.city, c?.province].filter(Boolean).join(", ")
  const contact = [c?.phone, c?.email, c?.website].filter(Boolean).join(" · ")
  return (
    <View style={s.header} fixed>
      <View style={s.headerLeft}>
        {doc.logo ? <Image src={doc.logo} style={s.logo} /> : null}
        <View>
          <Text style={s.companyName}>{c?.name ?? ""}</Text>
          {c?.legal_name && c.legal_name !== c.name ? <Text style={s.small}>{c.legal_name}</Text> : null}
          {c?.tax_id ? <Text style={s.small}>CUIT {c.tax_id}</Text> : null}
          {location ? <Text style={s.small}>{location}</Text> : null}
          {contact ? <Text style={s.small}>{contact}</Text> : null}
        </View>
      </View>
      <View style={s.headerRight}>
        <Text style={s.docTitle}>PRESUPUESTO</Text>
        <Text style={s.docNumber}>N.º {doc.number}</Text>
        <Text style={s.small}>Fecha {dmy(doc.date)}</Text>
        {doc.validUntil ? <Text style={s.small}>Válido hasta {dmy(doc.validUntil)}</Text> : null}
        {doc.isDraft ? <Text style={s.draftTag}>BORRADOR · PRECIOS SUJETOS A CONFIRMACIÓN</Text> : null}
      </View>
    </View>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.kv}>
      <Text style={{ color: MUTED }}>{label}</Text>
      <Text style={s.strong}>{value}</Text>
    </View>
  )
}

function TotalsRow({ label, usdValue, arsValue, grand = false }: { label: string; usdValue: string; arsValue: string; grand?: boolean }) {
  return (
    <View style={grand ? s.grand : s.totalsRow}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.num}>{usdValue}</Text>
      <Text style={s.num}>{arsValue}</Text>
    </View>
  )
}

export function QuotePdfDocument({ doc }: { doc: QuoteDocument }) {
  const rate = doc.rate?.usd_ars ?? null
  const t = doc.totals
  const sys = doc.system
  const clientLines = [
    doc.client.cuit ? `CUIT ${doc.client.cuit}` : null,
    [doc.client.address, doc.client.city].filter(Boolean).join(", ") || null,
    [doc.client.phone, doc.client.email].filter(Boolean).join(" · ") || null,
  ].filter((l): l is string => Boolean(l))

  return (
    <Document title={`Presupuesto ${doc.number}`} author={doc.company?.name ?? undefined} language="es-AR">
      <Page size="A4" style={s.page}>
        <Header doc={doc} />
        {doc.isDraft ? (
          <Text style={s.watermark} fixed>
            BORRADOR
          </Text>
        ) : null}

        {/* Cliente y resumen técnico (primera hoja) */}
        <View style={s.blocks} wrap={false}>
          <View style={s.block}>
            <Text style={s.blockTitle}>Cliente</Text>
            <Text style={[s.strong, { fontSize: 10.5 }]}>{doc.client.name}</Text>
            {clientLines.map((l) => (
              <Text key={l} style={s.small}>
                {l}
              </Text>
            ))}
            {doc.seller ? <Text style={[s.small, { marginTop: 4 }]}>Vendedor: {doc.seller}</Text> : null}
          </View>
          <View style={s.block}>
            <Text style={s.blockTitle}>Resumen técnico</Text>
            <KV label="Sistema" value={sys.grid_type ? GRID_TYPE_LABELS[sys.grid_type] : "—"} />
            {sys.kwp ? <KV label="Potencia" value={`${sys.kwp.toLocaleString("es-AR")} kWp`} /> : null}
            {sys.generation_kwh_month ? (
              <KV
                label="Generación estimada"
                value={`~${Math.round(sys.generation_kwh_month).toLocaleString("es-AR")} kWh/mes`}
              />
            ) : null}
            {sys.battery_kwh ? <KV label="Batería" value={`${sys.battery_kwh.toLocaleString("es-AR")} kWh`} /> : null}
            {sys.kit_name ? <Text style={[s.small, { marginTop: 3 }]}>{sys.kit_name}</Text> : null}
          </View>
        </View>

        {/* Ítems: el encabezado se repite en cada hoja */}
        <View style={s.table}>
          <View style={s.th} fixed>
            <Text style={[s.cell, { width: COLS.code }]}>Código</Text>
            <Text style={[s.cell, { width: COLS.desc }]}>Descripción</Text>
            <Text style={[s.cell, s.right, { width: COLS.qty }]}>Cant.</Text>
            <Text style={[s.cell, s.right, { width: COLS.unit }]}>Unit. USD</Text>
            <Text style={[s.cell, s.right, { width: COLS.sub }]}>Subt. USD</Text>
            <Text style={[s.cell, s.right, { width: COLS.ars }]}>Subt. ARS</Text>
          </View>
          {doc.items.map((item, i) => (
            <View key={`${item.code}-${i}`} style={i % 2 === 1 ? [s.tr, { backgroundColor: ZEBRA }] : s.tr} wrap={false}>
              <Text style={[s.cell, { width: COLS.code, fontSize: 8 }]}>{item.code}</Text>
              <Text style={[s.cell, { width: COLS.desc }]}>{item.description}</Text>
              <Text style={[s.cell, s.right, { width: COLS.qty }]}>{qty(item.qty)}</Text>
              <Text style={[s.cell, s.right, { width: COLS.unit }]}>{usd(item.unit_price_usd)}</Text>
              <Text style={[s.cell, s.right, { width: COLS.sub }]}>{usd(item.subtotal_usd)}</Text>
              <Text style={[s.cell, s.right, { width: COLS.ars }]}>{rate ? ars(item.subtotal_usd * rate) : "—"}</Text>
            </View>
          ))}
        </View>

        {/* Totales (no se parten entre hojas) */}
        <View style={s.totals} wrap={false}>
          <View style={s.totalsBox}>
            <View style={s.totalsHead}>
              <Text style={s.label}> </Text>
              <Text style={s.num}>USD</Text>
              <Text style={s.num}>ARS</Text>
            </View>
            <TotalsRow label="Subtotal" usdValue={usd(t.subtotal_usd)} arsValue={rate ? ars(t.subtotal_usd * rate) : "—"} />
            <TotalsRow
              label={t.iva_pct > 0 ? `IVA ${t.iva_pct.toLocaleString("es-AR")} %` : "Sin IVA"}
              usdValue={usd(t.iva_usd)}
              arsValue={rate ? ars(t.iva_usd * rate) : "—"}
            />
            <TotalsRow grand label="Total" usdValue={usd(t.total_usd)} arsValue={t.total_ars != null ? ars(t.total_ars) : "—"} />
            <Text style={[s.small, { marginTop: 5 }]}>
              {doc.rate
                ? `Cotización USD: $ ${doc.rate.usd_ars.toLocaleString("es-AR")} (${rateSourceLabel(doc.rate.source)}${
                    doc.rate.date ? `, ${dmy(doc.rate.date)}` : ""
                  })`
                : "Sin cotización del dólar cargada."}
            </Text>
          </View>
        </View>

        {doc.clientNotes ? (
          <View style={s.notes} wrap={false}>
            <Text style={s.blockTitle}>Observaciones</Text>
            <Text style={{ lineHeight: 1.4 }}>{doc.clientNotes}</Text>
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text style={{ flex: 1, lineHeight: 1.35 }}>{doc.footer ?? ""}</Text>
          <Text render={({ pageNumber, totalPages }) => `${doc.number} · Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
