/** Revisión participativa. Python guarda el expediente; sin servidor se permite explorar un ejemplo local. */
const opportunitySeed = {
  id: "career-001",
  person: "Profesional ET-042 · caso ficticio",
  role: "Desarrolladora · Ingeniería",
  current_level: "Mid",
  target_level: "Sénior",
  current_band: "40.000–52.000 € brutos/año",
  target_band: "52.000–68.000 € brutos/año",
  evaluation:
    "Revisión pendiente: contrastar funciones objetivo y oportunidades de organización del trabajo.",
  criteria: [
    {
      id: "design",
      title: "Formación y conocimientos del puesto",
      requirement:
        "Acreditar conocimientos técnicos pertinentes y formación relacionada con las funciones objetivo.",
      evidence: [
        {
          description:
            "Diseño del servicio de notificaciones; acta de revisión técnica disponible.",
          author: "Responsable",
          verified: true,
        },
      ],
      opportunities: [
        {
          description: "Diseñar el servicio de notificaciones",
          status: "completada",
          context: "Asignación registrada en el plan de proyecto.",
        },
      ],
      source_reference: "Art. 11.1 y 11.3; art. 15, área 3.",
      source_url: "https://www.boe.es/eli/es/res/2025/04/04/(10)",
    },
    {
      id: "autonomy",
      title: "Autonomía e iniciativa",
      requirement:
        "Documentar el grado de autonomía e iniciativa en las funciones objetivo y el apoyo disponible.",
      evidence: [
        {
          description:
            "Resolución de incidencias y mantenimiento del servicio durante el último trimestre.",
          author: "Profesional",
          verified: false,
        },
      ],
      opportunities: [],
      source_reference: "Art. 15, grupo C, niveles 1–3.",
      source_url: "https://www.boe.es/eli/es/res/2025/04/04/(10)",
    },
    {
      id: "delivery",
      title: "Organización y seguimiento del trabajo",
      requirement:
        "Revisar la organización de actividades y la coordinación efectivamente requerida por el puesto objetivo.",
      evidence: [],
      opportunities: [
        {
          description: "Solicitud para coordinar la entrega del nuevo buscador",
          status: "no_asignada",
          context:
            "Registro ficticio: la responsable confirmó que se asignó a otra persona por continuidad. Se mantuvieron tareas de apoyo y no se acordó una alternativa.",
        },
      ],
      source_reference:
        "Art. 15, grupo C. Adaptación funcional; no exige dirigir personas a todo perfil técnico.",
      source_url: "https://www.boe.es/eli/es/res/2025/04/04/(10)",
    },
    {
      id: "mentoring",
      title: "Experiencia y contribuciones técnicas",
      requirement:
        "Contrastar experiencia y aportaciones relacionadas con las funciones objetivo, incluyendo mejoras o formación cuando sean pertinentes.",
      evidence: [],
      opportunities: [],
      source_reference:
        "Art. 11.1; art. 15, grupo C. La mentoría no es un requisito universal.",
      source_url: "https://www.boe.es/eli/es/res/2025/04/04/(10)",
    },
  ],
  contributions: [
    {
      description: "Apoyo a incorporaciones y documentación de procedimientos",
      note: "Revisar su alcance y vínculo con los criterios; no etiquetar automáticamente como trabajo poco promocionable.",
    },
  ],
  comments: [],
  actions: [],
  decision: "pendiente",
  decision_reason: "",
  history: [],
  reference_framework: {
    revision: "es-tic-2026-11-07",
    checked_at: "2026-11-07",
    scope:
      "Propuesta orientativa para desarrollo de software. RR. HH. debe confirmar convenio aplicable, funciones y criterios internos con la participación que corresponda a la representación laboral. Mid y Sénior no equivalen automáticamente a grupos del convenio.",
    criteria_note:
      "Adaptación de EquityTrack, no transcripción de una matriz oficial de ascensos. No se fijan años mínimos, número de proyectos ni puntuaciones nacionales.",
    sources: [
      {
        title: "BOE · XIX Convenio TIC, arts. 11 y 15",
        url: "https://www.boe.es/eli/es/res/2025/04/04/(10)",
        use: "Promoción y clasificación profesional; área 3 y referencias funcionales del grupo C. Convenio firmado por CCOO-Servicios y FeSMC-UGT.",
      },
      {
        title: "CCOO Servicios · Publicación del XIX Convenio TIC",
        url: "https://www.ccoo-servicios.es/html/62498.html",
        use: "Referencia sindical sobre el convenio y su vigencia 2025–2027.",
      },
      {
        title: "UGT · Promoción profesional, 25/09/2026",
        url: "https://www.ugt.es/tu-jefea-no-puede-impedir-tu-promocion-profesional-sin-motivos-objetivos-y-legales",
        use: "Revisión de decisiones no arbitrarias y participación en procesos internos.",
      },
      {
        title: "INE · Encuesta Anual de Estructura Salarial, 2023",
        url: "https://www.ine.es/dyngs/Prensa/EAES2023.htm",
        use: "Contexto nacional: 25.591,31 € de ganancia media anual de mujeres y 30.372,49 € de hombres; diferencia calculada del 15,74 %. No ajustada; todas las actividades de la encuesta, no solo tecnología.",
      },
      {
        title: "UGT · Informe de brecha salarial, 2026",
        url: "https://www.ugt.es/ugt-presenta-el-informe-la-brecha-salarial-baja-la-desigualdad-no-desaparece",
        use: "Análisis sindical: recoge el 15,74 % de 2023. Usa la misma fuente INE; no es una segunda estimación independiente.",
      },
    ],
    context: {
      year: 2023,
      women_annual_eur: 25591.31,
      men_annual_eur: 30372.49,
      gap_pct: 15.74,
      warning:
        "Media anual sin ajustar. No compara igual trabajo ni establece un umbral de promoción; no debe compararse directamente con la brecha normalizada por jornada de esta aplicación.",
    },
  },
  reference_revision: "es-tic-2026-11-07",
  criteria_source: {
    document: "Propuesta adaptada del XIX Convenio TIC · arts. 11 y 15",
    version: "ES · revisión 07/11/2026 · pendiente de validación empresarial",
    defined_by:
      "EquityTrack propone; RR. HH. valida conforme al convenio y acuerdos aplicables",
  },
};
let careerCase = JSON.parse(JSON.stringify(opportunitySeed));
let careerConnected = false;
let careerLoaded = false;
let careerError = "";
const statusNames = {
  solicitada: "Solicitada",
  asignada: "Asignada",
  no_asignada: "No asignada (registrado)",
  completada: "Completada",
};
// Local preview uses the same descriptive labels as the Python domain layer.
function localAssessment(c) {
  if (c.evidence.some((e) => e.verified))
    return {
      code: "verified",
      label: "Evidencia validada",
      next: "Incorporar la evidencia a la evaluación.",
    };
  if (c.evidence.length)
    return {
      code: "evidence",
      label: "Evidencia por revisar",
      next: "Contrastar la contribución registrada.",
    };
  if (c.opportunities.some((o) => o.status === "no_asignada"))
    return {
      code: "access",
      label: "Revisar acceso a oportunidades",
      next: "Existe una solicitud registrada como no asignada. Revisar contexto y alternativas.",
    };
  if (
    c.opportunities.some((o) => ["asignada", "completada"].includes(o.status))
  )
    return {
      code: "development",
      label: "Acordar desarrollo y evaluación",
      next: "Revisar alcance, apoyo y evidencias de la experiencia.",
    };
  return {
    code: "unknown",
    label: "Información insuficiente",
    next: "Solicitar información. La ausencia de registro no demuestra falta de oportunidades.",
  };
}
async function loadCareer() {
  try {
    let r = await fetch("/api/opportunities");
    if (!r.ok) throw Error();
    careerCase = await r.json();
    careerConnected = true;
  } catch {
    careerError =
      "Para guardar evidencias y revisiones, abre la aplicación con Python: python3 app.py. Aquí puedes explorar el caso de ejemplo.";
  }
  careerLoaded = true;
  if (page === "opportunities") render();
}
const reviewLabels = {
  cumple: "Cumple · valoración de RR. HH.",
  no_cumple: "Aún no cumple · valoración de RR. HH.",
  pendiente: "Pendiente de valorar por RR. HH.",
};
function criteriaSource() {
  return (
    careerCase.criteria_source || {
      document: opportunitySeed.criteria_source.document,
      version: opportunitySeed.criteria_source.version,
      defined_by: opportunitySeed.criteria_source.defined_by,
    }
  );
}
let careerDialog = null;
function opportunityView() {
  if (!careerLoaded) {
    loadCareer();
    return '<div class="card" role="status">Cargando revisión…</div>';
  }
  const c = careerCase,
    source = criteriaSource();
  return `<div class="card career-summary"><div><span class="eyebrow">${esc(c.current_level)} → ${esc(c.target_level)} · Ingeniería</span><h2>${esc(c.person)}</h2><p>Revisa cada requisito y registra la decisión de RR. HH.</p></div><p class="authority"><b>RR. HH. define los requisitos y decide si se cumplen.</b><br>EquityTrack reúne la información para apoyar esa revisión.</p></div>${careerError ? `<p class="note">${esc(careerError)}</p>` : ""}<div class="card career-list"><div class="row"><h2>Requisitos del ascenso</h2><button class="textbutton" onclick="openCareerSource()">Origen de los criterios</button></div><p class="muted smalltext">${esc(source.document)} · ${esc(source.version)}</p>${c.criteria.map(criterionCard).join("")}<div class="career-tools"><button class="textbutton" onclick="openCareerComments()">Aportaciones (${c.comments.length})</button><button class="textbutton" onclick="openCareerActions()">Plan de acción (${c.actions.length})</button><button class="textbutton" onclick="openCareerHistory()">Historial</button></div></div><div class="card"><h2>Conclusión de RR. HH.</h2><label for="careerDecision">Qué se decide y por qué</label><textarea id="careerDecision" rows="2" placeholder="Resume la revisión y el siguiente paso…" style="width:100%">${esc(c.decision_reason)}</textarea><div class="row" style="margin-top:16px"><button onclick="careerSend({kind:'decision',actor:'RR. HH.',status:'revisada',description:$('careerDecision').value})">Guardar conclusión</button><button class="secondary" onclick="exportCareer()">Descargar informe</button></div><p class="muted smalltext">${c.decision === "revisada" ? "Conclusión guardada." : "Pendiente de revisión."} El informe incluye la procedencia de los criterios y las valoraciones de RR. HH.</p></div>`;
}
function criterionCard(c) {
  let review = c.review || { status: "pendiente" };
  return `<div class="career-row"><div><b>${esc(c.title)}</b><span class="muted">${esc(reviewLabels[review.status])}</span></div><button class="secondary" onclick="openCareerCriterion('${c.id}')" aria-label="Revisar ${esc(c.title)}">Revisar</button></div>`;
}
function careerModal(title, body) {
  show(
    `<div class="row"><h2>${title}</h2><button class="secondary small" onclick="closeCareerDialog()" aria-label="Cerrar ventana">Cerrar</button></div>${body}`,
  );
}
function closeCareerDialog() {
  careerDialog = null;
  $("modal").close();
}
function openCareerSource() {
  careerDialog = { type: "source" };
  const x = criteriaSource();
  careerModal(
    "Origen de los criterios",
    `<p>Propuesta de referencia española, pendiente de validación de RR. HH. según las funciones, el convenio y los acuerdos aplicables. Los criterios comunes no se obtienen de porcentajes salariales.</p>${spanishReferenceHTML()}<label for="sourceDoc">Documento</label><input id="sourceDoc" value="${esc(x.document)}"><label for="sourceVersion">Versión o fecha</label><input id="sourceVersion" value="${esc(x.version)}"><label for="sourceAuthor">Responsable de los criterios</label><input id="sourceAuthor" value="${esc(x.defined_by)}"><p class="muted smalltext">El caso y las bandas son ficticios; no son tablas del convenio. Bandas: ${esc(careerCase.current_band)} → ${esc(careerCase.target_band)}.</p><button onclick="careerSend({kind:'criteria_source',document:$('sourceDoc').value,version:$('sourceVersion').value,defined_by:$('sourceAuthor').value})">Guardar origen</button>`,
  );
}
function openCareerCriterion(id) {
  careerDialog = { type: "criterion", id };
  const c = careerCase.criteria.find((x) => x.id === id),
    review = c.review || { status: "pendiente", reason: "" },
    a = c.assessment || localAssessment(c);
  careerModal(
    esc(c.title),
    `<p><b>Propuesta a validar por RR. HH.:</b> ${esc(c.requirement)}</p><p class="muted smalltext">Base: ${esc(c.source_reference || "Criterio interno documentado")} · <a href="${esc(c.source_url || boeReference)}" target="_blank" rel="noopener">Consultar referencia</a></p><details><summary>Ver evidencias y oportunidades (${c.evidence.length + c.opportunities.length})</summary><h3>Evidencias</h3>${c.evidence.map((e, i) => `<p>${esc(e.description)}<br><small>${esc(e.author)} · ${e.verified ? "Evidencia contrastada" : `Pendiente de contrastar <button class="textbutton" onclick="careerSend({kind:'verify',criterion:'${c.id}',index:${i}})">Validar evidencia</button>`}</small></p>`).join("") || "<p>Sin evidencias registradas.</p>"}<h3>Oportunidades</h3>${c.opportunities.map((o) => `<p><b>${esc(statusNames[o.status])}:</b> ${esc(o.description)}<br>${esc(o.context)}</p>`).join("") || "<p>Sin experiencias registradas.</p>"}<p class="note"><b>Contexto para revisar:</b> ${esc(a.label)}. ${esc(a.next)} Esto no determina si cumple el requisito.</p></details><label for="criterionVerdict">Valoración de RR. HH.</label><select id="criterionVerdict">${Object.entries(
      reviewLabels,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${k === review.status ? "selected" : ""}>${esc(v)}</option>`,
      )
      .join(
        "",
      )}</select><label for="criterionReason">Motivo y evidencia utilizada</label><textarea id="criterionReason" rows="3">${esc(review.reason)}</textarea><p><button onclick="careerSend({kind:'criterion_review',criterion:'${c.id}',status:$('criterionVerdict').value,description:$('criterionReason').value})">Guardar valoración</button></p><details><summary>Añadir información</summary><label for="careerNewEvidence">Evidencia y dónde contrastarla</label><textarea id="careerNewEvidence"></textarea><p><button class="secondary" onclick="careerSend({kind:'evidence',criterion:'${c.id}',description:$('careerNewEvidence').value})">Añadir evidencia</button></p><label for="careerNewOpportunity">Proyecto o experiencia</label><input id="careerNewOpportunity"><label for="careerOpportunityStatus">Estado registrado</label><select id="careerOpportunityStatus">${Object.entries(
      statusNames,
    )
      .map(([v, n]) => `<option value="${v}">${n}</option>`)
      .join(
        "",
      )}</select><label for="careerOpportunityContext">Contexto y fuente</label><textarea id="careerOpportunityContext"></textarea><p><button class="secondary" onclick="careerSend({kind:'opportunity',criterion:'${c.id}',description:$('careerNewOpportunity').value,status:$('careerOpportunityStatus').value,context:$('careerOpportunityContext').value})">Registrar oportunidad</button></p></details><details><summary>Editar requisito (RR. HH.)</summary><label for="criterionDefinition">Texto de la matriz de carrera</label><textarea id="criterionDefinition">${esc(c.requirement)}</textarea><p class="smalltext">Al modificarlo, su valoración vuelve a pendiente.</p><button class="secondary" onclick="careerSend({kind:'criterion_definition',criterion:'${c.id}',description:$('criterionDefinition').value})">Guardar requisito</button></details>`,
  );
}
function openCareerComments() {
  careerDialog = { type: "comments" };
  careerModal(
    "Aportaciones",
    `${careerCase.comments.map((x) => `<p><b>${esc(x.author)}:</b> ${esc(x.text)}</p>`).join("") || "<p>No hay aportaciones.</p>"}<label for="contributionActor">Quién aporta la información (rol de prueba)</label><select id="contributionActor"><option>Profesional</option><option>Responsable</option><option>RR. HH.</option></select><label for="careerComment">Observación, corrección o desacuerdo</label><textarea id="careerComment" rows="3"></textarea><p><button onclick="careerSend({kind:'comment',actor:$('contributionActor').value,description:$('careerComment').value})">Añadir aportación</button></p><details><summary>Otras contribuciones registradas</summary>${careerCase.contributions.map((x) => `<p>${esc(x.description)}<br>${esc(x.note)}</p>`).join("")}</details>`,
  );
}
function openCareerActions() {
  careerDialog = { type: "actions" };
  careerModal(
    "Plan de acción",
    `${table(
      ["Medida", "Responsable", "Fecha", "Estado"],
      careerCase.actions.map((a, i) => [
        esc(a.title),
        esc(a.owner),
        esc(a.due),
        `<select aria-label="Estado medida ${i + 1}" onchange="careerSend({kind:'action_status',index:${i},status:this.value})">${["Pendiente", "En curso", "Completada"].map((x) => `<option ${a.status === x ? "selected" : ""}>${x}</option>`).join("")}</select>`,
      ]),
    )}<label for="careerAction">Qué se acuerda hacer</label><input id="careerAction"><label for="careerOwner">Responsable</label><input id="careerOwner"><label for="careerDue">Fecha de seguimiento</label><input id="careerDue" type="date"><p><button onclick="careerSend({kind:'action',description:$('careerAction').value,owner:$('careerOwner').value,due:$('careerDue').value})">Guardar medida</button></p>`,
  );
}
function openCareerHistory() {
  careerDialog = { type: "history" };
  careerModal(
    "Historial de revisión",
    careerCase.history
      .map((x) => `<p>${esc(x.at)} · ${esc(x.actor)} · ${esc(x.event)}</p>`)
      .join("") || "<p>No hay cambios registrados.</p>",
  );
}
let careerBusy = false;
async function careerSend(payload) {
  if (!careerConnected)
    return toast(
      "Abre EquityTrack con python3 app.py para guardar la revisión.",
    );
  if (careerBusy) return;
  careerBusy = true;
  const actor = payload.actor || "RR. HH.";
  try {
    let r = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, actor }),
    });
    let result = await r.json();
    if (!r.ok) throw Error(result.error);
    careerCase = result;
    render();
    const active = careerDialog;
    if (active?.type === "criterion") openCareerCriterion(active.id);
    else if (active?.type === "comments") openCareerComments();
    else if (active?.type === "actions") openCareerActions();
    else if (active) closeCareerDialog();
    toast("Expediente actualizado");
  } catch (e) {
    toast(e.message);
  } finally {
    careerBusy = false;
  }
}
function exportCareer() {
  let c = careerCase;
  let html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>EquityTrack · Revisión de oportunidades</title><style>body{font:15px system-ui;max-width:950px;margin:40px auto;padding:20px}p{line-height:1.6}section{border-bottom:1px solid #ddd;padding:16px 0}</style><h1>EquityTrack · Revisión de oportunidades</h1><p>${esc(c.person)} · ${esc(c.current_level)} → ${esc(c.target_level)}</p><p>Bandas: ${esc(c.current_band)} → ${esc(c.target_band)}</p><p>Referencia original de evaluación: ${esc(c.evaluation)}</p><h2>Procedencia de los criterios</h2>${spanishReferenceHTML()}<p>Documento: ${esc(criteriaSource().document)} · Versión: ${esc(criteriaSource().version)} · Responsable: ${esc(criteriaSource().defined_by)}</p><p>RR. HH. define los criterios y determina su cumplimiento. Los avisos de la aplicación solo organizan la revisión.</p>${c.criteria.map((x) => `<section><h2>${esc(x.title)}</h2><p>Requisito: ${esc(x.requirement)}</p><p>Referencia: ${esc(x.source_reference || "Definición interna de RR. HH.")}</p><p>Aviso descriptivo de EquityTrack: ${esc((x.assessment || localAssessment(x)).label)}</p><p>Valoración humana: ${esc(reviewLabels[x.review?.status || "pendiente"])} · Motivo: ${esc(x.review?.reason || "Sin valoración registrada")}</p><p>Registrada por: ${esc(x.review?.by || "—")} · Fecha: ${esc(x.review?.at || "—")}</p><h3>Evidencias</h3>${x.evidence.map((e) => `<p>${esc(e.description)} · ${esc(e.author)} · ${e.verified ? "Validada" : "Pendiente"}</p>`).join("") || "<p>Sin registros.</p>"}<h3>Oportunidades</h3>${x.opportunities.map((o) => `<p>${esc(statusNames[o.status])}: ${esc(o.description)} · ${esc(o.context)}</p>`).join("") || "<p>Sin registros.</p>"}</section>`).join("")}<h2>Aportaciones</h2>${c.comments.map((x) => `<p>${esc(x.author)}: ${esc(x.text)}</p>`).join("")}<h2>Medidas</h2>${c.actions.map((a) => `<p>${esc(a.title)} · ${esc(a.owner)} · ${esc(a.due)} · ${esc(a.status)}</p>`).join("")}<h2>Revisión</h2><p>${esc(c.decision)} · ${esc(c.decision_reason)}</p><h2>Trazabilidad</h2>${c.history.map((h) => `<p>${esc(h.at)} · ${esc(h.actor)} · ${esc(h.event)}</p>`).join("")}<p>Caso ficticio. Documento de revisión humana; no acredita una decisión automática de ascenso ni demuestra causalidad.</p></html>`;
  download(html, "equitytrack-oportunidades.html", "text/html;charset=utf-8");
}

const boeReference = "https://www.boe.es/eli/es/res/2025/04/04/(10)";
function spanishReferenceHTML() {
  const f =
    careerCase.reference_framework || opportunitySeed.reference_framework;
  return `<details><summary>Fuentes españolas y contexto estadístico</summary><p>${esc(f.scope)}</p><p>${esc(f.criteria_note)}</p><p><b>España · INE, datos de 2023:</b> diferencia del 15,74 % entre las ganancias medias anuales de mujeres y hombres. Es un dato de contexto sin ajustar, no una prueba de discriminación ni un requisito individual.</p><ul>${f.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><p>${esc(s.use)}</p></li>`).join("")}</ul><p>Fuentes consultadas: ${esc(f.checked_at)}. Los datos de 2023 se identifican por su año; no se presentan como cifras de 2026.</p></details>`;
}
