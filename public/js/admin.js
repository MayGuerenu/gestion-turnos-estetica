import { api, clearToken, getToken } from "./api.js";

const $ = (s) => document.querySelector(s);

// ---- Guards (ANTES de tocar el DOM)
function redirect(to) {
  window.location.href = to;
  throw new Error(`Redirected to ${to}`);
}

// 1) si no hay token -> login
if (!getToken()) redirect("/");

// 2) si no es admin -> dashboard normal
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user || user.role !== "admin") redirect("/dashboard.html");

// ---- DOM
const msg = $("#msg");
const btnLogout = $("#btnLogout");

const mUsers = $("#mUsers");
const mClients = $("#mClients");
const mAppts = $("#mAppts");

const nextWrap = $("#nextWrap");

const blockForm = $("#blockForm");
const bDate = $("#bDate");
const bReason = $("#bReason");
const blockMsg = $("#blockMsg");
const blocksWrap = $("#blocksWrap");
const btnReloadBlocks = $("#btnReloadBlocks");

const rangeForm = $("#rangeForm");
const rFrom = $("#rFrom");
const rTo = $("#rTo");
const reportsMsg = $("#reportsMsg");
const summaryWrap = $("#summaryWrap");
const servicesWrap = $("#servicesWrap");

function setMsg(text = "") {
  if (msg) msg.textContent = text;
}
function setBlockMsg(text = "") {
  if (blockMsg) blockMsg.textContent = text;
}
function setReportsMsg(text = "") {
  if (reportsMsg) reportsMsg.textContent = text;
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---- Renders
function renderNext(items) {
  if (!nextWrap) return;
  nextWrap.innerHTML = "";

  if (!items?.length) {
    nextWrap.innerHTML = `<div class="text-sm text-white/70">No hay próximos turnos.</div>`;
    return;
  }

  for (const a of items) {
    nextWrap.insertAdjacentHTML(
      "beforeend",
      `
      <div class="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div class="flex items-center justify-between gap-2">
          <div class="font-semibold">${escapeHtml(a.service)} · ${escapeHtml(a.status)}</div>
          <div class="text-sm text-white/70">$${Number(a.price || 0).toLocaleString("es-AR")}</div>
        </div>
        <div class="text-sm text-white/70 mt-1">${escapeHtml(a.date)} ${escapeHtml(String(a.time).slice(0,5))}</div>
        <div class="text-xs text-white/50 mt-1">
          user: ${escapeHtml(String(a.user_id).slice(0,8))}… · client: ${escapeHtml(String(a.client_id).slice(0,8))}…
        </div>
      </div>
      `
    );
  }
}

function renderBlocks(items) {
  if (!blocksWrap) return;
  blocksWrap.innerHTML = "";

  if (!items?.length) {
    blocksWrap.innerHTML = `<div class="text-white/70">No hay días bloqueados.</div>`;
    return;
  }

  for (const b of items) {
    blocksWrap.insertAdjacentHTML(
      "beforeend",
      `
      <div class="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/30 p-3">
        <div>
          <div class="font-semibold">${escapeHtml(b.date)}</div>
          <div class="text-xs text-white/60">${escapeHtml(b.reason || "")}</div>
        </div>
        <button data-del="${escapeHtml(b.id)}"
          class="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm">
          Borrar
        </button>
      </div>
      `
    );
  }
}

function renderSummary(data) {
  if (!summaryWrap) return;
  summaryWrap.innerHTML = `
    <div><span class="text-white/60">Desde:</span> ${escapeHtml(data.range?.from || "")}</div>
    <div><span class="text-white/60">Hasta:</span> ${escapeHtml(data.range?.to || "")}</div>
    <div class="mt-2"><span class="text-white/60">Total:</span> ${data.total ?? 0}</div>
    <div><span class="text-white/60">Pendiente:</span> ${data.pendiente ?? 0}</div>
    <div><span class="text-white/60">Confirmado:</span> ${data.confirmado ?? 0}</div>
    <div><span class="text-white/60">Cancelado:</span> ${data.cancelado ?? 0}</div>
  `;
}

function renderServices(data) {
  if (!servicesWrap) return;

  const items = data.items || [];
  if (!items.length) {
    servicesWrap.innerHTML = `<div class="text-white/70">Sin datos en el rango.</div>`;
    return;
  }

  servicesWrap.innerHTML = items
    .map(
      (it) => `
      <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div>${escapeHtml(it.service)}</div>
        <div class="font-semibold">${it.count}</div>
      </div>
    `
    )
    .join("");
}

// ---- Loads
async function loadDashboard() {
  setMsg("");
  const data = await api("/api/admin/dashboard");
  if (mUsers) mUsers.textContent = data.usersCount ?? 0;
  if (mClients) mClients.textContent = data.clientsCount ?? 0;
  if (mAppts) mAppts.textContent = data.appointmentsCount ?? 0;
  renderNext(data.nextAppointments || []);
}

async function loadBlocks() {
  setBlockMsg("");
  const data = await api("/api/admin/blocked-days");
  renderBlocks(data);
}

async function loadReports() {
  setReportsMsg("");
  const qs = new URLSearchParams();
  if (rFrom?.value) qs.set("from", rFrom.value);
  if (rTo?.value) qs.set("to", rTo.value);

  const [summary, services] = await Promise.all([
    api(`/api/admin/reports/summary?${qs.toString()}`),
    api(`/api/admin/reports/services?${qs.toString()}`)
  ]);

  renderSummary(summary);
  renderServices(services);
}

// ---- Events
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    clearToken();
    window.location.href = "/";
  });
}

if (btnReloadBlocks) btnReloadBlocks.addEventListener("click", loadBlocks);

if (blocksWrap) {
  blocksWrap.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-del]");
    if (!btn) return;

    const id = btn.dataset.del;
    try {
      await api(`/api/admin/blocked-days/${id}`, { method: "DELETE" });
      await loadBlocks();
    } catch (err) {
      setBlockMsg(err.message);
    }
  });
}

if (blockForm) {
  blockForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setBlockMsg("");

    try {
      await api("/api/admin/blocked-days", {
        method: "POST",
        body: { date: bDate?.value, reason: bReason?.value?.trim() || null }
      });

      if (bReason) bReason.value = "";
      await loadBlocks();
      setBlockMsg("Día bloqueado ✅");
    } catch (err) {
      setBlockMsg(err.message);
    }
  });
}

if (rangeForm) {
  rangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await loadReports();
    } catch (err) {
      setReportsMsg(err.message);
    }
  });
}

// ---- Init
(async function init() {
  try {
    await loadDashboard();
    await loadBlocks();
    await loadReports();
  } catch (err) {
    setMsg(err.message);
  }
})();