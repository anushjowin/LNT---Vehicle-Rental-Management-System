function buildLayout(activePage) {
  const user = getUser();
  if (!user) return;
  const navItems = getNavItems(user.role);

  const html = `
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.2 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
      <span class="logo-text">DRIVE<span>.</span></span>
    </div>
    <nav class="sidebar-nav">
      ${buildNavSections(navItems, activePage)}
    </nav>
    <div class="sidebar-footer">
      Vehicle Rental System
    </div>
  </aside>

  <div class="main-content">
    <header class="topbar">
      <div class="d-flex align-center gap-3">
        <button class="mobile-toggle" onclick="openSidebar()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="page-title" id="pageTitle"></div>
      </div>
      <div class="user-info">
        <span class="user-name">${user.name}</span>
        <span class="role-badge ${user.role}">${user.role}</span>
        <button class="btn-logout" onclick="handleLogout()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </header>
    <div class="page-content" id="pageContent"></div>
  </div>`;

  document.getElementById("appLayout").innerHTML = html;
}

function buildNavSections(items, activePage) {
  const sections = {
    "MAIN": [],
    "MANAGEMENT": [],
    "ANALYTICS": [],
    "ACCOUNT": []
  };

  items.forEach(item => {
    if (["dashboard", "vehicles"].includes(item.page)) sections["MAIN"].push(item);
    else if (["manage-vehicles", "branches", "pickup", "return"].includes(item.page)) sections["MANAGEMENT"].push(item);
    else if (["reports", "my-bookings"].includes(item.page)) sections["ANALYTICS"].push(item);
    else sections["ACCOUNT"].push(item);
  });

  let html = "";
  for (const [label, sectionItems] of Object.entries(sections)) {
    if (sectionItems.length === 0) continue;
    html += `<div class="sidebar-section"><div class="sidebar-section-label">${label}</div>`;
    sectionItems.forEach(item => {
      html += `<a href="${item.href}" class="nav-item ${item.page === activePage ? 'active' : ''}">${item.icon}<span>${item.label}</span></a>`;
    });
    html += `</div>`;
  }
  return html;
}

function getNavItems(role) {
  const icons = {
    dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    vehicles: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    "my-bookings": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    "manage-vehicles": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.2 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
    pickup: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    return: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    reports: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    branches: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    profile: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  };

  const base = [
    { page: "dashboard", label: "Dashboard", icon: icons.dashboard, href: "dashboard.html" },
    { page: "vehicles", label: "Find vehicles", icon: icons.vehicles, href: "vehicles.html" },
  ];

  if (role === "customer") {
    base.push({ page: "my-bookings", label: "My bookings", icon: icons["my-bookings"], href: "my-bookings.html" });
  }

  if (role === "staff" || role === "admin") {
    base.push({ page: "manage-vehicles", label: "Fleet", icon: icons["manage-vehicles"], href: "manage-vehicles.html" });
    base.push({ page: "pickup", label: "Pickup inspection", icon: icons.pickup, href: "pickup.html" });
    base.push({ page: "return", label: "Return inspection", icon: icons.return, href: "return.html" });
    base.push({ page: "reports", label: "Reports", icon: icons.reports, href: "reports.html" });
  }

  if (role === "admin") {
    base.push({ page: "branches", label: "Branches", icon: icons.branches, href: "branches.html" });
  }

  base.push({ page: "profile", label: "Profile", icon: icons.profile, href: "profile.html" });

  return base;
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("show");
  document.getElementById("sidebarOverlay").classList.add("show");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("show");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

function handleLogout() {
  clearAuth();
  window.location.href = "index.html";
}
