const $ = (sel) => document.querySelector(sel);

const calendarGrid = $("#calendarGrid");
const monthTitle = $("#monthTitle");
const selectedDateLabel = $("#selectedDateLabel");
const timelineList = $("#timelineList");
const statusFilter = $("#statusFilter");
const btnToday = $("#btnToday");
const prevMonth = $("#prevMonth");
const nextMonth = $("#nextMonth");

const modal = $("#modal");
const btnNew = $("#btnNew");
const closeModal = $("#closeModal");
const apptForm = $("#apptForm");
const mockCreate = $("#mockCreate");

let viewDate = new Date();
let selectedDate = new Date();

const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Mock data (después lo traemos desde /api/appointments)
let appointments = [
  { id: 1, date: toISODate(new Date()), time:"10:00", client:"Sofi Medina", service:"Uñas", status:"confirmado", notes:"Semi permanente" },
  { id: 2, date: toISODate(new Date()), time:"12:30", client:"Luz P.", service:"Cejas", status:"pendiente", notes:"Perfilado" },
  { id: 3, date: toISODate(new Date()), time:"16:00", client:"Camila R.", service:"Pestañas", status:"cancelado", notes:"Reprograma" },
];

function renderMonth(){
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  monthTitle.textContent = `${monthNames[month]} ${year}`;

  calendarGrid.innerHTML = "";

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // lunes=0

  // celdas previas vacías
  for(let i=0;i<startOffset;i++){
    const cell = document.createElement("div");
    cell.className = "day muted";
    cell.textContent = "";
    calendarGrid.appendChild(cell);
  }

  for(let day=1; day<=last.getDate(); day++){
    const d = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    const iso = toISODate(d);
    const todayISO = toISODate(new Date());
    if(iso === todayISO) cell.classList.add("today");
    if(iso === toISODate(selectedDate)) cell.classList.add("selected");

    // marcador sutil si hay turnos ese día
    const hasAppts = appointments.some(a => a.date === iso);
    if(hasAppts){
      cell.style.boxShadow = "inset 0 -3px 0 rgba(198,182,255,.35)";
    }

    cell.addEventListener("click", () => {
      selectedDate = d;
      renderMonth();
      renderTimeline();
    });

    calendarGrid.appendChild(cell);
  }

  selectedDateLabel.textContent = formatNice(selectedDate);
}

function formatNice(d){
  const opts = { weekday:"long", day:"2-digit", month:"long" };
  return d.toLocaleDateString("es-AR", opts);
}

function renderTimeline(){
  const iso = toISODate(selectedDate);
  const filter = statusFilter.value;

  let list = appointments
    .filter(a => a.date === iso)
    .sort((a,b) => a.time.localeCompare(b.time));

  if(filter !== "all"){
    list = list.filter(a => a.status === filter);
  }

  if(list.length === 0){
    timelineList.innerHTML = `
      <div class="cardline">
        <div class="title">No hay turnos para este día</div>
        <div class="notes">Sumá uno con “Nuevo turno”.</div>
      </div>
    `;
    return;
  }

  timelineList.innerHTML = list.map(a => `
    <div class="entry">
      <div class="line"><span class="pill ${a.status}"></span></div>
      <div class="cardline">
        <div class="meta">
          <div>
            <div class="time">${a.time}</div>
            <div class="tag">${a.service} · <span style="text-transform:capitalize">${a.status}</span></div>
          </div>
          <div class="tag">#${a.id}</div>
        </div>
        <div class="title">${a.client}</div>
        ${a.notes ? `<div class="notes">${a.notes}</div>` : ""}
      </div>
    </div>
  `).join("");
}

statusFilter.addEventListener("change", renderTimeline);

btnToday.addEventListener("click", () => {
  viewDate = new Date();
  selectedDate = new Date();
  renderMonth();
  renderTimeline();
});

prevMonth.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
  renderMonth();
});
nextMonth.addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
  renderMonth();
});

// Modal
btnNew.addEventListener("click", () => modal.classList.remove("hidden"));
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if(e.target === modal) modal.classList.add("hidden");
});

mockCreate.addEventListener("click", () => {
  // demo: crea un turno random en el día seleccionado
  const iso = toISODate(selectedDate);
  const id = Math.floor(Math.random()*9000)+1000;
  appointments.push({
    id,
    date: iso,
    time: "18:00",
    client: "Cliente Demo",
    service: "Uñas",
    status: "pendiente",
    notes: "Creado desde la demo"
  });
  renderMonth();
  renderTimeline();
  modal.classList.add("hidden");
});

apptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // por ahora demo (después conectamos a API real)
  const iso = $("#date").value || toISODate(selectedDate);
  const id = Math.floor(Math.random()*9000)+1000;

  appointments.push({
    id,
    date: iso,
    time: $("#time").value,
    client: $("#clientName").value,
    service: $("#service").value,
    status: "pendiente",
    notes: $("#notes").value
  });

  apptForm.reset();
  renderMonth();
  renderTimeline();
  modal.classList.add("hidden");
});

renderMonth();
renderTimeline();