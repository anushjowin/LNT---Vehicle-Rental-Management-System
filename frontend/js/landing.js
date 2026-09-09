/* DRIVE landing — cinematic black × orange.
   Booking + live inventory logic preserved; motion engine layered on top.
   Depends on js/api.js (apiFetch, isAuthenticated, formatCurrency). */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var authed = function () { return typeof isAuthenticated === "function" && isAuthenticated(); };
  var money = function (n) { return typeof formatCurrency === "function" ? formatCurrency(n) : "₹" + Number(n).toLocaleString("en-IN"); };
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  var IMG = {
    cars: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=60"
    ],
    bikes: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=60"
    ]
  };
  var CITY_IMG = {
    Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=60",
    Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=60",
    Goa: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
    Bangalore: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=60",
    Chennai: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=60",
    Hyderabad: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=800&q=60"
  };
  var FALLBACK_CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Goa"];

  /* ---------- loader: black → brand → line → hero ---------- */
  document.body.classList.add("locked");
  var loaderDone = false;
  function release() {
    if (loaderDone) return; loaderDone = true;
    var l = $("#loader");
    if (l) l.classList.add("done");
    document.body.classList.remove("locked");
    document.body.classList.add("ready");
  }
  window.addEventListener("load", function () { setTimeout(release, RM ? 0 : 1050); });
  setTimeout(release, 2800);

  /* ---------- navbar ---------- */
  var nav = $("#nav");
  var prog = $("#progress"), toTop = $("#toTop"), ticking = false;
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 30);
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.setProperty("--p", (max > 0 ? (h.scrollTop / max) * 100 : 0).toFixed(2) + "%");
    if (toTop) toTop.classList.toggle("show", h.scrollTop > 700);
    ticking = false;
    if (!RM) { heroParallax(); bannerParallax(); hscroll(); timelineFill(); }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); });

  var burger = $("#navBurger");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("#mobileMenu a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });

  /* auth-aware nav */
  if (authed()) {
    $("#navLogin").textContent = "Dashboard";
    $("#navLogin").href = "dashboard.html";
    $("#navCta").textContent = "Book Now";
    $("#navCta").href = "vehicles.html";
    $("#mLogin").textContent = "Dashboard";
    $("#mLogin").href = "dashboard.html";
    $("#mCta").textContent = "Book Now";
    $("#mCta").href = "vehicles.html";
  }

  /* active nav indicator */
  var navInd = $("#navInd");
  var spyLinks = $$(".nav-links a[data-sec]");
  function moveInd(link) {
    if (!navInd || !link) return;
    navInd.style.opacity = "1";
    navInd.style.left = link.offsetLeft + "px";
    navInd.style.width = link.offsetWidth + "px";
  }
  if ("IntersectionObserver" in window && navInd) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var link = null;
        spyLinks.forEach(function (a) {
          var on = a.dataset.sec === en.target.id;
          a.classList.toggle("active", on);
          if (on) link = a;
        });
        moveInd(link);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["categories", "locations", "how"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
    window.addEventListener("resize", function () {
      var cur = $(".nav-links a.active");
      if (cur) moveInd(cur);
    });
  }

  /* ---------- custom cursor ---------- */
  var cursor = $("#cursor");
  if (cursor && FINE && !RM) {
    document.body.classList.add("has-cursor");
    var cx = -100, cy = -100, px = cx, py = cy;
    document.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
    (function loop() {
      cx += (px - cx) * 0.22; cy += (py - cy) * 0.22;
      cursor.style.transform = "translate(" + (cx - cursor.offsetWidth / 2) + "px," + (cy - cursor.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", function (e) {
      var view = e.target.closest('[data-cursor="view"]');
      var inter = e.target.closest("a, button, input, .seg-btn, .faq-q");
      cursor.classList.toggle("view", !!view);
      cursor.classList.toggle("grow", !view && !!inter);
    });
  }

  /* ---------- hero parallax (subtle) ---------- */
  var hero = $("#hero"), heroBg = $("#heroBg");
  function heroParallax() {
    if (!hero || !heroBg || !FINE) return;
    var y = Math.min(window.scrollY, hero.offsetHeight);
    if (y < 0) return;
    heroBg.style.translate = "0 " + y * 0.18 + "px";
  }
  if (hero && FINE && !RM) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      heroBg.style.rotate = dx * 0.6 + "deg";
    });
    hero.addEventListener("pointerleave", function () { heroBg.style.rotate = "0deg"; });
  }

  /* ---------- magnetic major CTAs ---------- */
  if (FINE && !RM) {
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = "translate(" + dx * 0.14 + "px," + dy * 0.2 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- button ripple ---------- */
  document.addEventListener("click", function (e) {
    if (RM) return;
    var b = e.target.closest(".btn");
    if (!b) return;
    var r = b.getBoundingClientRect();
    var s = Math.max(r.width, r.height);
    var rip = document.createElement("span");
    rip.className = "ripple";
    rip.style.width = rip.style.height = s + "px";
    rip.style.left = (e.clientX - r.left - s / 2) + "px";
    rip.style.top = (e.clientY - r.top - s / 2) + "px";
    b.appendChild(rip);
    setTimeout(function () { rip.remove(); }, 650);
  });

  /* ---------- pointer-following hover light ---------- */
  if (FINE && !RM) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest("[data-glow]");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    }, { passive: true });
  }

  /* ---------- location dropdown ---------- */
  var POPULAR = ["Bangalore", "Hyderabad", "Chennai", "Mumbai", "Delhi", "Goa"];
  var locBtn = $("#locBtn"), locPop = $("#locPop"), locValue = $("#locValue");
  var selectedCity = "";
  var pinSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  function renderLocations(branchCities) {
    var cities = POPULAR.concat((branchCities || []).filter(function (c) { return POPULAR.indexOf(c) < 0; }));
    locPop.innerHTML = '<li class="loc-group" aria-hidden="true">Current</li>' +
      '<li role="option" aria-selected="false" data-city="__gps"><button type="button">' + pinSvg + 'Use current location</button></li>' +
      '<li class="loc-group" aria-hidden="true">Popular cities</li>' +
      cities.map(function (c) {
        return '<li role="option" aria-selected="false" data-city="' + c + '"><button type="button">' + pinSvg + c + "</button></li>";
      }).join("");
  }
  renderLocations([]);

  function closeLoc() { locPop.hidden = true; locBtn.setAttribute("aria-expanded", "false"); }
  locBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = locPop.hidden;
    locPop.hidden = !open;
    locBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("[data-field='location']")) closeLoc(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLoc(); });
  locPop.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-city]");
    if (!li) return;
    selectedCity = li.dataset.city === "__gps" ? "Current Location" : li.dataset.city;
    locValue.textContent = selectedCity;
    locValue.classList.remove("placeholder");
    $$("li", locPop).forEach(function (x) { x.setAttribute("aria-selected", "false"); });
    li.setAttribute("aria-selected", "true");
    closeLoc();
    refreshLive();
  });

  /* ---------- vehicle type segmented ---------- */
  var vtype = "";
  $$(".seg-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".seg-btn").forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("active");
      b.setAttribute("aria-pressed", "true");
      vtype = b.dataset.vtype;
      refreshLive();
    });
  });

  /* ---------- date defaults ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtLocal(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  var pickupEl = $("#pickupAt"), returnEl = $("#returnAt");
  var p0 = new Date(); p0.setDate(p0.getDate() + 1); p0.setHours(10, 0, 0, 0);
  var r0 = new Date(p0.getTime() + 2 * 24 * 3600 * 1000);
  pickupEl.value = fmtLocal(p0);
  pickupEl.min = fmtLocal(new Date());
  returnEl.value = fmtLocal(r0);
  pickupEl.addEventListener("change", refreshLive);
  returnEl.addEventListener("change", refreshLive);

  /* ---------- live booking summary ---------- */
  var live = $("#searchLive");
  function refreshLive() {
    if (!live) return;
    var city = (locValue || {}).textContent || "";
    var hasCity = city && city.indexOf("Where") !== 0;
    var days = null;
    try {
      var p = new Date(pickupEl.value), r = new Date(returnEl.value);
      if (!isNaN(p) && !isNaN(r) && r > p) days = Math.max(1, Math.round((r - p) / 86400000));
    } catch (ignore) {}
    var t = ($(".seg-btn.active") || {}).textContent || "All";
    var msg = (hasCity ? city.trim() : "Pick a city") + " · " +
      (days ? days + (days === 1 ? " day" : " days") : "choose dates") + " · " + t.trim();
    if (live.textContent !== msg) {
      live.textContent = msg;
      if (!RM) { live.classList.remove("pop"); void live.offsetWidth; live.classList.add("pop"); }
    }
  }
  setTimeout(refreshLive, 600);

  /* ---------- search submit ---------- */
  var searchErr = $("#searchErr"), searchBtn = $("#searchBtn");
  function searchFail(msg) { searchErr.textContent = msg; searchErr.hidden = false; }
  $("#searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    searchErr.hidden = true;
    if (!selectedCity) return searchFail("Please choose a pickup location.");
    var p = new Date(pickupEl.value), r = new Date(returnEl.value);
    if (isNaN(p) || isNaN(r)) return searchFail("Please choose valid pickup and return dates.");
    if (p < new Date(Date.now() - 60000)) return searchFail("Pickup time can't be in the past.");
    if (r <= p) return searchFail("Return must be after pickup.");

    var payload = { city: selectedCity, pickup: pickupEl.value, ret: returnEl.value, type: vtype };
    try { localStorage.setItem("drive_search", JSON.stringify(payload)); } catch (ignore) {}

    searchBtn.classList.add("loading");
    setTimeout(function () {
      if (!authed()) { location.href = "index.html"; return; }
      var q = "?startDate=" + pickupEl.value.slice(0, 10) + "&endDate=" + returnEl.value.slice(0, 10);
      if (vtype) q += "&type=" + vtype;
      location.href = "vehicles.html" + q;
    }, 650);
  });

  /* ---------- featured vehicles (live API) ---------- */
  var vehGrid = $("#vehGrid");
  function skeletons(n) {
    var h = "";
    for (var i = 0; i < n; i++) {
      h += '<div class="skel" aria-hidden="true"><div class="sk sk-img"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>';
    }
    return h;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function bookHref(v) {
    var p = fmtLocal(p0).slice(0, 10), r = fmtLocal(r0).slice(0, 10);
    try {
      var s = JSON.parse(localStorage.getItem("drive_search") || "null");
      if (s && s.pickup && s.ret) { p = s.pickup.slice(0, 10); r = s.ret.slice(0, 10); }
    } catch (ignore) {}
    return "booking.html?vehicleId=" + v._id + "&start=" + p + "&end=" + r;
  }

  function vehCard(v, i, demo) {
    var pool = v.type === "bike" ? IMG.bikes : IMG.cars;
    var img = pool[i % pool.length];
    var avail = !demo && v.status === "available";
    var name = esc(v.brand) + " " + esc(v.model);
    var meta = (v.type === "bike" ? "Bike" : "SUV · Automatic · Petrol");
    if (!demo) meta = (v.type === "bike" ? "Bike" : "Car") + " · " + esc(v.transmission || "Manual") + " · " + esc(v.fuelType || "Petrol");
    var city = esc((v.branchId && v.branchId.city) || v.city || "Bangalore");
    var href = demo ? "vehicles.html" : (authed() ? bookHref(v) : "index.html");
    return '<article class="veh-card" data-glow data-cursor="view">' +
      '<div class="veh-media mask"><img src="' + img + '" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      (demo ? "" : '<span class="veh-badge' + (avail ? "" : " busy") + '">' + (avail ? "Available" : esc(v.status)) + "</span>") +
      '<button class="veh-fav" aria-label="Save ' + name + ' to favorites" aria-pressed="false"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div>' +
      '<div class="veh-body"><h3 class="veh-name">' + name + " <span>" + esc(v.year || "") + "</span></h3>" +
      '<p class="veh-meta">' + meta + "</p>" +
      (demo
        ? '<p class="veh-rate"><span class="stars">★★★★★</span><strong>' + v.rating + "</strong><span>" + v.trips + " trips</span></p>"
        : "") +
      '<div class="veh-foot"><div><span class="veh-price">' + money(v.perDayRate) + " <small>/day</small></span>" +
      '<span class="veh-city">' + city + "</span></div>" +
      '<a class="btn btn-fire btn-ride" href="' + href + '">View ride</a></div></div></article>';
  }

  var DEMO = [
    { brand: "Hyundai", model: "Creta", year: 2024, type: "car", perDayRate: 2900, city: "Bangalore", rating: "4.8", trips: "210+" },
    { brand: "Maruti", model: "Swift", year: 2023, type: "car", perDayRate: 1450, city: "Bangalore", rating: "4.7", trips: "340+" },
    { brand: "Mahindra", model: "Thar", year: 2023, type: "car", perDayRate: 3200, city: "Goa", rating: "4.9", trips: "150+" },
    { brand: "Honda", model: "City", year: 2024, type: "car", perDayRate: 2400, city: "Mumbai", rating: "4.8", trips: "190+" },
    { brand: "Toyota", model: "Innova", year: 2023, type: "car", perDayRate: 3900, city: "Delhi", rating: "4.8", trips: "260+" },
    { brand: "KTM", model: "Duke 390", year: 2024, type: "bike", perDayRate: 1100, city: "Bangalore", rating: "4.7", trips: "120+" }
  ];

  document.addEventListener("click", function (e) {
    var f = e.target.closest(".veh-fav");
    if (!f) return;
    var on = f.classList.toggle("loved");
    f.setAttribute("aria-pressed", on ? "true" : "false");
    if (!RM) { f.classList.remove("burst"); void f.offsetWidth; f.classList.add("burst"); }
  });

  function vehError() {
    vehGrid.innerHTML = '<div class="state-box" role="alert"><h3>Something went wrong.</h3><p>Unable to load vehicles right now.</p><button class="btn btn-fire" id="vehRetry">Try again</button></div>';
    $("#vehRetry").addEventListener("click", loadVehicles);
  }

  var liveVehicles = [];
  function loadVehicles() {
    vehGrid.innerHTML = skeletons(6);
    apiFetch("/vehicles").then(function (res) {
      var list = (res && res.data) || [];
      liveVehicles = list.filter(function (v) { return v.status === "available"; }).concat(
        list.filter(function (v) { return v.status !== "available"; })
      );
      if (!liveVehicles.length) {
        vehGrid.innerHTML = DEMO.map(function (v, i) { return vehCard(v, i, true); }).join("");
      } else {
        vehGrid.innerHTML = liveVehicles.slice(0, 6).map(function (v, i) { return vehCard(v, i, false); }).join("");
      }
      updateVehStat(liveVehicles.length);
      watchMasks();
    }).catch(vehError);
  }

  /* ---------- locations (live branches) ---------- */
  var locGrid = $("#locGrid");
  function locCard(city, count, img) {
    var q = "?city=" + encodeURIComponent(city);
    var href = authed() ? "vehicles.html" + q : "register.html";
    return '<a class="loc-card" data-reveal href="' + href + '"><img src="' + img + '" alt="' + esc(city) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<span class="loc-body"><span><h3>' + esc(city) + "</h3><p>" + (count != null ? count + "+ vehicles" : "Explore fleet") + "</p></span>" +
      '<span class="loc-go">Explore <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span></span></a>';
  }
  function loadLocations() {
    locGrid.innerHTML = skeletons(6);
    apiFetch("/branches").then(function (res) {
      var branches = (res && res.data) || [];
      var byCity = {};
      branches.forEach(function (b) {
        var c = (b.city || "").trim();
        if (c) byCity[c] = (byCity[c] || 0) + 1;
      });
      var cities = Object.keys(byCity);
      renderLocations(cities);
      if (!cities.length) {
        locGrid.innerHTML = FALLBACK_CITIES.map(function (c) { return locCard(c, null, CITY_IMG[c]); }).join("");
        watchReveals(locGrid);
        return;
      }
      var counts = {};
      liveVehicles.forEach(function (v) {
        var c = v.branchId && v.branchId.city;
        if (c) counts[c] = (counts[c] || 0) + 1;
      });
      var ordered = FALLBACK_CITIES.filter(function (c) { return byCity[c]; })
        .concat(cities.filter(function (c) { return FALLBACK_CITIES.indexOf(c) < 0; }));
      locGrid.innerHTML = ordered.slice(0, 6).map(function (c) {
        return locCard(c, (counts[c] || byCity[c] * 14), CITY_IMG[c]);
      }).join("");
      watchReveals(locGrid);
      updateLocStat(branches.length);
    }).catch(function () {
      renderLocations([]);
      locGrid.innerHTML = FALLBACK_CITIES.map(function (c) { return locCard(c, null, CITY_IMG[c]); }).join("");
      watchReveals(locGrid);
    });
  }

  /* ---------- counters ---------- */
  function pretty(el, v) {
    if (el.dataset.dec) return (v / 10).toFixed(1) + (el.dataset.suffix || "");
    if (+el.dataset.to >= 1000) return Math.round(v / 1000) + (el.dataset.suffix || "");
    return Math.round(v) + (el.dataset.suffix || "");
  }
  function updateVehStat(n) {
    var el = $("#statVeh");
    if (el && n > 0) { el.dataset.to = n; el.dataset.suffix = ""; }
  }
  function updateLocStat(n) {
    var el = $("#statLoc");
    if (el && n > 0) { el.dataset.to = n; el.dataset.suffix = ""; }
  }
  var counted = false;
  function runCounts() {
    if (counted) return; counted = true;
    $$(".count").forEach(function (el) {
      var to = parseFloat(el.dataset.to), t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1600, 1);
        el.textContent = pretty(el, to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  function watchCounts() {
    var s = $(".stats");
    if (!("IntersectionObserver" in window)) { runCounts(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { runCounts(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(s);
  }

  /* ---------- reveal on scroll (staggered) ---------- */
  var revealIO = null;
  function watchReveals(root) {
    var els = $$("[data-reveal]:not(.in)", root || document);
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || RM) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var sibs = $$("[data-reveal]", en.target.parentElement);
          var idx = sibs.indexOf(en.target) % 6;
          en.target.style.setProperty("--d", (idx * 90) + "ms");
          en.target.classList.add("in");
          revealIO.unobserve(en.target);
        });
      }, { threshold: 0.12 });
    }
    els.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- image mask reveals ---------- */
  var maskIO = null;
  function watchMasks() {
    var els = $$(".mask:not(.in)");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || RM) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!maskIO) {
      maskIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); maskIO.unobserve(en.target); }
        });
      }, { threshold: 0.2 });
    }
    els.forEach(function (el) { maskIO.observe(el); });
  }

  /* ---------- horizontal showcase (scroll-driven) ---------- */
  var hwrap = $("#hwrap"), htrack = $("#htrack"), hbar = $("#hprogBar");
  function hDesktop() { return window.matchMedia && window.matchMedia("(min-width: 1025px)").matches; }
  function hscroll() {
    if (!hwrap || !htrack || !hDesktop() || RM) {
      if (htrack && !hDesktop()) htrack.style.transform = "";
      return;
    }
    var r = hwrap.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = Math.min(Math.max(-r.top / total, 0), 1);
    var max = htrack.scrollWidth - window.innerWidth + 40;
    htrack.style.transform = "translate3d(" + (-p * max).toFixed(1) + "px,0,0)";
    if (hbar) hbar.style.width = (p * 100).toFixed(1) + "%";
  }
  window.addEventListener("resize", hscroll);

  /* ---------- how-it-works timeline fill ---------- */
  var timeline = $("#timeline"), tlFill = $("#tlFill");
  function timelineFill() {
    if (!timeline || !tlFill || RM) return;
    var steps = $$(".step", timeline);
    var r = timeline.getBoundingClientRect();
    var p = Math.min(Math.max((window.innerHeight * 0.65 - r.top) / r.height, 0), 1);
    tlFill.style.transform = "scaleY(" + p.toFixed(3) + ")";
    steps.forEach(function (s, i) {
      s.classList.toggle("on", p > (i + 0.6) / (steps.length + 0.4));
    });
  }

  /* ---------- banner parallax ---------- */
  var bannerBg = $("#bannerBg");
  function bannerParallax() {
    if (!bannerBg || !FINE) return;
    var sec = bannerBg.parentElement;
    var r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    bannerBg.style.translate = "0 " + (p * -60).toFixed(1) + "px";
  }

  /* ---------- faq ---------- */
  $$(".faq-item").forEach(function (item) {
    var btn = $(".faq-q", item);
    btn.addEventListener("click", function () {
      var open = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (x) {
        x.classList.remove("open");
        $(".faq-q", x).setAttribute("aria-expanded", "false");
      });
      if (!open) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });

  /* ---------- reviews carousel ---------- */
  var track = $("#revTrack"), dots = $("#revDots");
  function cards() { return $$(".rev-card", track); }
  function page() {
    var c = $(".rev-card", track);
    return c ? c.offsetWidth + 20 : 340;
  }
  if (track) {
    $("#revPrev").addEventListener("click", function () { track.scrollBy({ left: -page(), behavior: RM ? "auto" : "smooth" }); });
    $("#revNext").addEventListener("click", function () { track.scrollBy({ left: page(), behavior: RM ? "auto" : "smooth" }); });

    if (dots) {
      cards().forEach(function (_, i) {
        var d = document.createElement("button");
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Go to review " + (i + 1));
        if (i === 0) d.classList.add("on");
        d.addEventListener("click", function () {
          var c = cards()[i];
          if (c) track.scrollTo({ left: c.offsetLeft - track.offsetLeft - 16, behavior: RM ? "auto" : "smooth" });
        });
        dots.appendChild(d);
      });
      track.addEventListener("scroll", function () {
        var cs = cards();
        if (!cs.length) return;
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
        cs.forEach(function (c, i) {
          var cx = c.offsetLeft - track.offsetLeft + c.offsetWidth / 2;
          var d = Math.abs(cx - mid);
          if (d < bd) { bd = d; best = i; }
        });
        $$("button", dots).forEach(function (b, i) {
          b.classList.toggle("on", i === best);
          if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", i === best ? "true" : "false");
        });
        cs.forEach(function (c, i) { c.classList.toggle("on", i === best); });
      }, { passive: true });
    }

    if (!RM) {
      var auto = setInterval(function () {
        if (document.hidden || track.matches(":hover")) return;
        var max = track.scrollWidth - track.clientWidth - 10;
        if (track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: "smooth" });
        else track.scrollBy({ left: page(), behavior: "smooth" });
      }, 4200);
      track.addEventListener("pointerdown", function () { clearInterval(auto); }, { once: true });
      var down = false, sx = 0, sl = 0;
      track.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; sl = track.scrollLeft; });
      window.addEventListener("pointermove", function (e) { if (down) track.scrollLeft = sl - (e.clientX - sx); });
      window.addEventListener("pointerup", function () { down = false; });
    }
  }

  /* ---------- page transitions (300–500ms) ---------- */
  var trans = $("#transition");
  if (trans && !RM) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href$=".html"]');
      if (!a) return;
      var url = a.getAttribute("href");
      if (!url || url.indexOf("#") === 0 || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.origin !== location.origin && url.indexOf("http") === 0) return;
      e.preventDefault();
      trans.classList.add("play");
      setTimeout(function () { location.href = url; }, 430);
    });
  }

  /* ---------- boot ---------- */
  watchReveals(document);
  onScroll();
  loadVehicles();
  loadLocations();
  watchCounts();
})();

/* Ambient motion background — night-highway light leaks, always running.
   Fixed canvas above content: drifting amber glows, passing headlight
   streaks, rising embers. Pauses off-screen; off when reduced motion. */
(function () {
  "use strict";
  var cv = document.getElementById("ambient");
  if (!cv || !cv.getContext) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cv.style.display = "none";
    return;
  }
  var ctx = cv.getContext("2d");
  var W = 0, H = 0;
  function size() {
    var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  function rnd(a, b) { return a + Math.random() * (b - a); }
  var small = W < 600;

  /* slow drifting amber glows */
  var blobs = [];
  for (var i = 0; i < (small ? 2 : 4); i++) {
    blobs.push({
      bx: rnd(0.1, 0.9), by: rnd(0.15, 0.85),
      r: rnd(220, 460),
      sp: rnd(0.00012, 0.0003),
      ph: rnd(0, 6.28), amp: rnd(0.06, 0.16),
      sp2: rnd(0.0001, 0.00024), ph2: rnd(0, 6.28), amp2: rnd(0.05, 0.12),
      a: rnd(0.035, 0.06), hue: rnd(16, 30)
    });
  }

  /* rising embers */
  var embers = [];
  var N = small ? 18 : 36;
  for (var j = 0; j < N; j++) {
    embers.push({ x: rnd(0, 1), y: rnd(0, 1), r: rnd(0.6, 1.9), vy: rnd(0.00012, 0.00045), sway: rnd(10, 46), ph: rnd(0, 6.28), tw: rnd(0.001, 0.003) });
  }

  /* passing headlight streaks */
  var streaks = [];
  var nextStreak = 0;
  function spawn(now) {
    streaks.push({
      y: rnd(0.05, 0.95), x: -rnd(120, 320), len: rnd(120, 320),
      v: rnd(5, 13), h: rnd(1, 2.2), a: rnd(0.05, 0.13),
      warm: Math.random() < 0.7
    });
    nextStreak = now + rnd(1400, 3600);
  }

  var raf = null;
  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    var b, g, x, y;
    for (var k = 0; k < blobs.length; k++) {
      b = blobs[k];
      x = (b.bx + Math.sin(now * b.sp + b.ph) * b.amp) * W;
      y = (b.by + Math.cos(now * b.sp2 + b.ph2) * b.amp2) * H;
      g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
      g.addColorStop(0, "hsla(" + b.hue + ", 100%, 55%," + b.a + ")");
      g.addColorStop(1, "hsla(" + b.hue + ", 100%, 50%, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
    }

    var e;
    for (var m = 0; m < embers.length; m++) {
      e = embers[m];
      e.y -= e.vy * 16;
      if (e.y < -0.02) { e.y = 1.02; e.x = Math.random(); }
      x = (e.x + Math.sin(now * 0.0006 + e.ph) * 0.012) * W;
      y = e.y * H;
      var tw = 0.5 + 0.5 * Math.sin(now * e.tw + e.ph);
      ctx.beginPath();
      ctx.arc(x, y, e.r, 0, 6.283);
      ctx.fillStyle = "rgba(255," + Math.floor(rnd(110, 150)) + ",60," + (0.04 + tw * 0.12).toFixed(3) + ")";
      ctx.fill();
    }

    if (now >= nextStreak) spawn(now);
    for (var s = streaks.length - 1; s >= 0; s--) {
      var st = streaks[s];
      st.x += st.v;
      var edge = Math.min(1, (st.x + st.len) / (W * 0.25), (W + st.len - st.x) / (W * 0.25));
      var a = Math.max(0, st.a * Math.min(1, edge));
      y = st.y * H;
      var grad = ctx.createLinearGradient(st.x, 0, st.x + st.len, 0);
      var col = st.warm ? "255,122,40" : "255,220,180";
      grad.addColorStop(0, "rgba(" + col + ",0)");
      grad.addColorStop(0.7, "rgba(" + col + "," + a.toFixed(3) + ")");
      grad.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = grad;
      ctx.fillRect(st.x, y, st.len, st.h);
      if (st.x - st.len > W) streaks.splice(s, 1);
    }

    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(frame);
  }

  function play() { if (raf == null && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf != null) { cancelAnimationFrame(raf); raf = null; } }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else { nextStreak = performance.now() + 800; play(); }
  });
  nextStreak = performance.now() + 1200;
  play();
})();
