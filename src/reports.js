/** Generación y exportación del informe retributivo. */
function report() {
  let rows = subset(),
    g = groups(rows),
    l = ladder(rows);
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>Informe de auditoría · ${esc(settings.org)}</title><div>◈ EQUITYTRACK / EXPEDIENTE DE DIAGNÓSTICO</div><h1>Informe de apoyo a la auditoría retributiva</h1><p><b>${esc(settings.org)}</b> · Periodo ${esc(settings.period)} · Emitido ${new Date().toLocaleDateString("es-ES")}</p><p>Alcance: ${esc(filter || "Toda la organización")} · Fuente: ${esc(source)} · ${rows.length} personas.</p><p class="note">Estado: borrador para revisión profesional. Incluye análisis automatizado de los datos disponibles. Requiere completar valoración de puestos, causas, participación de la representación laboral, aprobación y firma para su uso oficial.</p><h2>1. Retribución por grupos comparables</h2>${riskTable(g)}<p>Fijo + variable anuales divididos por jornada. Brecha = (media H − media M) / media H ×100. Las categorías aportadas deben corresponder a trabajos de igual valor. Umbral operativo: diferencia absoluta superior al 5 %. Menos de cinco personas por sexo implica muestra pequeña.</p><h2>2. Progresión profesional</h2>${table(
    [
      "Nivel inicial",
      "Promociones mujeres / total",
      "Promociones hombres / total",
      "Diferencia de tasas",
    ],
    l.map((x) => [
      x.n,
      x.wp + " / " + x.w.length,
      x.mp + " / " + x.m.length,
      fmt(x.gap) + " pp",
    ]),
  )}<p>Promoción = aumento de nivel entre ambos cortes. Diferencia = tasa hombres − tasa mujeres. No determina causalidad ni elegibilidad.</p><h2>3. Trayectorias después de permisos</h2>${leaveTable(rows)}<p>Comparación de mujeres con permiso frente a mujeres sin permiso del mismo departamento, categoría y nivel; antigüedad ±2 años y jornada ±5 puntos. ${matched(rows).pairs.length} trayectorias emparejadas; ${matched(rows).unmatched} sin control. Controles reutilizables; medias ponderadas por trayectoria expuesta. Responsabilidad: índice interno 0–100.</p><h2>4. Escenarios económicos</h2><p>Presupuesto anual orientativo para igualar medias en grupos señalados: ${eur(g.filter((x) => x.flag).reduce((s, x) => s + x.cost, 0))}. No incluye cargas sociales ni atribuye obligación de ajuste individual. Supuesto sancionador parametrizado: ${settings.cases} infracciones, de ${eur(settings.min * settings.cases)} a ${eur(settings.max * settings.cases)}; no se deriva de las brechas.</p><h2>5. Medidas y responsables</h2>${table(
    ["Medida", "Responsable", "Fecha", "Estado"],
    actions.map((a) => [
      esc(a.title),
      esc(a.owner),
      esc(a.date),
      esc(a.status),
    ]),
  )}<h2>6. Validaciones previas a presentación</h2><p>Valoración objetiva de puestos: __________________<br>Justificación de diferencias y evidencias: __________________<br>Consulta con representación laboral: __________________<br>Objetivos, seguimiento y calendario: __________________<br>Validación / firma / fecha: __________________</p><h2>7. Marco y límites</h2><p>Directiva (UE) 2023/970, arts. 4, 9 y 10; Real Decreto 902/2020 (registro, valoración y auditoría); LISOS, art. 40. La evaluación conjunta de la directiva exige condiciones adicionales al 5 %. El documento no certifica cumplimiento ni predice sanciones. Debe contrastarse la normativa nacional vigente antes de su presentación.</p><p>Referencias: https://eur-lex.europa.eu/eli/dir/2023/970/oj/eng · https://www.boe.es/buscar/act.php?id=BOE-A-2020-12215 · https://www.boe.es/buscar/act.php?id=BOE-A-2000-15060</p></html>`;
}
function reportSettings() {
  settings.org = $("org").value.trim() || settings.org;
  settings.period = $("period").value.trim() || settings.period;
  save();
}
function exportReport() {
  reportSettings();
  download(
    report(),
    "equitytrack-informe-auditoria.html",
    "text/html;charset=utf-8",
  );
  toast("Informe descargado");
}
function printReport() {
  reportSettings();
  let w = window.open("", "_blank");
  if (!w) return toast("Permite abrir la ventana para exportar el PDF");
  w.document.write(report());
  w.document.close();
  setTimeout(() => w.print(), 400);
}
