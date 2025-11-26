function filterCounselors() {
  const name = document.getElementById("search").value.toLowerCase();
  const specialization = document.getElementById("specialization").value; // already slugified

  document.querySelectorAll(".counselor-card").forEach(card => {

    const matchesName = card.dataset.name.includes(name);
    const matchesSpec =
      specialization === "all" ||
      card.dataset.specialization.includes(specialization);

    card.style.display = (matchesName && matchesSpec) ? "flex" : "none";
  });
}


// Fetch available slots for a counselor
async function fetchSlots(counselorId) {
  try {
    const res = await fetch(`/core/api/availability/counselor/${counselorId}/`);
    const data = await res.json();
    return data.slots || [];
  } catch (err) {
    console.error("Could not fetch slots", err);
    return [];
  }
}

// Render slots in the counselor card
// Render slots under each counselor with remaining slots
async function renderAllSlots() {
  document.querySelectorAll('.counselor-card').forEach(async card => {
    const counselorId = card.querySelector('.book-btn').dataset.id;
    const slotList = document.getElementById(`slots-${counselorId}`);
    
    const slots = await fetchSlots(counselorId);
    
    if (slots.length === 0) {
      slotList.innerHTML = '<li>No available slots</li>';
      return;
    }
    
    slotList.innerHTML = ''; // Clear previous slots
    
    slots.forEach(slot => {
      const remaining = slot.total_slots - slot.booked_slots;
      const li = document.createElement('li');
      li.textContent = `${slot.weekday} ${slot.start_time} - ${slot.end_time} (${remaining} slots left)`;
      slotList.appendChild(li);
    });
  });
}

// Booking popup
$('.book-btn').click(async function() {
  const counselorId = $(this).data('id');
  const slots = await fetchSlots(counselorId);

  if (slots.length === 0) {
    Swal.fire('No slots available', 'This counselor currently has no available time slots.', 'info');
    return;
  }

  // Build options for select, disable full slots
  const slotOptions = slots.map(s => {
    const remaining = s.total_slots - s.booked_slots;
    return `<option value="${s.id}" ${remaining <= 0 ? 'disabled' : ''}>
              ${s.weekday} ${s.start_time} - ${s.end_time} (${remaining} left)
            </option>`;
  }).join('');

  Swal.fire({
    title: 'Book a Session',
    html: `<select id="swal-slot" class="swal2-input">${slotOptions}</select>`,
    confirmButtonText: 'Book',
    showCancelButton: true,           
    cancelButtonText: 'Cancel',       
    focusConfirm: false,
    preConfirm: () => {
      const slotId = Swal.getPopup().querySelector('#swal-slot').value;
      if (!slotId) Swal.showValidationMessage(`Please select a slot`);
      return { slot_id: slotId };
    }
  }).then(result => {
    if (!result.isConfirmed) return;

    $.ajax({
      url: `/core/book/${counselorId}/`,
      type: 'POST',
      data: {
        'slot_id': result.value.slot_id,
        'csrfmiddlewaretoken': '{{ csrf_token }}'
      },
      success: function(response) {
        Swal.fire('Booked!', 'Your session has been scheduled.', 'success');
        renderAllSlots(); // Refresh slots
      },
      error: function(xhr) {
        const msg = xhr.responseJSON?.error || 'Something went wrong. Please try again.';
        Swal.fire('Error', msg, 'error');
      }
    });
  });
});

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  renderAllSlots();
});
