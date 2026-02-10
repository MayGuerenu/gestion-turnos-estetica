import { api, clearToken, getToken } from "./api.js";

const $ = (sel) => document.querySelector(sel);

const dateInput = $("#dateInput");
const statusFilter = $("#statusFilter");
const appointmentsWrap = $("#appointmentsWrap");
const apptMsg = $("#apptMsg");

const btnNew = $("#btnNew");
const btnLogout = $("#btnLogout");
const btnRefresh = $("#btnRefresh");

const modal = $("#modal");
const btnClose = $("#btnClose");
const apptForm = $("#apptForm");

const clientForm = $("#clientForm");
const clientMsg = $("#clientMsg");

const aClient = $("#aClient");
const aService = $("#aService");
const aDate = $("#aDate");
const aTime = $("#aTime");
const aDuration = $("#aDuration");
const aPrice = $("#aPrice");
const aNotes = $("#aNotes");
const modalMsg = $("#modalMsg");

// Calendar
const calTitle = $("#calTitle");
const calGrid = $("#calGrid");
const calPrev = $("#calPrev");
const calNext = $("#calNext");
const btnToday = $("#btnToday");
const selectedDateLabel = $("#selectedDateLabel");

let clientsCache = [];
let selectedDate = new Date(); // hoy
let calCursor = new Date();    // mes mostrado

function isoDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyDate(d) {
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function setInfoMsg(el, text = "") {
  el.textContent = text;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/";
    return false;
  }
  return true;
}

// ----- UI helpers
function chip(service) {
  const map = {
    "Uñas": "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/20",
    "Cejas": "bg-sky-500/15 text-sky-200 border-sky-400/20",
    "Pestañas": "bg-emerald-500/15 text-emerald-200 border-emerald-400/20"
  };
  return map[service] || "bg-white/10 text-white/80 border-white/10";
}

function statusBadge(status) {
  const map = {
    pendiente: "bg-amber-500/15 text-amber-200 border-amber-400/20",
    confirmado: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
    cancelado: "bg-rose-500/15 text-rose-200 border-rose-400/20"
  };
  return map[status] || "bg-white/10 text-white/80 border-white/10";
}

function renderAppointments(items) {
  appointmentsWrap.innerHTML = "";
if (!items.length) {
  appointmentsWrap.innerHTML = `
    <div class="rounded-2xl border border-white/10 bg-slate-950/40 p-8">
      <div class="text-lg font-semibold">No hay turnos para este día</div>
      <div class="mt-2 text-sm text-white/70">
        Elegí otra fecha o creá uno con 
        <span class="text-fuchsia-200 font-semibold">“+ Nuevo turno”</span>.
      </div>

      <div class="mt-6 grid grid-cols-3 gap-3 text-xs text-white/60">
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <div class="text-white/80 font-semibold">Tip</div>
          <div>Usá “Ir a hoy” para volver rápido.</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <div class="text-white/80 font-semibold">Filtro</div>
          <div>Probá filtrar por estado.</div>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <div class="text-white/80 font-semibold">Cliente</div>
          <div>Podés cargar uno rápido a la izquierda.</div>
        </div>
      </div>
    </div>
  `;
  return;
}

  items.forEach((a) => {
    const time = (a.time || "").slice(0, 5);
    const clientName = a.clients?.name || "Cliente";
    const phone = a.clients?.phone ? ` · ${a.clients.phone}` : "";

    appointmentsWrap.insertAdjacentHTML("beforeend", `
      <div class="flex gap-4">
        <div class="w-20 text-right">
          <div class="font-semibold">${time}</div>
          <div class="text-xs text-white/60">${a.duration_min} min</div>
        </div>

        <div class="flex-1 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2 py-1 text-xs rounded-full border ${chip(a.service)}">${a.service}</span>
                <span class="px-2 py-1 text-xs rounded-full border ${statusBadge(a.status)}">${a.status}</span>
              </div>
              <div class="mt-2 font-semibold">${clientName}<span class="text-white/50 font-normal">${phone}</span></div>
              <div class="text-sm text-white/70">${a.notes ?? ""}</div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <div class="text-right mr-2">
                <div class="font-semibold">$${Number(a.price).toLocaleString("es-AR")}</div>
                <div class="text-xs text-white/50">id: ${a.id.slice(0, 8)}…</div>
              </div>

              <button data-act="confirm" data-id="${a.id}" class="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                ${a.status === "confirmado" || a.status === "cancelado" ? "disabled style='opacity:.45;cursor:not-allowed'" : ""}>
                Confirmar
              </button>

              <button data-act="cancel" data-id="${a.id}" class="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                ${a.status === "cancelado" ? "disabled style='opacity:.45;cursor:not-allowed'" : ""}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  });
}

async function loadClients() {
  clientsCache = await api("/api/clients");
  aClient.innerHTML = `<option value="">Seleccioná un cliente</option>` +
    clientsCache.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadAppointments() {
  setInfoMsg(apptMsg, "");
  const date = dateInput.value;
  const status = statusFilter.value;

  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  if (status) qs.set("status", status);

  const items = await api(`/api/appointments?${qs.toString()}`);
  renderAppointments(items);
}

function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setInfoMsg(modalMsg, "");
  aDate.value = dateInput.value;
  aTime.value = "10:00";
  aNotes.value = "";
  aPrice.value = 0;
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ---- Calendar render
function monthTitle(d) {
  const txt = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
function renderCalendar() {
  calTitle.textContent = monthTitle(calCursor);
  // Monday-first index
  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  let startDay = first.getDay(); // 0=Sun
  startDay = (startDay === 0) ? 6 : startDay - 1; // 0=Mon ... 6=Sun

  const totalCells = startDay + last.getDate();
  const rows = Math.ceil(totalCells / 7) * 7;

  calGrid.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const dayNum = i - startDay + 1;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "h-10 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-white/10 transition text-sm";

    if (dayNum < 1 || dayNum > last.getDate()) {
      cell.disabled = true;
      cell.className += " opacity-30 cursor-not-allowed";
      cell.textContent = "";
    } else {
      const cellDate = new Date(year, month, dayNum);
      const iso = isoDate(cellDate);
      cell.dataset.date = iso;
      cell.textContent = String(dayNum);

      const isSelected = iso === isoDate(selectedDate);
      const isToday = iso === isoDate(new Date());

      if (isSelected) cell.className += " ring-2 ring-fuchsia-400 bg-fuchsia-500/10";
      else if (isToday) cell.className += " border-fuchsia-300/30";

      cell.addEventListener("click", async () => {
        selectedDate = cellDate;
        dateInput.value = isoDate(selectedDate);
        selectedDateLabel.textContent = prettyDate(selectedDate);
        renderCalendar();
        await loadAppointments();
      });
    }

    calGrid.appendChild(cell);
  }

  selectedDateLabel.textContent = prettyDate(selectedDate);
}

// ---- Actions on cards (confirm/cancel)
appointmentsWrap?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;

  const id = btn.dataset.id;
  const act = btn.dataset.act;

  try {
    if (act === "cancel") {
      await api(`/api/appointments/${id}`, { method: "DELETE" });
    }

    if (act === "confirm") {
      await api(`/api/appointments/${id}`, { method: "PUT", body: { status: "confirmado" } });
    }

    await loadAppointments();
  } catch (err) {
    setInfoMsg(apptMsg, err.message);
  }
});

// ---- Event bindings
btnLogout.addEventListener("click", () => {
  clearToken();
  window.location.href = "/";
});

btnNew.addEventListener("click", () => openModal());
btnClose.addEventListener("click", () => closeModal());
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
btnRefresh.addEventListener("click", () => loadAppointments());

clientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setInfoMsg(clientMsg, "");
  const name = $("#cName").value.trim();
  const phone = $("#cPhone").value.trim();
  const notes = $("#cNotes").value.trim();

  try {
    await api("/api/clients", {
      method: "POST",
      body: { name, phone: phone || null, notes: notes || null }
    });

    $("#cName").value = "";
    $("#cPhone").value = "";
    $("#cNotes").value = "";

    setInfoMsg(clientMsg, "Cliente guardado ✅");
    await loadClients();
  } catch (err) {
    setInfoMsg(clientMsg, err.message);
  }
});

apptForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setInfoMsg(modalMsg, "");

  const payload = {
    client_id: aClient.value,
    service: aService.value,
    date: aDate.value,
    time: aTime.value,
    duration_min: Number(aDuration.value),
    price: Number(aPrice.value),
    notes: aNotes.value.trim() || null
  };

  try {
    await api("/api/appointments", { method: "POST", body: payload });
    closeModal();
    await loadAppointments();
  } catch (err) {
    setInfoMsg(modalMsg, err.message);
  }
});

// Calendar nav
calPrev.addEventListener("click", () => {
  calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() - 1, 1);
  renderCalendar();
});
calNext.addEventListener("click", () => {
  calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 1);
  renderCalendar();
});
btnToday.addEventListener("click", async () => {
  selectedDate = new Date();
  calCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  dateInput.value = isoDate(selectedDate);
  renderCalendar();
  await loadAppointments();
});

// ---- Init
(async function init() {
  if (!requireAuth()) return;

  selectedDate = new Date();
  calCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

  dateInput.value = isoDate(selectedDate);
  statusFilter.value = "";

  renderCalendar();

  try {
    await loadClients();
    await loadAppointments();
  } catch (err) {
    setInfoMsg(apptMsg, err.message);
  }
})();
