// MindEase Dashboard JS
// Handles animations and interactions for the counselor dashboard

// Function: Animates progress bars on page load
// Listens for DOM content to be fully loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // Check if user prefers reduced motion (for accessibility)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // Select all progress bar fill elements
  const bars = document.querySelectorAll(".progress-fill");
  
  // Loop through each progress bar and animate it
  bars.forEach((bar, index) => {
    // Get the target progress value from the data attribute
    const target = parseFloat(bar.getAttribute("data-progress"));
    
    // Validate: Ensure target is a number between 0 and 100
    if (isNaN(target) || target < 0 || target > 100) {
      console.warn("Invalid data-progress value:", target, "for element:", bar);
      return; // Skip invalid bars
    }
    
    // Set initial width to 0% for animation start
    bar.style.width = "0%";
    
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      bar.style.width = target + "%"; // Set directly without animation
      return;
    }
    
    // Animate to target width after a slight delay (staggered for visual effect)
    setTimeout(() => {
      // Add a CSS class to trigger smooth transition (requires CSS: .progress-fill { transition: width 1s ease; })
      bar.classList.add("animate");
      bar.style.width = target + "%";
    }, 200 + (index * 100)); // Stagger by 100ms per bar
  });
});




