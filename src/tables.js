/** Tablas reutilizables para resultados e informes. */
function riskTable(g, interactive = false) {
  return table(
    [
      "Departamento / categoría",
      "M / H",
      "Media M / H",
      "Mediana M / H",
      "Brecha total",
      "Semáforo",
      "Revisión",
    ],
    g.map((x) => [
      esc(x.label),
      x.w.length + " / " + x.m.length,
      eur(x.wm) + " / " + eur(x.mm),
      eur(x.medw) + " / " + eur(x.medm),
      fmt(x.gap) + " %",
      `<span class="pill ${x.small || !Number.isFinite(x.gap) ? "amber" : x.flag ? "red" : ""}">${x.small ? "Muestra pequeña" : !Number.isFinite(x.gap) ? "Sin comparación" : x.flag ? "Revisar" : "Sin diferencias destacadas"}</span>`,
      interactive
        ? `<button class="secondary small" data-key="${esc(x.key)}" onclick="review(this.dataset.key)">${esc(reviews[x.key] || "Documentar")}</button>`
        : esc(reviews[x.key] || "Pendiente"),
    ]),
  );
}
function leaveTable(rows) {
  let { pairs } = matched(rows),
    spec = [
      [
        "Salario fijo anual",
        (r) => r.fijo_antes / r.jornada,
        (r) => r.fijo_despues / r.jornada,
        eur,
      ],
      [
        "Variable anual",
        (r) => r.variable_antes / r.jornada,
        (r) => r.variable_despues / r.jornada,
        eur,
      ],
      [
        "Responsabilidad (0–100)",
        (r) => r.responsabilidad_antes,
        (r) => r.responsabilidad_despues,
        fmt,
      ],
    ];
  return table(
    [
      "Variable",
      "Permiso: antes → después",
      "Control: antes → después",
      "Cambio permiso / control",
      "Diferencial",
    ],
    spec.map(([label, b, a, f]) => {
      let eb = mean(pairs.map((p) => b(p.r))),
        ea = mean(pairs.map((p) => a(p.r))),
        cb = mean(pairs.map((p) => mean(p.c.map(b)))),
        ca = mean(pairs.map((p) => mean(p.c.map(a))));
      return [
        label,
        f(eb) + " → " + f(ea),
        f(cb) + " → " + f(ca),
        f(ea - eb) + " / " + f(ca - cb),
        f(ea - eb - (ca - cb)),
      ];
    }),
  );
}
