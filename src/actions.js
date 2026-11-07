/** Diálogos, revisiones y medidas correctoras. */
function show(html) {
  $("modal").innerHTML = html;
  $("modal").showModal();
}
function review(key) {
  show(
    `<h2>Documentar revisión</h2><p>${esc(JSON.parse(key).join(" / "))}</p><label>Decisión y justificación</label><textarea id="reviewText" rows="5" style="width:100%">${esc(reviews[key] || "")}</textarea><p class="smalltext muted">Documenta criterios objetivos, evidencia y próximos pasos. El estado no cambia el cálculo.</p><button id="saveReview">Guardar revisión</button> <button class="secondary" onclick="$('modal').close()">Cancelar</button>`,
  );
  $("saveReview").onclick = () => {
    let value = $("reviewText").value.trim();
    if (!value) return toast("Escribe la revisión");
    reviews[key] = value;
    save();
    $("modal").close();
    render();
  };
}
function newAction(title = "") {
  show(
    `<h2>Nueva medida</h2><label>Medida</label><input id="actionTitle" value="${esc(title)}" style="width:100%"><label>Responsable</label><input id="actionOwner" placeholder="Equipo o persona responsable"><label>Fecha objetivo</label><input id="actionDate" type="date"><p><button onclick="addAction()">Guardar medida</button> <button class="secondary" onclick="$('modal').close()">Cancelar</button></p>`,
  );
}
function addAction() {
  let title = $("actionTitle").value.trim(),
    owner = $("actionOwner").value.trim(),
    date = $("actionDate").value;
  if (!title || !owner || !date)
    return toast("Completa medida, responsable y fecha");
  actions.push({ title, owner, date, status: "Pendiente" });
  save();
  $("modal").close();
  go("actions");
}
function changeAction(i, s) {
  actions[i].status = s;
  save();
  toast("Estado actualizado");
}
function removeAction(i) {
  actions.splice(i, 1);
  save();
  render();
}
function scenario() {
  show(
    `<h2>Escenario sancionador</h2><p class="muted">Introduce un supuesto validado con asesoría. No es una estimación de probabilidad ni un cálculo automático de multa.</p><label>Importe mínimo por infracción (€)</label><input id="smin" type="number" min="0" value="${settings.min}"><label>Importe máximo por infracción (€)</label><input id="smax" type="number" min="0" value="${settings.max}"><label>Número hipotético de infracciones</label><input id="scases" type="number" min="1" step="1" value="${settings.cases}"><p><button onclick="saveScenario()">Calcular escenario</button> <button class="secondary" onclick="$('modal').close()">Cancelar</button></p>`,
  );
}
function saveScenario() {
  let min = +$("smin").value,
    max = +$("smax").value,
    cases = +$("scases").value;
  if (
    ![min, max, cases].every(Number.isFinite) ||
    min < 0 ||
    max < min ||
    cases < 1 ||
    !Number.isInteger(cases)
  )
    return toast("Revisa los importes y el número de infracciones");
  Object.assign(settings, { min, max, cases });
  save();
  $("modal").close();
  render();
}
