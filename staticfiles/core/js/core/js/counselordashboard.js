document.addEventListener("DOMContentLoaded", () => {
  console.log("MindEase Counselor Dashboard ready ✅");

  // Animate progress bars
  document.querySelectorAll(".progress-fill").forEach((bar) => {
    const target = bar.dataset.progress;
    setTimeout(() => {
      bar.style.width = `${target}%`;
    }, 300);
  });

  // Join session click
  document.querySelectorAll(".join-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const client = btn.dataset.client || "Client";
      alert(`Joining session with ${client}...`);
    });
  });

  // Quick action handlers
  document.querySelectorAll(".quick-action").forEach((action) => {
    action.addEventListener("click", () => {
      const actionType = action.dataset.action;
      switch (actionType) {
        case "availability":
          window.location.href = "/counselor/availability/";
          break;
        case "records":
          window.location.href = "/counselor/patients/";
          break;
        case "profile":
          window.location.href = "/counselor/profile/";
          break;
      }
    });
  });
});
