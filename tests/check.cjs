const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
const elements = {};
const el = (id) =>
  (elements[id] ??= {
    innerHTML: "",
    textContent: "",
    value: "",
    hidden: false,
    classList: { add() {} },
    close() {},
    showModal() {},
  });
const ctx = {
  document: { getElementById: el },
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {},
  },
  console,
  setTimeout() {},
  Blob,
  URL,
  window: {},
  Number,
  Date,
};
vm.createContext(ctx);
const path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const s = [...html.matchAll(/<script defer src="([^"]+)"/g)]
  .map((m) => fs.readFileSync(path.join(root, m[1].split("?")[0]), "utf8"))
  .join("\n");
vm.runInContext(s, ctx);
vm.runInContext(
  `assertion=()=>{if(data.length!==192)throw Error('demo');for(let p of Object.keys(pages)){page=p;render();if(!$('content').innerHTML)throw Error(p)}let csv=columns.join(',')+'\\n'+demo().map(r=>columns.map(k=>r[k]).join(',')).join('\\n');if(parse(csv).length!==192)throw Error('roundtrip');let a=groups(demo());if(!a.some(g=>g.flag))throw Error('flags');if(!matched(demo()).pairs.length)throw Error('matching');if(!ladder(demo()).some(l=>l.gap>0))throw Error('ladder');if(!report().includes('6. Validaciones'))throw Error('report');let bad=false;try{parse(csv+'\\n'+csv.split('\\n')[1])}catch{bad=true}if(!bad)throw Error('duplicate');console.log('OK: 9 vistas, 192 registros, CSV válido, duplicados rechazados, brechas, promociones, cohortes e informe.')} ;assertion()`,
  ctx,
);
vm.runInContext(
  `careerLoaded=true; careerConnected=true; page='opportunities'; render(); if(!$('content').innerHTML.includes('Organización y seguimiento del trabajo')) throw Error('expediente'); if(!$('content').innerHTML.includes('Conclusión de RR. HH.')) throw Error('conclusion humana'); console.log('OK: expediente de oportunidades renderizado con participación y seguimiento.');`,
  ctx,
);
vm.runInContext(`const summary=chatSummary(); if(summary.coverage.people!==192) throw Error('contexto del chat'); if(summary.pay.length!==12) throw Error('grupos salariales del chat'); if(JSON.stringify(summary).includes('EMP-')) throw Error('identificador individual compartido'); const originalData=data; data=data.slice(0,2); if(chatSummary().pay.length) throw Error('grupo pequeño compartido'); data=originalData; console.log('OK: contexto agregado del chatbot y exclusión de grupos pequeños.');`,ctx);
