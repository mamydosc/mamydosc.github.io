// mamydosc.org – drobne zachowania strony (bez śledzenia, bez zewnętrznych skryptów)
(function () {
  // menu na telefonie
  var btn = document.getElementById("menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o);
  });

  // Akta spraw: wyszukiwanie i filtr typu
  var q = document.getElementById("q"), lista = document.getElementById("lista-akt");
  if (q && lista) {
    var filtr = "all", pusto = document.getElementById("empty");
    var norm = function (s) { return s.toLowerCase().replace(/[-\s]/g, "/"); };
    var odswiez = function () {
      var t = q.value.trim().toLowerCase(), widoczne = 0;
      lista.querySelectorAll(".file").forEach(function (el) {
        var ok = (filtr === "all" || el.dataset.typ === filtr) &&
          (!t || el.dataset.szukaj.indexOf(t) > -1 || norm(el.dataset.szukaj).indexOf(norm(t)) > -1);
        el.hidden = !ok; if (ok) widoczne++;
      });
      pusto.hidden = widoczne > 0;
    };
    q.addEventListener("input", odswiez);
    document.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () {
        filtr = b.dataset.f;
        document.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        odswiez();
      });
    });
  }

  // licznik dni bez odpowiedzi – liczy się w przeglądarce każdego dnia
  document.querySelectorAll("[data-od]").forEach(function (el) {
    var p = el.dataset.od.split("-"), od = new Date(+p[0], +p[1] - 1, +p[2]);
    el.textContent = Math.max(0, Math.floor((Date.now() - od) / 864e5));
  });

  // formularz „Przekaż dokumenty”
  var form = document.getElementById("send");
  if (form) {
    var tryb = function () {
      var anon = document.getElementById("tryb-a").checked;
      document.getElementById("f-name").hidden = anon;
      document.getElementById("f-zgoda").hidden = anon;
      document.querySelector("#f-mail label").textContent = anon
        ? "E-mail do kontaktu (opcjonalnie, może być bez nazwiska)" : "E-mail do kontaktu (opcjonalnie)";
    };
    form.addEventListener("change", tryb); tryb();
    form.addEventListener("submit", function (e) { e.preventDefault(); document.getElementById("done").hidden = false; });
  }

  // kopiowanie adresów e-mail
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.dataset.c);
      var zaznacz = function () {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Zaznaczono – skopiuj Ctrl+C";
      };
      try { navigator.clipboard.writeText(el.textContent).then(function () { b.textContent = "Skopiowano"; }, zaznacz); }
      catch (e) { zaznacz(); }
    });
  });
})();

// v2: przełącznik motywu (bez zapisu w przeglądarce – strona nie śledzi), kalendarz cykli, rozwijanie części
(function () {
  // 23.10.2026: tylko Jasny / Ciemny (bez „Auto”); na starcie zaznaczony tryb, który widać (ustawienie systemu)
  var root = document.documentElement;
  var tryby = document.querySelectorAll(".theme button");
  var ciemnySystem = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var pokazTryb = function () {
    var t = root.getAttribute("data-theme") || (ciemnySystem && ciemnySystem.matches ? "dark" : "light");
    tryby.forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.t === t ? "true" : "false"); });
  };
  tryby.forEach(function (b) {
    b.addEventListener("click", function () { root.setAttribute("data-theme", b.dataset.t); pokazTryb(); });
  });
  if (ciemnySystem && ciemnySystem.addEventListener) ciemnySystem.addEventListener("change", pokazTryb);
  pokazTryb();
  var nav = document.getElementById("nav"), btn = document.getElementById("menu-btn");
  if (nav && btn) nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
  });

  // „Następna część · za X dni” liczone od dzisiejszej daty w przeglądarce
  var dzis = new Date(); dzis.setHours(0, 0, 0, 0);
  document.querySelectorAll(".series li.c-next[data-d]").forEach(function (li) {
    var p = li.dataset.d.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    var ile = Math.round((d - dzis) / 864e5), el = li.querySelector(".soon");
    if (el && ile >= 0) el.textContent = "Następna część · " + (ile === 0 ? "dziś" : ile === 1 ? "jutro" : "za " + ile + " dni");
  });
  document.querySelectorAll(".toggle").forEach(function (b) {
    var txt = b.textContent, ol = b.previousElementSibling;
    b.addEventListener("click", function () {
      var o = ol.classList.toggle("open"); b.setAttribute("aria-expanded", o); b.textContent = o ? "Zwiń ↑" : txt;
    });
  });
})();

// Finanse: dymek na wykresie i filtry operacji
(function () {
  var chart = document.getElementById("wykres"), tip = document.getElementById("tip");
  if (chart && tip) {
    var pokaz = function (g) {
      var r = g.querySelector(".hit").getBoundingClientRect(), c = chart.getBoundingClientRect();
      tip.innerHTML = "<b>" + g.dataset.m + "</b><span><i style=\"background:var(--chart-in)\"></i>wpływy " + g.dataset.in + "</span><br><span><i style=\"background:var(--chart-out)\"></i>koszty " + g.dataset.out + "</span>";
      tip.hidden = false;
      var x = r.left - c.left + r.width / 2, w = tip.offsetWidth;
      x = Math.max(w / 2 + 4, Math.min(c.width - w / 2 - 4, x));
      tip.style.left = x + "px"; tip.style.top = (r.top - c.top + 18) + "px";
    };
    chart.querySelectorAll(".col").forEach(function (g) {
      g.addEventListener("mouseenter", function () { pokaz(g); });
      g.addEventListener("focus", function () { pokaz(g); });
      g.addEventListener("mouseleave", function () { tip.hidden = true; });
      g.addEventListener("blur", function () { tip.hidden = true; });
    });
  }
  var body = document.getElementById("ops");
  if (body) {
    var r = "all", fund = document.getElementById("fund"), q = document.getElementById("fq"), pusto = document.getElementById("ops-empty");
    var wiecej = document.getElementById("ops-more"), LIMIT = 12, wszystkie = false;
    var odswiez = function () {
      var t = q.value.trim().toLowerCase(), f = fund.value, n = 0;
      body.querySelectorAll("tr").forEach(function (tr) {
        var ok = (r === "all" || tr.dataset.r === r) && (!f || tr.dataset.f === f) && (!t || tr.dataset.s.indexOf(t) > -1);
        if (ok) n++;
        tr.hidden = !ok || (!wszystkie && n > LIMIT);
      });
      pusto.hidden = n > 0;
      wiecej.hidden = wszystkie || n <= LIMIT;
      wiecej.textContent = "Pokaż wszystkie operacje (" + n + ") ↓";
    };
    wiecej.addEventListener("click", function () { wszystkie = true; odswiez(); });
    odswiez();
    document.querySelectorAll(".chip[data-r]").forEach(function (b) {
      b.addEventListener("click", function () {
        r = b.dataset.r;
        document.querySelectorAll(".chip[data-r]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        odswiez();
      });
    });
    fund.addEventListener("change", odswiez); q.addEventListener("input", odswiez);
  }
})();

// archiwum: zakładki i rozwijanie
(function () {
  var tabs = document.querySelectorAll('.arch-tab');
  if (!tabs.length) return;
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; pick(n); tabs[n].focus(); }
    });
  });
  function pick(i) {
    tabs.forEach(function (t, j) {
      t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      t.tabIndex = j === i ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = j !== i;
    });
  }
  pick(0);
  document.querySelectorAll('.arch-pane [data-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('data-all') === '1';
      b.closest('.arch-pane').querySelectorAll('details').forEach(function (d) { d.open = open; });
    });
  });
})();
