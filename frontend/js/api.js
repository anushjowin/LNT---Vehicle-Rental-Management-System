const API_BASE = "http://localhost:5000/api";

function getToken() { return localStorage.getItem("drive_token"); }
function setToken(token) { localStorage.setItem("drive_token", token); }
function getUser() { const u = localStorage.getItem("drive_user"); return u ? JSON.parse(u) : null; }
function setUser(user) { localStorage.setItem("drive_user", JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem("drive_token"); localStorage.removeItem("drive_user"); }
function isAuthenticated() { return !!getToken(); }

function requireAuth() {
  if (!isAuthenticated()) { window.location.href = "index.html"; return false; }
  return true;
}

function requireRole(...roles) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    if (typeof showToast === "function") showToast("You don't have permission for this page.", "error");
    else alert("Access denied.");
    window.location.href = "dashboard.html";
    return false;
  }
  return true;
}

async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const config = { ...options, headers: { ...headers, ...options.headers } };
  if (config.body && typeof config.body === "object") config.body = JSON.stringify(config.body);

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { clearAuth(); window.location.href = "index.html"; return; }
      throw { status: res.status, ...data };
    }
    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { success: false, message: "Network error. Please try again.", errorCode: "NETWORK_ERROR" };
  }
}

function showAlert(container, message, type = "danger") {
  if (!container) return;
  const colorMap = { danger: "#ff4444", success: "#00c48c", warning: "#ffaa00", info: "#3b82f6" };
  const bgMap = { danger: "rgba(255,68,68,0.12)", success: "rgba(0,196,140,0.12)", warning: "rgba(255,170,0,0.12)", info: "rgba(59,130,246,0.12)" };
  const div = document.createElement("div");
  div.className = "alert-custom";
  div.style.cssText = `background:${bgMap[type] || bgMap.danger};color:${colorMap[type] || colorMap.danger};padding:12px 16px;border-radius:10px;margin-bottom:12px;font-size:0.875rem;display:flex;align-items:center;justify-content:space-between;animation:fadeInUp 0.3s ease;`;
  div.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;opacity:0.6;font-size:1.1rem">&times;</button>`;
  container.prepend(div);
  setTimeout(() => { if (div.parentElement) div.remove(); }, 5000);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount) {
  return "\u20B9" + Number(amount).toLocaleString("en-IN");
}
