/* ============================================================
   DRIVE. — UI Utilities
   Toasts, Animations, Skeleton Loaders
   ============================================================ */

// Toast system
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const colors = { success: "#00c48c", error: "#ff4444", warning: "#ffaa00", info: "#3b82f6" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon" style="color:${colors[type]}">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(() => this.parentElement.remove(), 300);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;

  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("toast-exit"); setTimeout(() => toast.remove(), 300); }, 4000);
}

// Animate counter
function animateCounter(el, target, duration = 800) {
  const start = 0;
  const startTime = performance.now();
  const prefix = el.textContent.startsWith("₹") ? "₹" : "";
  const numTarget = parseInt(String(target).replace(/[₹,]/g, ""));

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (numTarget - start) * eased);
    el.textContent = prefix + current.toLocaleString("en-IN");
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Intersection Observer for reveal animations
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// Fuel gauge helper
function getFuelClass(level) {
  if (level >= 60) return "high";
  if (level >= 30) return "medium";
  return "low";
}

// Loading skeleton generators
function skeletonCards(count = 3) {
  return Array(count).fill("").map(() => `
    <div class="vehicle-card">
      <div class="skeleton skeleton-card"></div>
      <div style="padding:20px">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text" style="width:80%"></div>
        <div class="skeleton skeleton-text" style="width:40%"></div>
      </div>
    </div>`).join("");
}

function skeletonTable(rows = 5) {
  return `<div class="data-table">
    <table class="table"><thead><tr>
      ${Array(4).fill("").map(() => '<th><div class="skeleton skeleton-text" style="width:80px;height:12px"></div></th>').join("")}
    </tr></thead><tbody>
    ${Array(rows).fill("").map(() => `<tr>${Array(4).fill("").map(() => '<td><div class="skeleton skeleton-text"></div></td>').join("")}</tr>`).join("")}
    </tbody></table></div>`;
}

function skeletonStats(count = 4) {
  return Array(count).fill("").map(() => `
    <div class="stat-card">
      <div class="skeleton skeleton-avatar" style="margin-bottom:16px"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text" style="width:60%"></div>
    </div>`).join("");
}
