(function () {
  console.log("[BOOKING ADMIN v4 PRICE RULES SMART] LOADED");

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

    updateRuleTypeUi();
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
