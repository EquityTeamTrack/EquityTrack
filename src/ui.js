/** Componentes compartidos y navegación de las pantallas. */
function statcards(items) {
  return (
    '<div class="grid">' +
    items
      .map(
        ([label, value, detail, red]) =>
          `<div class="card"><div class="label">${label}</div><div class="metric ${red ? "red" : ""}">${value}</div><div class="label">${detail}</div></div>`,
      )
      .join("") +
    "</div>"
  );
}
function table(head, rows) {
  return (
    '<div class="scroll"><table><thead><tr>' +
    head.map((h) => "<th>" + h + "</th>").join("") +
    "</tr></thead><tbody>" +
    (rows.length
      ? rows
          .map(
            (r) =>
              "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>",
          )
          .join("")
      : `<tr><td colspan="${head.length}" class="empty">No hay datos suficientes con este filtro.</td></tr>`) +
    "</tbody></table></div>"
  );
}
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").hidden = false;
  setTimeout(() => ($("toast").hidden = true), 3500);
}
function go(p) {
  page = p;
  render();
  window.scrollTo?.({ top: 0, behavior: "smooth" });
}
function render() {
  let rows = subset(),
    g = groups(rows),
    flags = g.filter((x) => x.flag),
    l = ladder(rows),
    worst = l.filter((x) => x.gap > 0).sort((a, b) => b.gap - a.gap)[0];
  $("orgLabel").textContent = settings.org;
  $("title").textContent = pages[page][1];
  $("subtitle").textContent = pages[page][2];
  $("nav").innerHTML = [
    ["data", "1", "Datos"],
    ["overview", "2", "Resultados"],
    ["actions", "3", "Acciones"],
  ]
    .map(
      ([k, n, label]) =>
        `<button class="${(k === "overview" && ["overview", "risk", "ladder", "leave", "promotion", "reports", "opportunities"].includes(page)) || page === k ? "active" : ""}" onclick="go('${k}')"><span class="stepnum">${n}</span> ${label}</button>`,
    )
    .join("");
  let html = "";
  if (page === "data") {
    html = `<div class="two"><div class="card"><h2>Importar plantilla</h2><p class="muted">CSV anonimizado · un registro por persona · dos momentos comparables.</p><div class="upload"><div style="font-size:28px">⇧</div><h3>Selecciona tu archivo CSV</h3><p class="smalltext muted">UTF-8, coma o punto y coma. Máximo 5 MB.</p><input type="file" id="upload" accept=".csv" onchange="importFile(this.files[0])"></div><p><button class="secondary small" onclick="downloadCSV()">Descargar CSV de ejemplo</button> <button class="secondary small" onclick="resetDemo()">Cargar datos de ejemplo</button></p><p id="importStatus" class="note">${esc(source)} · ${data.length} registros válidos</p></div><div class="card"><h2>Conectar nóminas</h2><p class="muted">Prueba el flujo de una integración API con una nómina ficticia.</p><label>Proveedor</label><select id="provider"><option>Factorial · Sandbox simulado</option><option>Personio · Sandbox simulado</option><option>Nómina propia · Sandbox simulado</option></select><label>Entorno</label><input value="Sandbox · datos ficticios" disabled><p><button id="sync" onclick="syncAPI()">Sincronizar datos de ejemplo</button></p><p id="syncStatus" class="smalltext muted">La conexión está simulada; no solicita credenciales ni llama al proveedor.</p></div></div><div class="card"><h2>Calidad y estructura de los datos</h2><p>Campos obligatorios: <code>${columns.join(", ")}</code></p><p class="note">Género: mujer / hombre / otro / no_declarado. Permiso: si / no. Niveles: enteros desde 1. Jornada: fracción 0–1. Fijo y variable: euros anuales efectivos, normalizados por jornada en el análisis salarial. Responsabilidad: índice interno consistente de 0 a 100. La antigüedad se expresa en años. Categorías: grupos de trabajo de igual valor definidos por la empresa.</p>${table(
      ["Control", "Resultado"],
      [
        [
          "Identificadores únicos",
          new Set(data.map((r) => r.id)).size === data.length
            ? "Correcto"
            : "Revisar",
        ],
        ["Registros", data.length],
        [
          "Cobertura mujeres / hombres",
          data.filter((r) => r.genero === "mujer").length +
            " / " +
            data.filter((r) => r.genero === "hombre").length,
        ],
        [
          "Otros / no declarado",
          data.filter((r) => !["mujer", "hombre"].includes(r.genero)).length +
            " · incluidos en plantilla; fuera del contraste binario",
        ],
      ],
    )}</div>`;
  }
  if (page === "risk") {
    html =
      statcards([
        ["Grupos analizados", g.length, "Departamento × categoría"],
        [
          "Diferencias > 5 %",
          flags.length,
          "No equivalen a una sanción automática",
          true,
        ],
        [
          "Presupuesto de equiparación",
          eur(flags.reduce((s, x) => s + x.cost, 0)),
          "Escenario anual: igualar medias por grupo",
        ],
        [
          "Escenario sancionador",
          eur(settings.max * settings.cases),
          "Techo parametrizado · sin probabilidad asignada",
        ],
      ]) +
      `<div class="card"><div class="row"><h2>Semáforo de riesgo · ${esc(settings.period)}</h2><button class="secondary small" onclick="scenario()">Configurar escenario económico</button></div>${riskTable(g, true)}<p class="smalltext muted">Rojo: diferencia absoluta > 5 %. Ámbar: sin comparación o menos de 5 personas por sexo. Verde: sin señal por umbral. Una brecha negativa favorece a mujeres. Los tamaños pequeños requieren especial cautela.</p></div><div class="card"><h2>Exposición económica: escenario, no multa predicha</h2><p>Si se confirmasen <b>${settings.cases}</b> infracciones del tipo definido por asesoría, el rango configurado sería <b>${eur(settings.min * settings.cases)} – ${eur(settings.max * settings.cases)}</b>. El número de grupos señalados no determina el número de infracciones.</p><p class="note">El artículo 10 de la Directiva (UE) 2023/970 contempla una diferencia de al menos el 5 %, sin justificación objetiva y no subsanada en seis meses para la evaluación conjunta. La sanción depende de la norma nacional, los hechos y su calificación. La escala de referencia española para infracciones laborales muy graves es 7.501–225.018 € (LISOS, art. 40); no se aplica automáticamente a cada brecha.</p></div>`;
  }
  if (page === "ladder") {
    html =
      statcards([
        [
          "Escalón prioritario",
          worst ? "Nivel " + worst.n : "Sin diferencias destacadas",
          "Mayor diferencia de tasas a favor de hombres",
        ],
        [
          "Diferencia de promoción",
          worst ? fmt(worst.gap) + " pp" : "—",
          "Tasa hombres − tasa mujeres",
          true,
        ],
        [
          "Mujeres promocionadas",
          rows.filter(
            (r) => r.genero === "mujer" && r.nivel_despues > r.nivel_antes,
          ).length,
          "Cambio de al menos un nivel",
        ],
        [
          "Hombres promocionados",
          rows.filter(
            (r) => r.genero === "hombre" && r.nivel_despues > r.nivel_antes,
          ).length,
          "Mismo periodo de observación",
        ],
      ]) +
      `<div class="two"><div class="card"><h2>Tasa de promoción por nivel de origen</h2><div class="bars">${l.map((x) => `<div class="barpair"><div class="bar" style="height:${Number.isFinite(x.wr) ? x.wr : 0}%"><span>${fmt(x.wr)}%</span></div><div class="bar ref" style="height:${Number.isFinite(x.mr) ? x.mr : 0}%"><span>${fmt(x.mr)}%</span></div><b>Nivel ${x.n}</b></div>`).join("")}</div><div class="legend">■ Verde: mujeres &nbsp; ■ Azul: hombres</div></div><div class="card"><h2>Interpretación para RR. HH.</h2><p>${worst ? "La mayor diferencia observada está en el nivel " + worst.n + ": " + fmt(worst.wr) + " % de mujeres promociona frente a " + fmt(worst.mr) + " % de hombres." : "No se identifica un diferencial positivo con los datos actuales."}</p><p class="muted">Revisa elegibilidad, oportunidades de proyecto, evaluaciones y criterios de promoción. La asociación observada no demuestra un bloqueo causal.</p><button onclick="newAction('Revisar criterios de promoción')">Crear medida correctora</button></div></div><div class="card">${table(
        [
          "Nivel inicial",
          "Mujeres: suben / total",
          "Hombres: suben / total",
          "Diferencia",
          "Señal",
        ],
        l.map((x) => [
          "Nivel " + x.n,
          x.wp + " / " + x.w.length + " · " + fmt(x.wr) + " %",
          x.mp + " / " + x.m.length + " · " + fmt(x.mr) + " %",
          fmt(x.gap) + " pp",
          x.w.length < 5 || x.m.length < 5
            ? '<span class="pill amber">Muestra insuficiente</span>'
            : worst?.n === x.n
              ? '<span class="pill red">Prioridad</span>'
              : "—",
        ]),
      )}<p class="smalltext muted">Tasa = personas que suben de nivel / personas en el nivel inicial. Comparación por departamento seleccionado. Incluye nivel máximo, que puede carecer de oportunidades de promoción.</p></div>`;
  }
  if (page === "leave") {
    let mt = matched(rows);
    html =
      statcards([
        ["Mujeres con permiso", mt.exposed.length, "Registros del periodo"],
        [
          "Trayectorias comparables",
          mt.pairs.length,
          "Con al menos un control válido",
        ],
        [
          "Sin control comparable",
          mt.unmatched,
          "Excluidas del contraste",
          mt.unmatched > 0,
        ],
        ["Variables monitorizadas", "3", "Fijo · variable · responsabilidad"],
      ]) +
      `<div class="card"><h2>Antes y después del permiso</h2><p class="muted">Control: mujeres sin permiso del mismo departamento, categoría y nivel inicial; antigüedad ±2 años y jornada ±5 puntos. El control puede reutilizarse; se pondera por cada trayectoria expuesta.</p>${leaveTable(rows)}<p class="note">Diferencial = cambio de la cohorte con permiso − cambio de sus controles. Salario y variable se muestran normalizados a jornada completa. El índice de responsabilidad mide tareas con una escala interna, independiente del nivel. Se necesita un periodo comparable alrededor del regreso; este análisis trabaja con dos cortes, no con una serie mensual.</p><button onclick="newAction('Revisar progresión tras permiso parental')">Crear medida de seguimiento</button></div>`;
  }
  if (page === "actions") {
    html = `<div class="row"><p class="muted">Registra el compromiso y revisa su ejecución.</p><button onclick="newAction()">+ Nueva medida</button></div><div class="card">${table(
      ["Medida", "Responsable", "Fecha objetivo", "Estado", ""],
      actions.map((a, i) => [
        esc(a.title),
        esc(a.owner),
        esc(a.date),
        `<select onchange="changeAction(${i},this.value)">${["Pendiente", "En curso", "Completada"].map((s) => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}</select>`,
        `<button class="secondary small" onclick="removeAction(${i})">Eliminar</button>`,
      ]),
    )}</div><p class="note">Las medidas y decisiones se guardan en este navegador. Para evaluar el impacto social: repetir tasas de promoción y diferencias salariales a 6 y 12 meses con cohortes comparables.</p>`;
  }
  if (page === "reports") {
    html = `<div class="two"><div class="card"><span class="pill">EXPEDIENTE DE RR. HH.</span><h2 style="margin-top:16px">Informe de auditoría retributiva</h2><p class="muted">Genera un documento editable con resultados calculados, metodología, decisiones y plan de acción.</p><label>Razón social / organización</label><input id="org" value="${esc(settings.org)}"><label>Periodo comparado</label><input id="period" value="${esc(settings.period)}"><p><button onclick="exportReport()">↓ Descargar informe HTML</button> <button class="secondary" onclick="printReport()">Guardar en PDF</button></p><p class="smalltext muted">El HTML abre en cualquier navegador y puede editarse. PDF abre el diálogo de impresión.</p></div><div class="card"><h2>Contenido del expediente</h2><p>✓ Identificación, alcance y fuente de datos<br>✓ Medias, medianas y diferencias por grupo<br>✓ Tasas de promoción por sexo y nivel<br>✓ Permisos y cohortes de control<br>✓ Revisiones documentadas y medidas<br>✓ Metodología, límites y referencias legales</p><p class="note">Estructura de apoyo a la auditoría. Para presentarlo oficialmente deben completarse valoración de puestos, diagnóstico de causas, consulta con representación laboral, validación y firma profesional. La herramienta no certifica el cumplimiento.</p></div></div>`;
  }
  if (page === "promotion") {
    html = `<div class="two"><div class="card"><span class="pill">ESCENARIO FICTICIO</span><h2 style="margin-top:18px">Propuesta de ascenso · Ingeniería</h2><p class="muted">De nivel Mid a Senior · Requisitos: evaluación ≥ 4/5, competencias ≥ 80/100 y experiencia técnica ≥ 4 años.</p><label>Candidatura propuesta</label><select id="candidate"><option value="h">EMP-P01 · Hombre · 3 meses en la empresa</option><option value="m">EMP-P02 · Mujer · 3 años en la empresa</option></select><p>Ambas personas: evaluación 4,5/5 · competencias 90/100 · experiencia técnica 5 años · mismo rol y nivel.</p><button onclick="checkPromotion()">Revisar antes de confirmar</button></div><div class="card" id="promotionResult"><h2>Revisión de oportunidades</h2><p class="muted">Selecciona una candidatura y comprueba si existen otras personas elegibles que convenga considerar.</p></div></div><p class="note">La antigüedad es contexto, no un criterio automático de mérito. La equivalencia se basa aquí en requisitos explícitos y datos ficticios. RR. HH. debe revisar evidencias y criterios de forma consistente para todas las candidaturas; la herramienta no decide quién asciende.</p>`;
  }
  if (page === "overview") {
    html = `<div class="card welcome"><div class="eyebrow">Tu siguiente paso</div><h2>¿Tuvo la oportunidad de demostrar lo que se le exige?</h2><p>Revisa una evaluación de ascenso junto con sus requisitos, evidencias y asignaciones. Convierte lo pendiente en una acción acordada.</p><button onclick="go('opportunities')">Revisar oportunidades de ascenso →</button></div><div class="card"><h2>Resultados del análisis</h2><p class="muted">Elige qué quieres revisar. En cada análisis encontrarás su explicación y los siguientes pasos.</p><div class="resultlist">${[
      [
        "risk",
        "Salarios",
        flags.length + " grupos con diferencias superiores al 5 %",
      ],
      [
        "ladder",
        "Ascensos",
        worst
          ? "Mayor diferencia en el nivel " + worst.n
          : "Sin diferencias destacadas",
      ],
      [
        "leave",
        "Permisos",
        matched(rows).exposed.length + " mujeres con permiso en el periodo",
      ],
    ]
      .map(
        ([k, title, value]) =>
          `<button class="resultitem" onclick="go('${k}')"><span><b>${title}</b><small>${value}</small></span><span aria-hidden="true">→</span></button>`,
      )
      .join(
        "",
      )}</div></div><div class="row summaryfoot"><span>${actions.filter((a) => a.status === "Completada").length} de ${actions.length} medidas completadas</span><button class="secondary" onclick="go('reports')">Preparar informe</button></div>`;
  }
  let analytical = ["risk", "ladder", "leave", "promotion"].includes(page);
  if (analytical) {
    html =
      `<div class="analysisnav" aria-label="Tipo de análisis">${[
        ["risk", "Salarios"],
        ["ladder", "Ascensos"],
        ["leave", "Permisos"],
      ]
        .map(
          ([k, t]) =>
            `<button class="${page === k || (page === "promotion" && k === "ladder") ? "selected" : ""}" onclick="go('${k}')" ${page === k ? 'aria-current="page"' : ""}>${t}</button>`,
        )
        .join("")}</div>` + html;
    if (page === "ladder")
      html =
        `<div class="analysisnav">${[
          ["risk", "Salarios"],
          ["ladder", "Ascensos"],
          ["leave", "Permisos"],
        ]
          .map(
            ([k, t]) =>
              `<button class="${page === k ? "selected" : ""}" onclick="go('${k}')">${t}</button>`,
          )
          .join(
            "",
          )}</div><div class="promotioncall"><span><b>¿Vas a proponer un ascenso?</b><br>Comprueba si hay otras candidaturas elegibles.</span><button class="secondary" onclick="go('promotion')">Revisar una propuesta</button></div>` +
        html.slice(html.indexOf("</div>") + 6);
  }
  if (page === "data") {
    html =
      `<div class="card"><h2>1. Carga los datos de tu plantilla</h2><p>Para empezar, utiliza los datos de ejemplo o sube el CSV de tu empresa.</p><button onclick="go('overview')">Ver resultados de los datos actuales →</button></div>` +
      html;
  }
  if (page === "actions") {
    html =
      '<p class="note">3. Convierte los resultados en medidas. Añade una persona responsable y una fecha; actualiza el estado cuando avances.</p>' +
      html;
  }
  if (page === "opportunities") html = opportunityView();
  if (page === "actions")
    html =
      `<div class="card"><h2>Medidas de oportunidades de ascenso</h2><p>Consulta las medidas acordadas dentro del expediente, junto con sus evidencias y aportaciones.</p><button onclick="go('opportunities')">Abrir expediente y seguimiento</button></div>` +
      html;
  if (page === "reports")
    html =
      `<div class="card"><h2>Expediente de oportunidades</h2><p>Requisitos, experiencias, aportaciones y medidas de la revisión de ascenso.</p><button onclick="go('opportunities')">Revisar y descargar expediente</button></div>` +
      html;
  $("content").innerHTML = html;
  document.querySelectorAll?.(".workspace > .row select").forEach((el) => {
    el.closest("div").style.display = [
      "risk",
      "ladder",
      "leave",
      "overview",
    ].includes(page)
      ? ""
      : "none";
  });
  if (analytical) {
    document.querySelectorAll?.("#content > .grid").forEach((el) => {
      let d = document.createElement("details");
      d.className = "moremetrics";
      d.innerHTML = "<summary>Ver cifras del análisis</summary>";
      el.before(d);
      d.append(el);
    });
  }
  document.querySelectorAll?.("nav button").forEach((b) => {
    if (b.classList.contains("active")) b.setAttribute("aria-current", "page");
  });
  document.querySelectorAll?.("#content .note").forEach((el) => {
    if (el.textContent.length > 380) {
      let d = document.createElement("details");
      d.className = "method";
      let summary = document.createElement("summary");
      summary.textContent = "Ver criterios y explicación";
      el.before(d);
      d.append(summary, el);
    }
  });
  document.querySelectorAll?.("label").forEach((label) => {
    if (
      !label.htmlFor &&
      label.nextElementSibling?.matches("input,select,textarea")
    ) {
      let input = label.nextElementSibling;
      input.id ||= "field-" + Math.random().toString(36).slice(2);
      label.htmlFor = input.id;
    }
  });
}
