(function () {
  console.log("[BOOKING ADMIN v6.1 BOOKINGER ØVERST] LOADED");

  var ALLOWED_PATH = "/sider/booking-admin";
  var path = String(window.location.pathname || "");
  while (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
  if (path !== ALLOWED_PATH) return;

  var ROOT_ID = "gk-booking-admin";
  var root = document.getElementById(ROOT_ID);
  if (!root) return;

  var SUPABASE_URL = "https://fwztrnxhfvrlceicctlv.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enRybnhoZnZybGNlaWNjdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTgwMjYsImV4cCI6MjA5NTI5NDAyNn0.q4QthdBWEtUi_Fdz_Ge88E_5CpJMtUvjWhMAa0R0zmE";
  var SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  var BOOKING_WORKER_URL = "https://gk-booking-admin.post-cd6.workers.dev";
  var PRODUCT_API_BASE = "https://cold-shadow-36dc.post-cd6.workers.dev/products/";

  var PRODUCT_NAMES = {
    "1316": "Dart Bane A",
    "1317": "Dart Bane B",
    "1318": "Leie pilsett",
    "1320": "Disc simulator",
    "1322": "Klubbkveld",
    "1349": "Leie hele lokalet"
  };

  var PRODUCT_LIST = [
    { id: "all", name: "Alle bookingprodukter" },
    { id: "1316", name: "Dart Bane A" },
    { id: "1317", name: "Dart Bane B" },
    { id: "1320", name: "Disc simulator" },
    { id: "1322", name: "Klubbkveld" },
    { id: "1349", name: "Leie hele lokalet" }
  ];

  var BOOKING_OVERVIEW_PRODUCTS = [
    { id: "1316", name: "Dart Bane A", type: "dart", capacity: 1 },
    { id: "1317", name: "Dart Bane B", type: "dart", capacity: 1 },
    { id: "1320", name: "Disc simulator", type: "disc", capacity: 1 },
    { id: "1322", name: "Klubbkveld", type: "club", capacity: 10 },
    { id: "1349", name: "Leie hele lokalet", type: "venue", capacity: 1 }
  ];

  var client = null;
  var currentUser = null;
  var currentAdmin = null;
  var rules = [];

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cssOnce() {
    if (document.getElementById("gk-booking-admin-v3-css")) return;

    var css =
      "#gk-booking-admin{max-width:1180px;margin:0 auto;padding:16px;color:#f4f7fb;font-family:inherit}" +
      ".gba-wrap{display:grid;gap:16px}" +
      ".gba-hero{border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,#171717,#101010);border-radius:22px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.35)}" +
      ".gba-kicker{font-size:12px;color:#f0c14b;font-weight:900;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}" +
      ".gba-title{font-size:30px;line-height:1.05;font-weight:1000;margin:0 0 8px}" +
      ".gba-sub{color:rgba(244,247,251,.72);font-size:14px;line-height:1.45}" +
      ".gba-card{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:18px;padding:14px}" +
      ".gba-card h2{font-size:18px;margin:0 0 10px;font-weight:1000}" +
      ".gba-row{display:grid;gap:10px}" +
      "@media(min-width:760px){.gba-row.cols2{grid-template-columns:1fr 1fr}.gba-row.cols3{grid-template-columns:1fr 1fr 1fr}}" +
      ".gba-field{display:grid;gap:6px}" +
      ".gba-label{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:rgba(244,247,251,.65);font-weight:1000}" +
      ".gba-input,.gba-select,.gba-textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);background:#0f0f0f;color:#fff;border-radius:13px;padding:11px 12px;font-size:14px}" +
      ".gba-textarea{min-height:74px;resize:vertical}" +
      ".gba-btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:10px 14px;border-radius:13px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;font-weight:1000;cursor:pointer;text-decoration:none}" +
      ".gba-btn.primary{border-color:rgba(43,209,139,.45);background:linear-gradient(135deg,rgba(43,209,139,.22),rgba(125,255,184,.08))}" +
      ".gba-btn.danger{border-color:rgba(255,95,95,.45);background:rgba(255,95,95,.10)}" +
      ".gba-btn:disabled{opacity:.55;cursor:not-allowed}" +
      ".gba-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}" +
      ".gba-msg{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:14px;padding:11px 12px;color:rgba(244,247,251,.78);font-size:13px;line-height:1.4}" +
      ".gba-msg.ok{border-color:rgba(43,209,139,.35);background:rgba(43,209,139,.10);color:#c8ffe4}" +
      ".gba-msg.bad{border-color:rgba(255,95,95,.35);background:rgba(255,95,95,.10);color:#ffd0d0}" +
      ".gba-products{display:grid;grid-template-columns:1fr;gap:8px}.gba-weekdays{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.gba-hidden{display:none!important}" +
      "@media(min-width:700px){.gba-products{grid-template-columns:repeat(3,1fr)}.gba-weekdays{grid-template-columns:repeat(7,minmax(0,1fr))}}" +
      ".gba-check{display:flex;gap:8px;align-items:center;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:12px;padding:10px;font-size:13px;font-weight:800}" +
      ".gba-table-wrap{overflow:auto;border:1px solid rgba(255,255,255,.10);border-radius:15px}" +
      ".gba-table{width:100%;border-collapse:collapse;min-width:860px}" +
      ".gba-table th,.gba-table td{border-bottom:1px solid rgba(255,255,255,.08);padding:10px 11px;text-align:left;font-size:13px;vertical-align:top}" +
      ".gba-table th{color:rgba(244,247,251,.62);font-size:11px;text-transform:uppercase;letter-spacing:.04em;background:rgba(255,255,255,.04)}" +
      ".gba-pill{display:inline-flex;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);font-size:12px;font-weight:900;margin:1px}" +
      ".gba-pill.closed{border-color:rgba(255,95,95,.35);background:rgba(255,95,95,.10);color:#ffd0d0}" +
      ".gba-pill.price{border-color:rgba(240,193,75,.35);background:rgba(240,193,75,.10);color:#ffe4a3}" +
      ".gba-topbar{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}" +
      ".gba-muted{color:rgba(244,247,251,.62);font-size:13px}";

    var st = document.createElement("style");
    st.id = "gk-booking-admin-v3-css";
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }

  function render(html) {
    root.innerHTML = html;
  }

  function setMsg(id, text, type) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = "gba-msg" + (type ? " " + type : "");
    el.textContent = text || "";
    el.style.display = text ? "block" : "none";
  }

  function loadSupabase(cb) {
    if (window.supabase && window.supabase.createClient) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      cb();
      return;
    }

    var s = document.createElement("script");
    s.src = SUPABASE_JS;
    s.async = true;
    s.onload = function () {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      cb();
    };
    s.onerror = function () {
      render("<div class='gba-wrap'><div class='gba-hero'><div class='gba-title'>Kunne ikke laste Supabase</div><div class='gba-sub'>Prøv å laste siden på nytt.</div></div></div>");
    };
    document.head.appendChild(s);
  }

  function renderLogin() {
    render(
      "<div class='gba-wrap'>" +
      "  <section class='gba-hero'>" +
      "    <div class='gba-kicker'>GolfKongen booking-admin</div>" +
      "    <div class='gba-title'>Logg inn som admin</div>" +
      "    <div class='gba-sub'>Bare godkjente admin-eposter får tilgang. Logg inn med e-post og passord.</div>" +
      "  </section>" +
      "  <section class='gba-card'>" +
      "    <div class='gba-row cols2'>" +
      "      <label class='gba-field'><span class='gba-label'>E-post</span><input id='gba-email' class='gba-input' type='email' autocomplete='username' placeholder='din@epost.no'></label>" +
      "      <label class='gba-field'><span class='gba-label'>Passord</span><input id='gba-password' class='gba-input' type='password' autocomplete='current-password' placeholder='Passord'></label>" +
      "    </div>" +
      "    <div class='gba-actions' style='margin-top:12px'>" +
      "      <button id='gba-login-btn' class='gba-btn primary'>Logg inn</button>" +
      "    </div>" +
      "    <div id='gba-login-msg' class='gba-msg' style='display:none;margin-top:12px'></div>" +
      "  </section>" +
      "</div>"
    );

    function doLogin() {
      var email = String(document.getElementById("gba-email").value || "").trim().toLowerCase();
      var password = String(document.getElementById("gba-password").value || "");

      if (!email) {
        setMsg("gba-login-msg", "Skriv inn e-post først.", "bad");
        return;
      }

      if (!password) {
        setMsg("gba-login-msg", "Skriv inn passord.", "bad");
        return;
      }

      setMsg("gba-login-msg", "Logger inn…", "");

      client.auth.signInWithPassword({
        email: email,
        password: password
      }).then(function (res) {
        if (res.error) {
          setMsg("gba-login-msg", res.error.message || "Kunne ikke logge inn.", "bad");
          return;
        }

        setMsg("gba-login-msg", "Innlogging OK. Sjekker tilgang…", "ok");
        init();
      });
    }

    document.getElementById("gba-login-btn").onclick = doLogin;

    document.getElementById("gba-password").addEventListener("keydown", function (e) {
      if (e.key === "Enter") doLogin();
    });
  }

  function renderDenied(email) {
    render(
      "<div class='gba-wrap'>" +
      "  <section class='gba-hero'>" +
      "    <div class='gba-kicker'>Ingen tilgang</div>" +
      "    <div class='gba-title'>Denne siden er stengt</div>" +
      "    <div class='gba-sub'>Du er innlogget som <strong>" + esc(email || "") + "</strong>, men denne e-posten er ikke godkjent som booking-admin.</div>" +
      "    <div class='gba-actions' style='margin-top:14px'><button id='gba-logout' class='gba-btn'>Logg ut</button></div>" +
      "  </section>" +
      "</div>"
    );
    document.getElementById("gba-logout").onclick = function () {
      client.auth.signOut().then(init);
    };
  }

  function productLabels(ids) {
    ids = Array.isArray(ids) ? ids : ["all"];
    return ids.map(function (id) {
      id = String(id);
      return PRODUCT_NAMES[id] || (id === "all" ? "Alle" : id);
    });
  }


  function weekdayLabels(days) {
    if (!Array.isArray(days) || !days.length) return "Alle dager";
    var names = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
    return days.map(function (d) { return names[Number(d)] || String(d); }).join(", ");
  }

  function getSelectedWeekdays() {
    var vals = [];
    document.querySelectorAll("input[name='gba-weekday']:checked").forEach(function (cb) {
      vals.push(Number(cb.value));
    });
    return vals;
  }


  function renderRulesTable() {
    var el = document.getElementById("gba-rules");
    if (!el) return;

    if (!rules.length) {
      el.innerHTML = "<div class='gba-msg'>Ingen regler er lagt inn ennå.</div>";
      return;
    }

    var html = "<div class='gba-table-wrap'><table class='gba-table'><thead><tr>" +
      "<th>Type</th><th>Navn</th><th>Dato</th><th>Dager</th><th>Tid</th><th>Produkter</th><th>Pris</th><th>Status</th><th></th>" +
      "</tr></thead><tbody>";

    rules.forEach(function (r) {
      var typeClass = r.rule_type === "price" ? "price" : "closed";
      var typeText = r.rule_type === "price" ? "Prisregel" : "Stengt";
      var p = productLabels(r.product_ids).map(function (x) { return "<span class='gba-pill'>" + esc(x) + "</span>"; }).join(" ");
      html += "<tr>" +
        "<td><span class='gba-pill " + typeClass + "'>" + typeText + "</span></td>" +
        "<td><strong>" + esc(r.title) + "</strong><br><span class='gba-muted'>" + esc(r.description || "") + "</span></td>" +
        "<td>" + esc(r.date_from) + (r.date_to !== r.date_from ? " → " + esc(r.date_to) : "") + "</td>" +
        "<td>" + esc(weekdayLabels(r.weekdays)) + "</td>" +
        "<td>" + esc((r.time_from || "Hele åpningstiden").slice(0,5)) + (r.time_to ? "–" + esc(String(r.time_to).slice(0,5)) : "") + "</td>" +
        "<td>" + p + "</td>" +
        "<td>" + (r.rule_type === "price" ? esc(r.price || "") + " kr" : "—") + "</td>" +
        "<td>" + (r.active ? "Aktiv" : "Av") + "</td>" +
        "<td><button class='gba-btn danger' data-del='" + esc(r.id) + "'>Slett</button></td>" +
      "</tr>";
    });

    html += "</tbody></table></div>";
    el.innerHTML = html;

    el.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-del");
        if (!confirm("Slette denne regelen?")) return;
        deleteRule(id);
      };
    });
  }


  function getStoredAdminToken() {
    try {
      return localStorage.getItem("gk_booking_admin_worker_token_v1") || "";
    } catch (e) {
      return "";
    }
  }

  function setStoredAdminToken(token) {
    try {
      localStorage.setItem("gk_booking_admin_worker_token_v1", token || "");
    } catch (e) {}
  }

  function getSyncProducts() {
    var vals = [];
    document.querySelectorAll("input[name='gba-sync-product']:checked").forEach(function (cb) {
      vals.push(cb.value);
    });
    return vals.length ? vals : ["all"];
  }

  function workerProductLabel(productId) {
    if (productId === "all") return "Alle produkter";
    return PRODUCT_NAMES[productId] || productId;
  }

  function runMaintainForProduct(productId, token) {
    var url = BOOKING_WORKER_URL +
      "/booking/maintain-40-days" +
      "?product=" + encodeURIComponent(productId) +
      "&apply=true" +
      "&maxCreate=100" +
      "&maxDelete=100" +
      "&token=" + encodeURIComponent(token);

    return fetch(url, { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        return {
          productId: productId,
          label: workerProductLabel(productId),
          ok: !!(data && data.ok),
          data: data
        };
      })
      .catch(function (e) {
        return {
          productId: productId,
          label: workerProductLabel(productId),
          ok: false,
          error: String(e && e.message ? e.message : e)
        };
      });
  }

  function renderSyncResults(results) {
    var el = document.getElementById("gba-sync-results");
    if (!el) return;

    if (!results || !results.length) {
      el.innerHTML = "";
      return;
    }

    var html = "<div class='gba-table-wrap'><table class='gba-table'><thead><tr><th>Produkt</th><th>Status</th><th>Resultat</th></tr></thead><tbody>";

    results.forEach(function (r) {
      var d = r.data || {};
      var summary = "";

      if (r.error) {
        summary = r.error;
      } else if (d.reports && Array.isArray(d.reports)) {
        summary = d.reports.map(function (rep) {
          return [
            rep.productName || rep.productId || "",
            "mangler: " + (rep.missingTotal || rep.missing || 0),
            "prisavvik: " + (rep.priceMismatchTotal || rep.priceMismatch || 0),
            "utløpt: " + (rep.expiredTotal || rep.expired || 0)
          ].join(" · ");
        }).join("<br>");
      } else {
        summary = esc(JSON.stringify(d).slice(0, 500));
      }

      html += "<tr>" +
        "<td><strong>" + esc(r.label) + "</strong></td>" +
        "<td>" + (r.ok ? "<span class='gba-pill price'>OK</span>" : "<span class='gba-pill closed'>Feil</span>") + "</td>" +
        "<td>" + summary + "</td>" +
      "</tr>";
    });

    html += "</tbody></table></div>";
    el.innerHTML = html;
  }

  function runManualSync() {
    var tokenEl = document.getElementById("gba-worker-token");
    var btn = document.getElementById("gba-sync-now");
    var msgId = "gba-sync-msg";
    var token = String(tokenEl && tokenEl.value || "").trim();
    var products = getSyncProducts();

    if (!token) {
      setMsg(msgId, "Lim inn ADMIN_TOKEN først. Den lagres kun lokalt i nettleseren din.", "bad");
      return;
    }

    setStoredAdminToken(token);

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Oppdaterer…";
    }

    setMsg(msgId, "Oppdaterer bookingprodukter. Dette kan ta litt tid…", "");

    var chain = Promise.resolve([]);
    products.forEach(function (productId) {
      chain = chain.then(function (results) {
        return runMaintainForProduct(productId, token).then(function (result) {
          results.push(result);
          renderSyncResults(results);
          return results;
        });
      });
    });

    chain.then(function (results) {
      var failed = results.filter(function (r) { return !r.ok; }).length;

      if (failed) {
        setMsg(msgId, "Oppdatering fullført, men " + failed + " produkt(er) feilet. Se resultatlisten under.", "bad");
      } else {
        setMsg(msgId, "Oppdatering fullført. Bookingproduktene er synket mot gjeldende regler.", "ok");
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Oppdater valgte produkter nå";
      }
    });
  }



  function parseVariantDateTime(v) {
    var date = "";
    var time = "";

    var vals = Array.isArray(v && v.values) ? v.values : [];

    for (var i = 0; i < vals.length; i++) {
      var val = String((vals[i] && (vals[i].val || vals[i].value || vals[i].name)) || "");

      if (!date) {
        var iso = val.match(/(\d{4}-\d{2}-\d{2})/);
        if (iso) date = iso[1];

        if (!date) {
          var dm = val.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/);
          if (dm) {
            var y = dm[3] || String((new Date()).getFullYear());
            date = y + "-" + ("0" + dm[2]).slice(-2) + "-" + ("0" + dm[1]).slice(-2);
          }
        }
      }

      if (!time) {
        var tm = val.match(/(\d{1,2})[:.]?(\d{2})\s*[-–]\s*(\d{1,2})[:.]?(\d{2})/);
        if (tm) {
          time = ("0" + tm[1]).slice(-2) + ":" + tm[2] + "-" + ("0" + tm[3]).slice(-2) + ":" + tm[4];
        }
      }
    }

    var sku = String(v && v.sku || "");
    var sm = sku.match(/(\d{4}-\d{2}-\d{2})[-_]?(\d{2})(\d{2})[-_]?(\d{2})(\d{2})/);
    if (sm) {
      if (!date) date = sm[1];
      if (!time) time = sm[2] + ":" + sm[3] + "-" + sm[4] + ":" + sm[5];
    }

    return { date: date, time: time };
  }

  function parseVariantPrice(v, product) {
    var candidates = [
      v && v.price,
      v && v.special_price,
      v && v.sale_price,
      product && product.price
    ];

    for (var i = 0; i < candidates.length; i++) {
      var raw = candidates[i];
      if (raw === null || typeof raw === "undefined" || raw === "") continue;
      if (typeof raw === "number") return raw;

      var s = String(raw).replace(/\s/g, "").replace(",", ".");
      var m = s.match(/-?\d+(\.\d+)?/);
      if (!m) continue;

      var n = Number(m[0]);
      if (!isNaN(n)) return n;
    }

    return null;
  }

  function bookingStartDateTime(date, time) {
    if (!date) return null;
    var start = "00:00";
    if (time) start = String(time).split("-")[0] || "00:00";
    var d = new Date(date + "T" + start + ":00");
    return isNaN(d.getTime()) ? null : d;
  }

  function formatBookingDate(date) {
    if (!date) return "";
    var p = String(date).split("-");
    if (p.length !== 3) return date;
    return p[2] + "." + p[1] + "." + p[0];
  }

  function formatBookingPrice(price) {
    if (price === null || typeof price === "undefined" || isNaN(Number(price))) return "";
    return Math.round(Number(price)) + " kr";
  }

  function fetchBookingProduct(cfg) {
    return fetch(PRODUCT_API_BASE + cfg.id, { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        return {
          cfg: cfg,
          product: data && data.product ? data.product : null,
          ok: true
        };
      })
      .catch(function (e) {
        return {
          cfg: cfg,
          product: null,
          ok: false,
          error: String(e && e.message ? e.message : e)
        };
      });
  }

  function buildFutureBookingsFromProduct(result) {
    var cfg = result.cfg;
    var product = result.product;
    var variants = product && Array.isArray(product.variants) ? product.variants : [];
    var now = new Date();
    var out = [];

    for (var i = 0; i < variants.length; i++) {
      var v = variants[i] || {};
      var dt = parseVariantDateTime(v);
      if (!dt.date) continue;

      var start = bookingStartDateTime(dt.date, dt.time);
      if (!start || start.getTime() < now.getTime()) continue;

      var qty = parseInt(v.qty || "0", 10);
      if (isNaN(qty)) qty = 0;

      var capacity = Number(cfg.capacity || 1);
      var booked = 0;
      var statusText = "";

      if (cfg.type === "club") {
        booked = Math.max(0, capacity - qty);
        if (booked <= 0) continue;
        statusText = booked + "/" + capacity + " påmeldt";
      } else {
        if (qty > 0) continue;
        booked = 1;
        statusText = "Booket";
      }

      out.push({
        productId: cfg.id,
        productName: cfg.name,
        type: cfg.type,
        date: dt.date,
        time: dt.time || (cfg.type === "club" ? "19:00-22:00" : ""),
        startTime: start.getTime(),
        qty: qty,
        booked: booked,
        capacity: capacity,
        statusText: statusText,
        variantId: String(v.id || ""),
        sku: String(v.sku || ""),
        price: parseVariantPrice(v, product)
      });
    }

    return out;
  }

  function renderFutureBookings(list) {
    var el = document.getElementById("gba-future-bookings");
    if (!el) return;

    if (!list || !list.length) {
      el.innerHTML = "<div class='gba-msg'>Ingen fremtidige bookinger funnet akkurat nå.</div>";
      return;
    }

    list.sort(function (a, b) {
      return a.startTime - b.startTime || String(a.productName).localeCompare(String(b.productName));
    });

    var html = "<div class='gba-table-wrap'><table class='gba-table'><thead><tr>" +
      "<th>Dato</th><th>Tid</th><th>Booking</th><th>Status</th><th>Pris</th><th>Variant/SKU</th>" +
      "</tr></thead><tbody>";

    list.forEach(function (b) {
      var typeClass = b.type === "club" ? "price" : "closed";

      html += "<tr>" +
        "<td><strong>" + esc(formatBookingDate(b.date)) + "</strong></td>" +
        "<td>" + esc(b.time || "") + "</td>" +
        "<td><strong>" + esc(b.productName) + "</strong></td>" +
        "<td><span class='gba-pill " + typeClass + "'>" + esc(b.statusText) + "</span></td>" +
        "<td>" + esc(formatBookingPrice(b.price)) + "</td>" +
        "<td><span class='gba-muted'>" + esc(b.sku || b.variantId) + "</span></td>" +
      "</tr>";
    });

    html += "</tbody></table></div>";
    el.innerHTML = html;
  }

  function loadFutureBookings() {
    var el = document.getElementById("gba-future-bookings");
    var msg = document.getElementById("gba-future-bookings-msg");
    if (!el) return;

    el.innerHTML = "<div class='gba-msg'>Laster fremtidige bookinger…</div>";
    if (msg) msg.textContent = "";

    Promise.all(BOOKING_OVERVIEW_PRODUCTS.map(fetchBookingProduct))
      .then(function (results) {
        var all = [];

        results.forEach(function (result) {
          all = all.concat(buildFutureBookingsFromProduct(result));
        });

        renderFutureBookings(all);

        if (msg) {
          var failed = results.filter(function (r) { return !r.ok; });
          if (failed.length) {
            msg.className = "gba-msg bad";
            msg.style.display = "block";
            msg.textContent = "Kunne ikke lese " + failed.length + " produkt(er). Se console for detaljer.";
          } else {
            msg.className = "gba-msg ok";
            msg.style.display = "block";
            msg.textContent = "Oppdatert: " + new Date().toLocaleString("no-NO");
          }
        }
      });
  }


  function renderAdmin() {
    var productChecks = PRODUCT_LIST.map(function (p, idx) {
      return "<label class='gba-check'><input type='checkbox' name='gba-product' value='" + esc(p.id) + "'" + (idx === 0 ? " checked" : "") + "> " + esc(p.name) + "</label>";
    }).join("");

    var weekdayChecks = [
      { id: 1, name: "Mandag" },
      { id: 2, name: "Tirsdag" },
      { id: 3, name: "Onsdag" },
      { id: 4, name: "Torsdag" },
      { id: 5, name: "Fredag" },
      { id: 6, name: "Lørdag" },
      { id: 0, name: "Søndag" }
    ].map(function (d) {
      return "<label class='gba-check'><input type='checkbox' name='gba-weekday' value='" + d.id + "'> " + d.name + "</label>";
    }).join("");

    var syncProductChecks = PRODUCT_LIST.filter(function (p) {
      return p.id !== "1318" && p.id !== "1322";
    }).map(function (p, idx) {
      return "<label class='gba-check'><input type='checkbox' name='gba-sync-product' value='" + esc(p.id) + "'" + (idx === 0 ? " checked" : "") + "> " + esc(p.name) + "</label>";
    }).join("");

    render(
      "<div class='gba-wrap'>" +
      "  <section class='gba-hero'>" +
      "    <div class='gba-topbar'>" +
      "      <div>" +
      "        <div class='gba-kicker'>GolfKongen intern bookingverktøy</div>" +
      "        <div class='gba-title'>Booking-admin</div>" +
      "        <div class='gba-sub'>Innlogget som <strong>" + esc(currentUser.email) + "</strong>. Her kan du stenge dager/tider og lage smarte prisregler.</div>" +
      "      </div>" +
      "      <button id='gba-logout' class='gba-btn'>Logg ut</button>" +
      "    </div>" +
      "  </section>" +

      "  <section class='gba-card'>" +
      "    <div class='gba-topbar'>" +
      "      <h2>Fremtidige bookinger</h2>" +
      "      <button id='gba-refresh-bookings' class='gba-btn'>Oppdater bookinger</button>" +
      "    </div>" +
      "    <div class='gba-msg' style='margin:0 0 12px'>Viser kommende bookinger på dart, disc, klubbkveld og hele lokalet. Førstkommende ligger øverst. Foreløpig vises ikke kundenavn, kun bookede varianter/påmeldingsstatus.</div>" +
      "    <div id='gba-future-bookings'></div>" +
      "    <div id='gba-future-bookings-msg' class='gba-msg' style='display:none;margin-top:12px'></div>" +
      "  </section>" +

      "  <section class='gba-card'>" +
      "    <h2>Ny regel</h2>" +
      "    <div class='gba-msg' style='margin-bottom:12px'>Tips: For prisreduksjon på flere lørdager velger du <strong>Prisjustering</strong>, datoperiode, huker av <strong>Lørdag</strong>, lar klokkeslett stå tomt for hele åpningstiden, velger produkter og setter ny pris.</div>" +
      "    <div class='gba-row cols3'>" +
      "      <label class='gba-field'><span class='gba-label'>Type</span><select id='gba-rule-type' class='gba-select'><option value='closed'>Stenging</option><option value='price'>Prisjustering</option></select></label>" +
      "      <label id='gba-title-field' class='gba-field'><span id='gba-title-label' class='gba-label'>Navn</span><input id='gba-title' class='gba-input' placeholder='Ferie, helligdag, privat arrangement, trening'></label>" +
      "      <label id='gba-price-field' class='gba-field'><span class='gba-label'>Ny pris</span><input id='gba-price' class='gba-input' type='number' min='0' step='1' placeholder='f.eks. 100'></label>" +
      "    </div>" +
      "    <div class='gba-row cols3' style='margin-top:10px'>" +
      "      <label class='gba-field'><span class='gba-label'>Fra dato</span><input id='gba-date-from' class='gba-input' type='date'></label>" +
      "      <label class='gba-field'><span class='gba-label'>Til dato</span><input id='gba-date-to' class='gba-input' type='date'></label>" +
      "      <label class='gba-field'><span class='gba-label'>Beskrivelse</span><input id='gba-description' class='gba-input' placeholder='Valgfritt. Vises ikke på prisregler'></label>" +
      "    </div>" +
      "    <div class='gba-field' style='margin-top:10px'><span class='gba-label'>Ukedager</span><div class='gba-weekdays'>" + weekdayChecks + "</div><div class='gba-muted' style='margin-top:6px'>Ingen valg = alle dager i datoperioden.</div></div>" +
      "    <div class='gba-row cols2' style='margin-top:10px'>" +
      "      <label class='gba-field'><span class='gba-label'>Fra klokke</span><input id='gba-time-from' class='gba-input' type='time'></label>" +
      "      <label class='gba-field'><span class='gba-label'>Til klokke</span><input id='gba-time-to' class='gba-input' type='time'></label>" +
      "    </div>" +
      "    <div class='gba-muted' style='margin-top:6px'>Tomt klokkeslett = hele åpningstiden.</div>" +
      "    <div class='gba-field' style='margin-top:10px'><span class='gba-label'>Gjelder produkter</span><div class='gba-products'>" + productChecks + "</div></div>" +
      "    <div class='gba-actions' style='margin-top:14px'>" +
      "      <button id='gba-save' class='gba-btn primary'>Lagre regel</button>" +
      "      <button id='gba-refresh' class='gba-btn'>Oppdater liste</button>" +
      "    </div>" +
      "    <div id='gba-save-msg' class='gba-msg' style='display:none;margin-top:12px'></div>" +
      "  </section>" +

      "  <section class='gba-card'>" +
      "    <h2>Oppdater bookingprodukter nå</h2>" +
      "    <div class='gba-msg' style='margin-bottom:12px'>Bruk denne etter at du har laget eller endret prisregler/stenginger. Den oppdaterer Quickbutik-varianter med gjeldende regler. ADMIN_TOKEN lagres kun lokalt i nettleseren din.</div>" +
      "    <label class='gba-field'><span class='gba-label'>ADMIN_TOKEN</span><input id='gba-worker-token' class='gba-input' type='password' placeholder='Lim inn admin-token'></label>" +
      "    <div class='gba-field' style='margin-top:10px'><span class='gba-label'>Produkter som skal oppdateres</span><div class='gba-products'>" + syncProductChecks + "</div></div>" +
      "    <div class='gba-actions' style='margin-top:14px'>" +
      "      <button id='gba-sync-now' class='gba-btn primary'>Oppdater valgte produkter nå</button>" +
      "    </div>" +
      "    <div id='gba-sync-msg' class='gba-msg' style='display:none;margin-top:12px'></div>" +
      "    <div id='gba-sync-results' style='margin-top:12px'></div>" +
      "  </section>" +

      "  <section class='gba-card'>" +
      "    <h2>Regler</h2>" +
      "    <div id='gba-rules'><div class='gba-msg'>Laster regler…</div></div>" +
      "  </section>" +
      "</div>"
    );

    document.getElementById("gba-logout").onclick = function () {
      client.auth.signOut().then(init);
    };
    document.getElementById("gba-refresh").onclick = loadRules;
    document.getElementById("gba-save").onclick = saveRule;
    document.getElementById("gba-rule-type").addEventListener("change", updateRuleTypeUi);

    var tokenInput = document.getElementById("gba-worker-token");
    if (tokenInput) tokenInput.value = getStoredAdminToken();

    var syncBtn = document.getElementById("gba-sync-now");
    if (syncBtn) syncBtn.onclick = runManualSync;

    var refreshBookingsBtn = document.getElementById("gba-refresh-bookings");
    if (refreshBookingsBtn) refreshBookingsBtn.onclick = loadFutureBookings;

    document.querySelectorAll("input[name='gba-product']").forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (cb.value === "all" && cb.checked) {
          document.querySelectorAll("input[name='gba-product']").forEach(function (x) {
            if (x.value !== "all") x.checked = false;
          });
        } else if (cb.value !== "all" && cb.checked) {
          var all = document.querySelector("input[name='gba-product'][value='all']");
          if (all) all.checked = false;
        }
      });
    });

    document.querySelectorAll("input[name='gba-sync-product']").forEach(function (cb) {
      cb.addEventListener("change", function () {
        if (cb.value === "all" && cb.checked) {
          document.querySelectorAll("input[name='gba-sync-product']").forEach(function (x) {
            if (x.value !== "all") x.checked = false;
          });
        } else if (cb.value !== "all" && cb.checked) {
          var all = document.querySelector("input[name='gba-sync-product'][value='all']");
          if (all) all.checked = false;
        }
      });
    });

    updateRuleTypeUi();
    loadFutureBookings();
    loadRules();
  }

  function updateRuleTypeUi() {
    var type = document.getElementById("gba-rule-type") ? document.getElementById("gba-rule-type").value : "closed";
    var titleInput = document.getElementById("gba-title");
    var titleLabel = document.getElementById("gba-title-label");
    var priceField = document.getElementById("gba-price-field");
    var desc = document.getElementById("gba-description");

    if (type === "price") {
      if (titleLabel) titleLabel.textContent = "Navn internt";
      if (titleInput) titleInput.placeholder = "Valgfritt. Eks: Lørdagspris";
      if (priceField) priceField.classList.remove("gba-hidden");
      if (desc) desc.placeholder = "Valgfritt internt notat. Vises ikke til kunde.";
    } else {
      if (titleLabel) titleLabel.textContent = "Navn";
      if (titleInput) titleInput.placeholder = "Ferie, helligdag, privat arrangement, trening";
      if (priceField) priceField.classList.add("gba-hidden");
      if (desc) desc.placeholder = "Valgfritt";
    }
  }

  function getSelectedProducts() {
    var vals = [];
    document.querySelectorAll("input[name='gba-product']:checked").forEach(function (cb) {
      vals.push(cb.value);
    });
    return vals.length ? vals : ["all"];
  }

  function saveRule() {
    var type = document.getElementById("gba-rule-type").value;
    var title = String(document.getElementById("gba-title").value || "").trim();
    var description = String(document.getElementById("gba-description").value || "").trim();
    var dateFrom = document.getElementById("gba-date-from").value;
    var dateTo = document.getElementById("gba-date-to").value || dateFrom;
    var timeFrom = document.getElementById("gba-time-from").value || null;
    var timeTo = document.getElementById("gba-time-to").value || null;
    var priceRaw = document.getElementById("gba-price").value;
    var price = type === "price" && priceRaw !== "" ? Number(priceRaw) : null;

    if (type === "closed" && !title) return setMsg("gba-save-msg", "Skriv inn navn på stengingen.", "bad");
    if (type === "price" && !title) title = "Prisregel";
    if (!dateFrom) return setMsg("gba-save-msg", "Velg fra dato.", "bad");
    if (!dateTo) dateTo = dateFrom;
    if (timeFrom && !timeTo) return setMsg("gba-save-msg", "Velg til klokke også.", "bad");
    if (!timeFrom && timeTo) return setMsg("gba-save-msg", "Velg fra klokke også.", "bad");
    if (type === "price" && (price === null || isNaN(price))) return setMsg("gba-save-msg", "Skriv inn pris for prisregel.", "bad");

    var payload = {
      rule_type: type,
      title: title,
      description: description || null,
      product_ids: getSelectedProducts(),
      weekdays: getSelectedWeekdays(),
      date_from: dateFrom,
      date_to: dateTo,
      time_from: timeFrom,
      time_to: timeTo,
      price: price,
      active: true,
      created_by: currentUser.email
    };

    setMsg("gba-save-msg", "Lagrer…", "");
    client.from("gk_booking_rules").insert(payload).select().single().then(function (res) {
      if (res.error) {
        setMsg("gba-save-msg", res.error.message || "Kunne ikke lagre.", "bad");
        return;
      }

      setMsg("gba-save-msg", "Regelen er lagret.", "ok");
      document.getElementById("gba-title").value = "";
      document.getElementById("gba-description").value = "";
      document.getElementById("gba-price").value = "";
      loadRules();
    });
  }

  function loadRules() {
    client.from("gk_booking_rules")
      .select("*")
      .order("date_from", { ascending: true })
      .order("time_from", { ascending: true })
      .then(function (res) {
        if (res.error) {
          rules = [];
          var el = document.getElementById("gba-rules");
          if (el) el.innerHTML = "<div class='gba-msg bad'>" + esc(res.error.message || "Kunne ikke laste regler.") + "</div>";
          return;
        }
        rules = res.data || [];
        renderRulesTable();
      });
  }

  function deleteRule(id) {
    client.from("gk_booking_rules").delete().eq("id", id).then(function (res) {
      if (res.error) {
        alert(res.error.message || "Kunne ikke slette.");
        return;
      }
      loadRules();
    });
  }

  function checkAdminAndRender() {
    render("<div class='gba-wrap'><div class='gba-hero'><div class='gba-title'>Sjekker tilgang…</div><div class='gba-sub'>Et øyeblikk.</div></div></div>");

    client.from("gk_booking_admins")
      .select("*")
      .eq("email", currentUser.email)
      .eq("active", true)
      .maybeSingle()
      .then(function (res) {
        if (res.error) {
          render("<div class='gba-wrap'><div class='gba-hero'><div class='gba-title'>Feil ved tilgangssjekk</div><div class='gba-sub'>" + esc(res.error.message) + "</div></div></div>");
          return;
        }

        if (!res.data) {
          renderDenied(currentUser.email);
          return;
        }

        currentAdmin = res.data;
        renderAdmin();
      });
  }

  function init() {
    cssOnce();

    client.auth.getSession().then(function (res) {
      var session = res.data && res.data.session ? res.data.session : null;
      currentUser = session && session.user ? session.user : null;

      if (!currentUser) {
        renderLogin();
        return;
      }

      checkAdminAndRender();
    });
  }

  cssOnce();
  render("<div class='gba-wrap'><div class='gba-hero'><div class='gba-title'>Laster admin…</div></div></div>");
  loadSupabase(init);
})();
