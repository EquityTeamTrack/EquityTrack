/** Estado compartido, configuración y persistencia de decisiones. */
const $ = (x) => document.getElementById(x),
  esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  fmt = (x, d = 1) =>
    Number.isFinite(x)
      ? x.toLocaleString("es-ES", { maximumFractionDigits: d })
      : "—",
  eur = (x) => (Number.isFinite(x) ? fmt(x, 0) + " €" : "—"),
  mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN),
  median = (a) => {
    a = [...a].sort((a, b) => a - b);
    return a.length
      ? (a[Math.floor(a.length / 2)] + a[Math.ceil(a.length / 2) - 1]) / 2
      : NaN;
  };
let page = "overview",
  filter = "",
  data = [],
  source = "Datos ficticios",
  actions = [],
  reviews = {},
  settings = {
    org: "NovaTech",
    period: "2024–2025",
    min: 7501,
    max: 225018,
    cases: 1,
  };
try {
  let saved = JSON.parse(localStorage.getItem("equilibria-v1"));
  if (saved) {
    actions = saved.actions || [];
    reviews = saved.reviews || {};
    settings = { ...settings, ...saved.settings };
  }
} catch {}
function save() {
  try {
    localStorage.setItem(
      "equilibria-v1",
      JSON.stringify({ actions, reviews, settings }),
    );
  } catch {}
}
const pages = {
  overview: ["◫", "Inicio", "2. Revisa las diferencias y decide dónde actuar."],
  data: [
    "⇅",
    "Cargar datos",
    "1. Carga la plantilla y elige la fuente de datos.",
  ],
  risk: ["◉", "Salarios", "Prioriza diferencias y documenta su revisión."],
  ladder: ["↗", "Ascensos", "Encuentra dónde se frena la progresión femenina."],
  leave: [
    "⏱",
    "Después de un permiso",
    "Observa qué cambia después del regreso.",
  ],
  actions: [
    "✓",
    "Plan de acción",
    "Asigna medidas, responsables y fechas de seguimiento.",
  ],
  promotion: [
    "⚑",
    "Revisar promoción",
    "Comprueba alternativas antes de confirmar una propuesta.",
  ],
  opportunities: [
    "◎",
    "Oportunidades de ascenso",
    "Revisa los requisitos, las evidencias y el acceso a experiencias.",
  ],
  reports: [
    "▤",
    "Informes",
    "Genera el expediente de diagnóstico retributivo.",
  ],
};
const columns = [
  "id",
  "genero",
  "departamento",
  "categoria",
  "nivel_antes",
  "nivel_despues",
  "fijo_antes",
  "fijo_despues",
  "variable_antes",
  "variable_despues",
  "responsabilidad_antes",
  "responsabilidad_despues",
  "permiso",
  "antiguedad",
  "jornada",
];
