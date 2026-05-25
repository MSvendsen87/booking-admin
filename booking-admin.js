(function () {
  console.log("[BOOKING ADMIN v2 CLOSED TIMES READONLY] LOADED");

  var PAGE_PATH = "/sider/booking-admin";
  var ROOT_ID = "gk-booking-admin";
  var API_BASE = "https://cold-shadow-36dc.post-cd6.workers.dev/products/";
  var ADMIN_API_BASE = "https://gk-booking-admin.post-cd6.workers.dev";

  var PRODUCTS = [
    { id: "1316", name: "Dart Bane A", icon: "🎯" },
    { id: "1317", name: "Dart Bane B", icon: "🎯" },
    { id: "1320", name: "Disc simulator", icon: "🥏" },
    { id: "1349", name: "Leie hele lokalet", icon: "🎉" },
    { id: "1322", name: "Klubbkveld", icon: "👥" }
  ];

  var path = String(location.pathname || "");
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path !== PAGE_PATH) return;

  var root = document.getElementById(ROOT_ID);
  if (!root) {
    console.warn("[BOOKING ADMIN] Fant ikke #" + ROOT_ID);
    return;
  }

  function injectCss() {
    if (document.getElementById("gk-booking-admin-css-v1")) return;
    var style = document.createElement("style");
    style.id = "gk-booking-admin-css-v1";
    style.textContent = `
      #gk-booking-admin{max-width:1180px;margin:0 auto 40px;color:#e9eef5;font-family:inherit}
      #gk-booking-admin *{box-sizing:border-box}
      .gka-hero{border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,rgba(35,35,39,.96),rgba(22,22,25,.96));border-radius:22px;padding:18px;margin:0 0 14px;box-shadow:0 14px 34px rgba(0,0,0,.25)}
      .gka-kicker{font-size:13px;font-weight:900;color:#ffe29b;margin-bottom:5px}
      .gka-h1{margin:0 0 8px;color:#fff;font-size:clamp(26px,4vw,42px);font-weight:1000;line-height:1.08}
      .gka-lead{margin:0;color:rgba(233,238,245,.82);line-height:1.5;max-width:850px}
      .gka-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;align-items:center;justify-content:space-between}
      .gka-tabs{display:flex;flex-wrap:wrap;gap:8px}
      .gka-btn{min-height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff;font-weight:900;padding:0 14px;cursor:pointer}
      .gka-btn:hover{background:rgba(255,255,255,.12)}
      .gka-btn.active{border-color:rgba(49,210,135,.65);background:linear-gradient(180deg,rgba(31,95,65,.95),rgba(24,72,51,.95))}
      .gka-small{font-size:13px;color:rgba(233,238,245,.68)}
      .gka-grid{display:grid;grid-template-columns:1fr;gap:12px}
      @media(min-width:850px){.gka-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      .gka-card{border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,rgba(36,36,39,.96),rgba(25,25,28,.96));border-radius:18px;padding:14px;box-shadow:0 10px 24px rgba(0,0,0,.18)}
      .gka-card-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .gka-card-title h3{margin:0;color:#fff;font-size:17px;font-weight:1000}
      .gka-badge{border-radius:999px;padding:6px 10px;font-size:12px;font-weight:1000;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff}
      .gka-badge.ok{border-color:rgba(49,210,135,.35);color:#aef5cc;background:rgba(49,210,135,.10)}
      .gka-badge.warn{border-color:rgba(255,188,88,.40);color:#ffd79a;background:rgba(255,188,88,.10)}
      .gka-section{border:1px solid rgba(255,255,255,.10);background:linear-gradient(180deg,rgba(24,24,27,.96),rgba(17,17,19,.96));border-radius:20px;padding:14px;margin-top:14px}
      .gka-section h2{margin:0 0 10px;color:#fff;font-size:21px;font-weight:1000}
      .gka-table-wrap{overflow-x:auto}
      .gka-table{width:100%;border-collapse:separate;border-spacing:0 8px;min-width:720px}
      .gka-table th{text-align:left;color:rgba(233,238,245,.65);font-size:12px;font-weight:1000;padding:0 10px;text-transform:uppercase;letter-spacing:.04em}
      .gka-table td{background:rgba(255,255,255,.045);border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:10px;color:rgba(233,238,245,.90);font-size:14px}
      .gka-table td:first-child{border-left:1px solid rgba(255,255,255,.08);border-radius:13px 0 0 13px}
      .gka-table td:last-child{border-right:1px solid rgba(255,255,255,.08);border-radius:0 13px 13px 0}
      .gka-empty{border:1px dashed rgba(255,255,255,.16);border-radius:16px;padding:18px;color:rgba(233,238,245,.72)}
      .gka-loading{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:16px;padding:14px;color:rgba(233,238,245,.76)}
      .gka-error{border:1px solid rgba(255,100,100,.35);background:rgba(255,100,100,.10);color:#ffb3b3;border-radius:16px;padding:14px}
      .gka-note{margin-top:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:16px;padding:12px 14px;color:rgba(233,238,245,.78);font-size:13px;line-height:1.45}
      @media(max-width:640px){.gka-toolbar{align-items:stretch;flex-direction:column}.gka-tabs{display:grid;grid-template-columns:1fr 1fr}.gka-btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  injectCss();

  root.innerHTML = `
    <section class="gka-hero">
      <div class="gka-kicker">GolfKongen intern bookingoversikt</div>
      <h1 class="gka-h1">Booking-admin</h1>
      <p class="gka-lead">Første versjon er kun lesevisning. Her får du oversikt over bookede tider for dart, disc, klubbkveld og leie av hele lokalet. Redigering av priser og blokkering kommer i neste steg.</p>
    </section>
    <div class="gka-toolbar">
      <div class="gka-tabs">
        <button class="gka-btn active" data-range="today">I dag</button>
        <button class="gka-btn" data-range="tomorrow">I morgen</button>
        <button class="gka-btn" data-range="7">Neste 7 dager</button>
        <button class="gka-btn" data-range="40">Neste 40 dager</button>
      </div>
      <button id="gka-refresh" class="gka-btn">Oppdater</button>
    </div>
    <div id="gka-status" class="gka-loading">Laster bookingdata…</div>
    <section class="gka-section">
      <h2>Oppsummering</h2>
      <div id="gka-summary" class="gka-grid"></div>
    </section>
    <section class="gka-section">
      <h2>Bookede tider</h2>
      <div id="gka-bookings"></div>
    </section>
    <section class="gka-section">
      <h2>Stengte tider og spesialpriser</h2>
      <div id="gka-closed-times" class="gka-loading">Laster stengte tider…</div>
      <div class="gka-note">Foreløpig er dette lesevisning fra gk-booking-admin-koden. Neste steg er å gjøre denne delen redigerbar.</div>
    </section>
    <div class="gka-note">Merk: Denne oversikten leser produktvarianter og viser tider der lager er 0. Den viser foreløpig ikke kundenavn. Kundedata kan vi legge til senere via ordre-API i en sikret Cloudflare Worker.</div>
  `;

  var statusEl = document.getElementById("gka-status");
  var summaryEl = document.getElementById("gka-summary");
  var bookingsEl = document.getElementById("gka-bookings");
  var refreshBtn = document.getElementById("gka-refresh");
  var closedTimesEl = document.getElementById("gka-closed-times");
  var activeRange = "today";
  var allBookings = [];
  var closedConfig = null;

  function pad2(n){ return String(n).padStart(2,"0"); }
  function todayLocal(){ var n=new Date(); return new Date(n.getFullYear(),n.getMonth(),n.getDate()); }
  function addDays(d,n){ var x=new Date(d.getTime()); x.setDate(x.getDate()+n); return x; }
  function ymd(d){ return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate()); }
  function parseYmd(s){ var m=String(s||"").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m?new Date(Number(m[1]),Number(m[2])-1,Number(m[3])):null; }
  function normalizeTime(t){ var s=String(t||"").trim(); var m=s.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/); return m?pad2(Number(m[1]))+":"+m[2]+"-"+pad2(Number(m[3]))+":"+m[4]:s; }
  function dateLabel(dateStr){ var d=parseYmd(dateStr); if(!d)return dateStr; var days=["Søn","Man","Tir","Ons","Tor","Fre","Lør"]; return days[d.getDay()]+" "+pad2(d.getDate())+"."+pad2(d.getMonth()+1); }

  function parseVariantDateTime(v){
    var date="", time="";
    if(v && Array.isArray(v.values)){
      for(var i=0;i<v.values.length;i++){
        var item=v.values[i]||{};
        var name=String(item.name||"").toLowerCase();
        var val=String(item.val||"").trim();
        if(!date && name.indexOf("dag")!==-1 && val) date=val;
        if(!time && name.indexOf("tid")!==-1 && val) time=normalizeTime(val);
      }
    }
    var sku=String((v&&v.sku)||"").trim();
    var m=sku.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})-(\d{2})(\d{2})$/);
    if(m){ if(!date)date=m[1]; if(!time)time=m[2]+":"+m[3]+"-"+m[4]+":"+m[5]; }
    return {date:date,time:normalizeTime(time)};
  }

  function priceOf(v, product){
    var p=Number(String((v&&v.price)||"").replace(",","."));
    if(isNaN(p)||p<=0) p=Number(String((product&&product.price)||"0").replace(",","."));
    return isNaN(p)?0:p;
  }

  function rangeDates(range){
    var start=todayLocal(), end=todayLocal();
    if(range==="tomorrow"){ start=addDays(start,1); end=addDays(end,1); }
    else if(range==="7"){ end=addDays(end,6); }
    else if(range==="40"){ end=addDays(end,39); }
    return {from:ymd(start),to:ymd(end)};
  }

  function inRange(dateStr, range){
    var r=rangeDates(range);
    return dateStr>=r.from && dateStr<=r.to;
  }

  function fetchProduct(config){
    return fetch(API_BASE+config.id,{credentials:"omit"})
      .then(function(r){return r.json();})
      .then(function(j){return {config:config, product:j&&j.product?j.product:null};})
      .catch(function(e){console.warn("[BOOKING ADMIN] Kunne ikke hente produkt "+config.id,e); return {config:config,product:null,error:e};});
  }

  function buildBookings(results){
    var list=[];
    results.forEach(function(res){
      var config=res.config;
      var product=res.product;
      var variants=product&&Array.isArray(product.variants)?product.variants:[];
      variants.forEach(function(v){
        var dt=parseVariantDateTime(v);
        if(!dt.date||!dt.time) return;
        var qty=parseInt(v.qty||"0",10);
        if(isNaN(qty)) qty=0;
        if(qty>0) return;
        list.push({
          productId:config.id,
          productName:config.name,
          icon:config.icon,
          date:dt.date,
          time:dt.time,
          sku:String(v.sku||""),
          variantId:String(v.id||""),
          price:priceOf(v,product)
        });
      });
    });
    list.sort(function(a,b){return (a.date+" "+a.time).localeCompare(b.date+" "+b.time);});
    return list;
  }

  function renderSummary(filtered){
    summaryEl.innerHTML="";
    PRODUCTS.forEach(function(p){
      var count=filtered.filter(function(b){return b.productId===p.id;}).length;
      var card=document.createElement("div");
      card.className="gka-card";
      card.innerHTML="<div class='gka-card-title'><h3>"+p.icon+" "+p.name+"</h3><span class='gka-badge "+(count?"warn":"ok")+"'>"+count+" booket</span></div><div class='gka-small'>Viser lager 0 i valgt periode.</div>";
      summaryEl.appendChild(card);
    });
  }

  function renderBookings(){
    var filtered=allBookings.filter(function(b){return inRange(b.date,activeRange);});
    renderSummary(filtered);
    if(!filtered.length){
      bookingsEl.innerHTML="<div class='gka-empty'>Ingen bookede tider i valgt periode.</div>";
      return;
    }
    var html="<div class='gka-table-wrap'><table class='gka-table'><thead><tr><th>Dato</th><th>Tid</th><th>Aktivitet</th><th>Pris</th><th>Variant</th></tr></thead><tbody>";
    filtered.forEach(function(b){
      html+="<tr><td><strong>"+dateLabel(b.date)+"</strong><br><span class='gka-small'>"+b.date+"</span></td><td><strong>"+b.time+"</strong></td><td>"+b.icon+" "+b.productName+"</td><td>"+Math.round(b.price||0)+" kr</td><td><span class='gka-small'>"+b.sku+"</span></td></tr>";
    });
    html+="</tbody></table></div>";
    bookingsEl.innerHTML=html;
  }

  function setRange(range){
    activeRange=range;
    document.querySelectorAll(".gka-btn[data-range]").forEach(function(btn){
      btn.classList.toggle("active",btn.getAttribute("data-range")===range);
    });
    renderBookings();
  }


  function productNameFromRule(rule) {
    var p = rule.products || rule.product || "all";
    if (p === "all") return "Alle aktiviteter";
    var arr = Array.isArray(p) ? p : [String(p)];
    return arr.map(function (id) {
      var found = PRODUCTS.find(function (x) { return x.id === String(id); });
      return found ? found.name : String(id);
    }).join(", ");
  }

  function renderClosedTimes() {
    if (!closedTimesEl) return;

    var data = closedConfig || {};
    var closedDates = Array.isArray(data.closedDates) ? data.closedDates : [];
    var closedTimes = Array.isArray(data.closedTimes) ? data.closedTimes : [];
    var specialPrices = Array.isArray(data.specialPrices) ? data.specialPrices : [];

    if (!closedDates.length && !closedTimes.length && !specialPrices.length) {
      closedTimesEl.className = "";
      closedTimesEl.innerHTML = "<div class='gka-empty'>Ingen manuelle stenginger eller spesialpriser er lagt inn.</div>";
      return;
    }

    var html = "<div class='gka-table-wrap'><table class='gka-table'><thead><tr><th>Type</th><th>Dato</th><th>Tid</th><th>Gjelder</th><th>Årsak/pris</th></tr></thead><tbody>";

    closedDates.forEach(function (r) {
      html += "<tr><td><strong>Hel dag</strong></td><td>" + (r.date || "") + "</td><td>Hele dagen</td><td>" + productNameFromRule(r) + "</td><td>" + (r.reason || "Stengt") + "</td></tr>";
    });

    closedTimes.forEach(function (r) {
      html += "<tr><td><strong>Tidsrom</strong></td><td>" + (r.date || "") + "</td><td>" + (r.from || "") + "–" + (r.to || "") + "</td><td>" + productNameFromRule(r) + "</td><td>" + (r.reason || "Stengt") + "</td></tr>";
    });

    specialPrices.forEach(function (r) {
      html += "<tr><td><strong>Spesialpris</strong></td><td>" + (r.date || "") + "</td><td>" + (r.from || "") + "–" + (r.to || "") + "</td><td>" + productNameFromRule(r) + "</td><td>" + (r.price || "") + " kr · " + (r.reason || "") + "</td></tr>";
    });

    html += "</tbody></table></div>";
    closedTimesEl.className = "";
    closedTimesEl.innerHTML = html;
  }

  function loadClosedTimes() {
    if (!closedTimesEl) return Promise.resolve();

    closedTimesEl.className = "gka-loading";
    closedTimesEl.textContent = "Laster stengte tider…";

    return fetch(ADMIN_API_BASE + "/booking/closed-times", { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        closedConfig = data || {};
        renderClosedTimes();
        console.log("[BOOKING ADMIN] Stengte tider klar", closedConfig);
      })
      .catch(function (e) {
        console.warn("[BOOKING ADMIN] Kunne ikke hente stengte tider", e);
        closedTimesEl.className = "gka-error";
        closedTimesEl.textContent = "Kunne ikke laste stengte tider.";
      });
  }


  function load(){
    statusEl.className="gka-loading";
    statusEl.textContent="Laster bookingdata…";
    summaryEl.innerHTML="";
    bookingsEl.innerHTML="";
    loadClosedTimes();
    Promise.all(PRODUCTS.map(fetchProduct)).then(function(results){
      allBookings=buildBookings(results);
      statusEl.className="";
      statusEl.innerHTML="Sist oppdatert: "+new Date().toLocaleString("no-NO")+" · Totalt bookede varianter funnet: "+allBookings.length;
      renderBookings();
      console.log("[BOOKING ADMIN] Data klar",{products:results,bookings:allBookings});
    }).catch(function(e){
      console.error("[BOOKING ADMIN] Feil:",e);
      statusEl.className="gka-error";
      statusEl.textContent="Kunne ikke laste bookingdata.";
    });
  }

  document.querySelectorAll(".gka-btn[data-range]").forEach(function(btn){
    btn.onclick=function(){ setRange(btn.getAttribute("data-range")); };
  });
  refreshBtn.onclick=load;
  load();
})();
