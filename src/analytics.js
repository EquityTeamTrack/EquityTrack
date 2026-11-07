/** Datos de ejemplo y cálculos descriptivos de equidad. */
function demo() {
  let a = [],
    id = 0;
  for (let dep of ["Ingeniería", "Producto", "Datos"])
    for (let level = 1; level <= 4; level++)
      for (let gender of ["mujer", "hombre"])
        for (let j = 0; j < 8; j++) {
          let leave = gender === "mujer" && j < 3,
            base = 30000 + level * 11000 + j * 400,
            raise = leave ? 0.025 : gender === "mujer" ? 0.065 : 0.1,
            promote =
              j < (gender === "mujer" ? (level === 2 ? 1 : 3) : 5) && level < 4,
            post = base * (1 + raise) + (promote ? 4500 : 0),
            v = base * 0.1;
          a.push({
            id: "EMP-" + String(++id).padStart(3, "0"),
            genero: gender,
            departamento: dep,
            categoria: ["", "Junior", "Mid", "Senior", "Lead"][level],
            nivel_antes: level,
            nivel_despues: level + (promote ? 1 : 0),
            fijo_antes: base,
            fijo_despues: Math.round(post),
            variable_antes: Math.round(v),
            variable_despues: Math.round(v * (leave ? 0.98 : 1.15)),
            responsabilidad_antes: level * 20,
            responsabilidad_despues:
              level * 20 + (promote ? 20 : leave ? 0 : 3),
            permiso: leave ? "si" : "no",
            antiguedad: 2 + (j % 4),
            jornada: 1,
          });
        }
  return a;
}
function subset() {
  return data.filter((r) => !filter || r.departamento === filter);
}
function groups(rows) {
  let o = {};
  rows.forEach((r) => {
    let k = JSON.stringify([r.departamento, r.categoria]);
    (o[k] ??= []).push(r);
  });
  return Object.entries(o).map(([key, a]) => {
    let w = a.filter((r) => r.genero === "mujer"),
      m = a.filter((r) => r.genero === "hombre"),
      total = (r) => (r.fijo_despues + r.variable_despues) / r.jornada,
      wm = mean(w.map(total)),
      mm = mean(m.map(total)),
      gap = mm > 0 ? ((mm - wm) / mm) * 100 : NaN;
    return {
      key,
      label: JSON.parse(key).join(" / "),
      w,
      m,
      wm,
      mm,
      gap,
      medw: median(w.map(total)),
      medm: median(m.map(total)),
      small: w.length < 5 || m.length < 5,
      flag: Math.abs(gap) > 5,
      cost:
        Number.isFinite(wm) && Number.isFinite(mm)
          ? wm < mm
            ? w.reduce((s, r) => s + (mm - wm) * r.jornada, 0)
            : m.reduce((s, r) => s + (wm - mm) * r.jornada, 0)
          : 0,
    };
  });
}
function ladder(rows) {
  return [...new Set(rows.map((r) => r.nivel_antes))]
    .sort((a, b) => a - b)
    .map((n) => {
      let w = rows.filter((r) => r.genero === "mujer" && r.nivel_antes === n),
        m = rows.filter((r) => r.genero === "hombre" && r.nivel_antes === n),
        wp = w.filter((r) => r.nivel_despues > n).length,
        mp = m.filter((r) => r.nivel_despues > n).length;
      return {
        n,
        w,
        m,
        wp,
        mp,
        wr: w.length ? (100 * wp) / w.length : NaN,
        mr: m.length ? (100 * mp) / m.length : NaN,
        gap: w.length && m.length ? 100 * (mp / m.length - wp / w.length) : NaN,
      };
    });
}
function matched(rows) {
  let exposed = rows.filter((r) => r.genero === "mujer" && r.permiso === "si"),
    control = rows.filter((r) => r.genero === "mujer" && r.permiso === "no"),
    pairs = exposed
      .map((r) => ({
        r,
        c: control.filter(
          (c) =>
            c.departamento === r.departamento &&
            c.categoria === r.categoria &&
            c.nivel_antes === r.nivel_antes &&
            Math.abs(c.antiguedad - r.antiguedad) <= 2 &&
            Math.abs(c.jornada - r.jornada) < 0.05,
        ),
      }))
      .filter((p) => p.c.length);
  return { exposed, pairs, unmatched: exposed.length - pairs.length };
}
