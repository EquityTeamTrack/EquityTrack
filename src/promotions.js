/** Escenario de revisión previa de promociones. */
function checkPromotion() {
  let isMan = $("candidate").value === "h";
  $("promotionResult").innerHTML = isMan
    ? `<span class="pill amber">⚑ REVISAR OTRA CANDIDATURA</span><h2 style="margin-top:18px">Hay otra persona que cumple los requisitos</h2><p><b>EMP-P02 · Mujer · 3 años en la empresa</b></p><p>Comparte rol y nivel con la persona propuesta y alcanza la misma evaluación, competencias y experiencia técnica. Tiene 2 años y 9 meses más de antigüedad en la empresa.</p><p>¿Se ha considerado su candidatura con los mismos criterios?</p><button onclick="newAction('Revisar ambas candidaturas Mid → Senior con los mismos criterios')">Registrar revisión con RR. HH.</button><p class="smalltext muted">La alerta solicita una revisión; no recomienda automáticamente un ascenso.</p>`
    : `<span class="pill">REQUISITOS CUMPLIDOS</span><h2 style="margin-top:18px">Documenta la comparación</h2><p>EMP-P01 también cumple los requisitos del puesto. Revisa ambas candidaturas y documenta el criterio de selección.</p><button onclick="newAction('Documentar comparación de candidaturas Mid → Senior')">Registrar revisión</button>`;
}
