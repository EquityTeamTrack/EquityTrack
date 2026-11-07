/** Importación y validación CSV, descarga y sincronización simulada. */
function setData(a, name) {
  data = a;
  source = name;
  filter = "";
  $("department").innerHTML =
    '<option value="">Toda la organización</option>' +
    [...new Set(data.map((r) => r.departamento))]
      .sort()
      .map((x) => `<option value="${esc(x)}">${esc(x)}</option>`)
      .join("");
  render();
}
$("department").onchange = (e) => {
  filter = e.target.value;
  render();
};
function resetDemo() {
  setData(demo(), "Datos ficticios · 192 personas");
  toast("Datos de ejemplo cargados");
}
function download(content, name, type) {
  let url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadCSV() {
  download(
    "\uFEFF" +
      columns.join(",") +
      "\n" +
      demo()
        .map((r) => columns.map((k) => r[k]).join(","))
        .join("\n"),
    "equitytrack-plantilla.csv",
    "text/csv;charset=utf-8",
  );
}
function parse(text) {
  let delim = text.split(/\r?\n/)[0].includes(";") ? ";" : ",",
    out = [],
    row = [],
    field = "",
    q = false;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (c === '"') {
      if (q && text[i + 1] === '"') {
        field += '"';
        i++;
      } else q = !q;
    } else if (c === delim && !q) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !q) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x.trim())) out.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (q) throw Error("Comillas sin cerrar.");
  row.push(field);
  if (row.some((x) => x.trim())) out.push(row);
  let keys = out.shift()?.map((s) => s.replace(/^\uFEFF/, "").trim());
  if (!keys || columns.some((k) => !keys.includes(k)))
    throw Error("Faltan columnas. Usa la plantilla descargable.");
  let ids = new Set(),
    rows = out.map((line, i) => {
      if (line.length !== keys.length)
        throw Error("Número de columnas incorrecto en fila " + (i + 2));
      let r = {};
      keys.forEach((k, j) => (r[k] = line[j].trim()));
      for (let k of columns.filter(
        (k) =>
          !["id", "genero", "departamento", "categoria", "permiso"].includes(k),
      )) {
        if (r[k] === "" || !Number.isFinite(Number(r[k])) || Number(r[k]) < 0)
          throw Error("Número inválido en " + k + ", fila " + (i + 2));
        r[k] = Number(r[k]);
      }
      r.genero = r.genero.toLowerCase();
      r.permiso = r.permiso.toLowerCase();
      if (
        !r.id ||
        ids.has(r.id) ||
        !r.departamento ||
        !r.categoria ||
        !["mujer", "hombre", "otro", "no_declarado"].includes(r.genero) ||
        !["si", "no"].includes(r.permiso) ||
        r.jornada <= 0 ||
        r.jornada > 1 ||
        r.fijo_antes <= 0 ||
        r.responsabilidad_antes > 100 ||
        r.responsabilidad_despues > 100 ||
        !Number.isInteger(r.nivel_antes) ||
        !Number.isInteger(r.nivel_despues) ||
        r.nivel_antes < 1 ||
        r.nivel_despues < 1
      )
        throw Error(
          "Registro inválido o identificador duplicado en fila " + (i + 2),
        );
      ids.add(r.id);
      return r;
    });
  if (!rows.length) throw Error("Archivo sin personas.");
  return rows;
}
async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw Error("El archivo supera 5 MB.");
    let a = parse(await file.text());
    setData(a, file.name);
    toast("Importación completada: " + a.length + " registros");
  } catch (e) {
    $("importStatus").textContent = e.message;
    $("importStatus").classList.add("error");
  }
}
async function syncAPI() {
  $("sync").disabled = true;
  $("syncStatus").textContent = "Conectando al sandbox y validando registros…";
  await new Promise((r) => setTimeout(r, 900));
  let provider = $("provider").value;
  setData(demo(), "API simulada · " + provider);
  $("syncStatus").textContent =
    "Sincronización de datos de ejemplo completada: " +
    data.length +
    " registros.";
  toast("Sandbox sincronizado");
}
