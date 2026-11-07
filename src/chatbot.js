/** Chat flotante. Solo envía resúmenes agregados cuando la persona pulsa Enviar. */
let chatMessages = [],
  chatPending = false,
  chatConfigured = false,
  chatFocus = null;
const chatIcon =
  '<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-7a8 8 0 1 1 18-3Z"/><path d="M7 9h10M7 13h7"/></svg>';
function initChat() {
  const root = document.createElement("div");
  root.id = "equity-chat";
  root.innerHTML = `<button id="chat-toggle" class="chat-toggle" aria-label="Abrir asistente EquityTrack" aria-expanded="false" aria-controls="chat-panel">${chatIcon}</button><section id="chat-panel" class="chat-panel" aria-label="Asistente EquityTrack" hidden><div class="chat-header"><span class="chat-mark">${chatIcon}</span><strong>Asistente EquityTrack</strong><button id="chat-clear" class="chat-new" aria-label="Nueva conversación" title="Nueva conversación">↻</button><button id="chat-close" aria-label="Cerrar asistente" title="Cerrar">×</button></div><div id="chat-messages" class="chat-messages" role="log" aria-live="polite" aria-relevant="additions"><div class="chat-bubble assistant">Hola, ¿qué resultado quieres entender?</div></div><div id="chat-suggestions" class="chat-suggestions"><button data-question="Explícame las diferencias salariales y qué debería revisar primero.">Entender la brecha salarial</button><button data-question="¿En qué nivel hay más diferencia en promociones y qué debo comprobar?">Revisar las promociones</button><button data-question="¿Qué limitaciones tienen los datos de permisos de cuidados?">Interpretar los permisos</button></div><p id="chat-error" class="chat-error" role="alert" hidden></p><p id="chat-loading" class="chat-loading" role="status" hidden>Consultando Gemini…</p><form id="chat-form"><label class="sr-only" for="chat-input">Pregunta al asistente</label><textarea id="chat-input" placeholder="Pregunta sobre tus resultados…" rows="2" maxlength="2000"></textarea><button id="chat-send" type="submit" aria-label="Enviar pregunta">↑</button></form><p class="chat-disclosure">Consulta y resumen agregados se envían a Gemini. Evita incluir datos personales.</p></section>`;
  document.body.append(root);
  $("chat-toggle").onclick = toggleChat;
  $("chat-close").onclick = () => toggleChat(false);
  $("chat-clear").onclick = clearChat;
  $("chat-form").onsubmit = (e) => {
    e.preventDefault();
    sendChat();
  };
  $("chat-input").onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendChat();
    }
  };
  root.querySelectorAll("[data-question]").forEach(
    (b) =>
      (b.onclick = () => {
        $("chat-input").value = b.dataset.question;
        sendChat();
      }),
  );
  $("chat-panel").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      toggleChat(false);
    }
  });
}
async function toggleChat(open) {
  if (typeof open !== "boolean") open = $("chat-panel").hidden;
  $("chat-panel").hidden = !open;
  $("chat-toggle").setAttribute("aria-expanded", String(open));
  if (!open) {
    $("chat-toggle").focus();
    return;
  }
  $("chat-input").focus();
  updateChatContext();
  try {
    const r = await fetch("/api/chat/status");
    if (!r.ok) throw Error();
    const status = await r.json();
    chatConfigured = status.configured;
    if (!chatConfigured)
      chatError(
        "Conecta Gemini: completa GEMINI_API_KEY en .env y reinicia el servidor Python. La clave nunca se introduce en este chat.",
      );
    else chatError("");
  } catch {
    chatError(
      "Abre EquityTrack desde su servidor Python para utilizar el asistente.",
    );
  }
}
function updateChatContext() {
  if ($("chat-context"))
    $("chat-context").textContent =
      "Datos: " + (filter || "Toda la organización");
}
function clearChat() {
  if (chatPending) return;
  chatMessages = [];
  $("chat-suggestions").hidden = false;
  $("chat-messages").innerHTML =
    '<div class="chat-bubble assistant">Conversación nueva. ¿Qué resultado quieres revisar?</div>';
  chatError("");
}
function chatError(text) {
  $("chat-error").textContent = text;
  $("chat-error").hidden = !text;
}
/** Markdown mínimo, escapado antes de crear etiquetas para evitar HTML no confiable. */
function formatChatMarkdown(text) {
  const lines = String(text).replace(/\r\n?/g, "\n").split("\n");
  const inline = (value) =>
    esc(value).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  let result = "",
    list = null;
  function closeList() {
    if (list) {
      result += `</${list}>`;
      list = null;
    }
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const number = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || number) {
      const type = bullet ? "ul" : "ol";
      if (list !== type) {
        closeList();
        list = type;
        result += `<${type}>`;
      }
      result += `<li>${inline((bullet || number)[1])}</li>`;
    } else {
      closeList();
      result += heading
        ? `<p class="chat-subheading">${inline(heading[1])}</p>`
        : `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return result;
}

function addChatBubble(role, text) {
  const el = document.createElement("div");
  el.className = "chat-bubble " + role;
  if (role === "assistant") el.innerHTML = formatChatMarkdown(text);
  else el.textContent = text;
  $("chat-messages").append(el);
  el.scrollIntoView({ block: "nearest" });
}
function chatSummary() {
  const rows = subset(),
    payGroups = groups(rows),
    promotionGroups = ladder(rows);
  const pay = payGroups
    .filter((g) => g.w.length >= 5 && g.m.length >= 5)
    .map((g) => ({
      group: g.label,
      women: g.w.length,
      men: g.m.length,
      women_mean: g.wm,
      men_mean: g.mm,
      gap_pct: g.gap,
    }));
  const promotions = promotionGroups
    .filter((g) => g.w.length >= 5 && g.m.length >= 5)
    .map((g) => ({
      level: g.n,
      women: g.w.length,
      men: g.m.length,
      women_promoted: g.wp,
      men_promoted: g.mp,
      women_rate: g.wr,
      men_rate: g.mr,
      difference_pp: g.gap,
    }));
  const mt = matched(rows),
    leave = [];
  const uniqueControls = new Set(mt.pairs.flatMap((p) => p.c.map((r) => r.id)));
  if (mt.pairs.length >= 5 && uniqueControls.size >= 5) {
    const metrics = [
      [
        "Salario fijo anual normalizado",
        (r) => r.fijo_antes / r.jornada,
        (r) => r.fijo_despues / r.jornada,
      ],
      [
        "Variable anual normalizado",
        (r) => r.variable_antes / r.jornada,
        (r) => r.variable_despues / r.jornada,
      ],
      [
        "Responsabilidad (índice interno 0–100)",
        (r) => r.responsabilidad_antes,
        (r) => r.responsabilidad_despues,
      ],
    ];
    metrics.forEach(([metric, b, a]) => {
      const before_leave = mean(mt.pairs.map((p) => b(p.r))),
        after_leave = mean(mt.pairs.map((p) => a(p.r))),
        before_control = mean(mt.pairs.map((p) => mean(p.c.map(b)))),
        after_control = mean(mt.pairs.map((p) => mean(p.c.map(a))));
      leave.push({
        metric,
        matched: mt.pairs.length,
        unmatched: mt.unmatched,
        before_leave,
        after_leave,
        before_control,
        after_control,
        difference:
          after_leave - before_leave - (after_control - before_control),
      });
    });
  }
  return {
    screen: pages[page]?.[1] || "Inicio",
    filter: filter || "Toda la organización",
    period: settings.period,
    coverage: {
      people: rows.length,
      suppressed_groups: payGroups.length - pay.length,
    },
    pay,
    promotions,
    leave,
  };
}
async function sendChat() {
  if (chatPending) return;
  const question = $("chat-input").value.trim();
  if (!question) return;
  if (!chatConfigured) {
    chatError(
      "Configura GEMINI_API_KEY en .env y vuelve a abrir el asistente.",
    );
    return;
  }
  const context = chatSummary();
  updateChatContext();
  chatError("");
  chatPending = true;
  $("chat-send").disabled = true;
  $("chat-clear").disabled = true;
  $("chat-loading").hidden = false;
  $("chat-suggestions").hidden = true;
  addChatBubble("user", question);
  $("chat-input").value = "";
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        context,
        history: chatMessages.slice(-12),
      }),
    });
    const result = await r.json();
    if (!r.ok)
      throw Error(result.error || "No se pudo consultar al asistente.");
    addChatBubble("assistant", result.answer);
    chatMessages.push(
      { role: "user", text: question },
      { role: "model", text: result.answer },
    );
  } catch (e) {
    chatError(e.message || "No se pudo conectar con el asistente.");
    $("chat-input").value = question;
  } finally {
    chatPending = false;
    $("chat-send").disabled = false;
    $("chat-clear").disabled = false;
    $("chat-loading").hidden = true;
  }
}
