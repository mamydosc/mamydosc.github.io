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
