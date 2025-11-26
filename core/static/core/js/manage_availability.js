// ================================
// Manage Availability JS (FULL)
// ================================

// CSRF token
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

// -------------------------------
// Fetch current slots from backend
// -------------------------------
async function fetchSlots() {
  const res = await fetch("/core/api/availability/");
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  return data.slots;
}

// -------------------------------
// Render slots on the left panel
// -------------------------------
function renderSlots(slots) {
  const slotList = document.getElementById("timeSlotList");
  slotList.innerHTML = "";

  if (!slots || slots.length === 0) {
    slotList.innerHTML = `<p id="slotFallback">No slots available</p>`;
    return;
  }

  slots.forEach(slot => {
    const div = document.createElement("div");
    div.className = "time-slot";
    div.setAttribute("aria-label", `Slot ${slot.date}: ${slot.start_time} - ${slot.end_time}`);

    const leftDiv = document.createElement("div");
    leftDiv.className = "slot-left";
    leftDiv.innerHTML = `
      📅 <strong>${slot.date}</strong><br>
      ⏰ ${slot.start_time} - ${slot.end_time}<br>
      🧍 Slots: ${slot.booked_slots}/${slot.total_slots}
    `;

    const rightDiv = document.createElement("div");
    rightDiv.className = "slot-right";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => deleteSlot(slot.id));

    rightDiv.appendChild(removeBtn);
    div.appendChild(leftDiv);
    div.appendChild(rightDiv);
    slotList.appendChild(div);
  });
}

// -------------------------------
// Delete Slot
// -------------------------------
async function deleteSlot(slotId) {
  const confirmResult = await Swal.fire({
    title: "Remove Slot?",
    icon: "warning",
    text: "Are you sure you want to delete this slot?",
    showCancelButton: true,
    confirmButtonText: "Remove"
  });

  if (!confirmResult.isConfirmed) return;

  try {
    const res = await fetch(`/core/api/availability/${slotId}/delete/`, {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken }
    });
    const data = await res.json();

    if (data.success) {
      Swal.fire("Removed!", "Slot deleted.", "success");
      refreshSlots();
    } else {
      Swal.fire("Error", data.message || "Could not remove slot.", "error");
    }
  } catch (err) {
    Swal.fire("Error", "Network error.", "error");
  }
}

// -------------------------------
// Generate time options
// -------------------------------
function generateTimeOptions() {
  const times = [];
  for (let hour = 8; hour <= 20; hour++) {
    ["00", "30"].forEach(min => {
      const ampm = hour < 12 ? "AM" : "PM";
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      times.push(`<option>${h12}:${min} ${ampm}</option>`);
    });
  }
  return times.join("");
}

// -------------------------------
// Add Slot (SweetAlert)
// -------------------------------
async function addSlot() {
  const { value: formValues } = await Swal.fire({
    title: "Add Availability",
    width: 420,
    html: `
      <div style="text-align:left; width:90%; margin:auto; display:flex; flex-direction:column; gap:10px;">
        
        <label>Date</label>
        <input type="date" id="swal-date" class="swal2-input">

        <label>Start Time</label>
        <select id="swal-start-time" class="swal2-input">
          ${generateTimeOptions()}
        </select>

        <label>End Time</label>
        <select id="swal-end-time" class="swal2-input">
          ${generateTimeOptions()}
        </select>

        <label>Total Slots</label>
        <input type="number" id="swal-total-slots" class="swal2-input" min="1" value="1">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Add Slot",
    preConfirm: () => ({
      date: document.getElementById("swal-date").value,
      start_time: document.getElementById("swal-start-time").value,
      end_time: document.getElementById("swal-end-time").value,
      total_slots: document.getElementById("swal-total-slots").value
    })
  });

  if (!formValues) return;

  try {
    const res = await fetch("/core/api/availability/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken
      },
      body: JSON.stringify(formValues)
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire("Success", "Availability added.", "success");
      refreshSlots();
    } else {
      Swal.fire("Error", data.message || "Could not add slot.", "error");
    }
  } catch (err) {
    Swal.fire("Error", "Network error.", "error");
  }
}

// -------------------------------
// Weekly Summary (updated)
// -------------------------------
function updateWeeklySummary(slots) {
  const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const summaryList = document.getElementById("weeklySummary");
  if (!summaryList) return;
  summaryList.innerHTML = "";

  weekdays.forEach(day => {
    // Sum total_slots for this weekday
    const daySlots = slots.filter(s => s.weekday === day);
    const totalSlots = daySlots.reduce((sum, slot) => sum + (slot.total_slots || 0), 0);

    const li = document.createElement("li");
    li.innerHTML = `${day} <span>${totalSlots} slot${totalSlots !== 1 ? "s" : ""}</span>`;
    summaryList.appendChild(li);
  });
}

// -------------------------------
// Refresh all data
// -------------------------------
async function refreshSlots() {
  const slots = await fetchSlots();
  renderSlots(slots);
  updateWeeklySummary(slots);
}

// -------------------------------
// Quick Settings
// -------------------------------
function setupQuickSettings() {
  const copyBtn = document.getElementById("copyLastWeekBtn");
  const clearBtn = document.getElementById("clearScheduleBtn");
  const vacationBtn = document.getElementById("vacationModeBtn");

  // Copy Last Week
  copyBtn?.addEventListener("click", async () => {
    const confirmResult = await Swal.fire({
      title: "Copy Last Week?",
      text: "This will copy all slots from last week.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Copy"
    });

    if (!confirmResult.isConfirmed) return;

    const res = await fetch("/core/api/availability/copy-last-week/", {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken }
    });

    const data = await res.json();
    if (data.success) Swal.fire("Copied!", "Slots copied.", "success");
    refreshSlots();
  });

  // Clear Week
  clearBtn?.addEventListener("click", async () => {
    const confirmResult = await Swal.fire({
      title: "Clear All Slots?",
      text: "This will remove all availability slots.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear"
    });

    if (!confirmResult.isConfirmed) return;

    const res = await fetch("/core/api/availability/clear-week/", {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken }
    });

    const data = await res.json();
    if (data.success) Swal.fire("Cleared!", "All slots deleted.", "success");
    refreshSlots();
  });

  // Vacation Mode
  vacationBtn?.addEventListener("click", async () => {
    const { value: range } = await Swal.fire({
      title: "Set Vacation Mode",
      html: `
        <label>Start Date:</label>
        <input type="date" id="vacationStart" class="swal2-input"><br>
        <label>End Date:</label>
        <input type="date" id="vacationEnd" class="swal2-input">
      `,
      showCancelButton: true,
      preConfirm: () => ({
        start: document.getElementById("vacationStart").value,
        end: document.getElementById("vacationEnd").value
      })
    });

    if (!range.start || !range.end) {
      Swal.fire("Error", "Select both dates.", "error");
      return;
    }

    const res = await fetch("/core/api/availability/vacation-mode/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken
      },
      body: JSON.stringify(range)
    });

    const data = await res.json();
    if (data.success) Swal.fire("Vacation Set", "Schedule blocked.", "success");
    refreshSlots();
  });
}

// -------------------------------
// Initialize
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addSlotBtn")?.addEventListener("click", addSlot);
  setupQuickSettings();
  refreshSlots();
});
