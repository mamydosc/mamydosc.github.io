/* Ankieta „Co czujesz po przeczytaniu?” pod artykułem i pod ciekawostką (25.10.2026, PRÓBA – licznika głosów jeszcze nie ma).
   Na jedno wejście na stronę czytelnik klika do 3 różnych uczuć („Wybierz trzy”, polecenie Michała z 25.10.2026): każde
   kliknięcie od razu dolicza jeden głos temu uczuciu; klikniętego uczucia nie da się kliknąć drugi raz, a po trzecim
   kliknięciu ankieta się blokuje. Liczymy uczucia, nie osoby: procenty są od wszystkich kliknięć (metoda największych reszt,
   więc razem zawsze 100). W urządzeniu czytelnika nic nie zapisujemy (bez ciasteczek i bez pamięci przeglądarki).
   Bez licznika (data-api puste) głosy doliczają się tylko na tej stronie, do jej zamknięcia.
   Wersje wykresu (polecenie Michała z 25.10.2026: „wrzucaj wszystkie”): paski, lizaki, kolumny, pasek, kropki, paczek, liczby.
   Wybór: ?wykres=<nazwa> w adresie strony (do porównania), potem stała wersja z danych (data-wykres), inaczej losowo przy wejściu. */
(function () {
  "use strict";
  if (window.__ankieta) return;
  window.__ankieta = true;

  var WARIANTY = ["paski", "lizaki", "kolumny", "pasek", "kropki", "paczek", "liczby"];
  var zAdresu = (/[?&]wykres=([a-z]+)/.exec(location.search) || [])[1];
  var SVG = "http://www.w3.org/2000/svg";

  function procenty(wyn, klucze) {
    var razem = 0, out = {}, suma = 0, reszty = [];
    klucze.forEach(function (k) { razem += wyn[k]; });
    if (!razem) { klucze.forEach(function (k) { out[k] = 0; }); return out; }
    klucze.forEach(function (k) {
      var d = 100 * wyn[k] / razem, c = Math.floor(d);
      out[k] = c; suma += c; reszty.push([d - c, k]);
    });
    reszty.sort(function (a, b) { return b[0] - a[0]; });
    for (var i = 0; i < 100 - suma; i++) out[reszty[i][1]] += 1;
    return out;
  }

  function glosow(n) {
    if (n === 1) return "głos";
    var j = n % 10, d = n % 100;
    return (j >= 2 && j <= 4 && !(d >= 12 && d <= 14)) ? "głosy" : "głosów";
  }

  function wariant(el) {
    if (zAdresu && WARIANTY.indexOf(zAdresu) >= 0) return zAdresu;
    var staly = el.getAttribute("data-wykres");
    if (staly && WARIANTY.indexOf(staly) >= 0) return staly;
    return WARIANTY[Math.floor(Math.random() * WARIANTY.length)];
  }

  function svg(nazwa, atrybuty) {
    var e = document.createElementNS(SVG, nazwa);
    Object.keys(atrybuty).forEach(function (a) { e.setAttribute(a, atrybuty[a]); });
    return e;
  }

  Array.prototype.forEach.call(document.querySelectorAll("section.ankieta"), function (el) {
    if (el.getAttribute("data-gotowa")) return;
    el.setAttribute("data-gotowa", "1");
    var w = wariant(el);
    el.classList.add("ank-w-" + w);
    el.setAttribute("data-wariant", w);

    var przyciski = Array.prototype.slice.call(el.querySelectorAll(".ank-u"));
    var klucze = przyciski.map(function (b) { return b.getAttribute("data-u"); });
    var suma = el.querySelector(".ank-suma"), wykres = el.querySelector(".ank-wykres");
    var NAJWIECEJ = 3, wybrane = [], wyn = {};
    try { wyn = JSON.parse(el.getAttribute("data-wyniki") || "{}") || {}; } catch (e) { wyn = {}; }
    klucze.forEach(function (k) { wyn[k] = Math.max(0, parseInt(wyn[k], 10) || 0); });

    // pasek: jeden pasek podzielony na kolory, razem 100%
    function rysujPasek(razem) {
      var stos = document.createElement("div");
      stos.className = "ank-stos";
      klucze.forEach(function (k) {
        if (!wyn[k]) return;
        var s = document.createElement("span");
        s.className = "ank-seg ank-" + k;
        s.style.flexGrow = String(wyn[k]);
        stos.appendChild(s);
      });
      if (!razem) stos.classList.add("ank-pusty");
      wykres.appendChild(stos);
    }

    // kropki: kratka 10 x 10, jedna kropka = 1%
    function rysujKropki(p) {
      var siatka = document.createElement("div"), ile = 0;
      siatka.className = "ank-kropki";
      klucze.concat(["puste"]).forEach(function (k) {
        var n = k === "puste" ? 100 - ile : p[k];
        for (var j = 0; j < n; j++) {
          var d = document.createElement("span");
          d.className = "ank-kr2 ank-" + k;
          siatka.appendChild(d);
        }
        ile += n;
      });
      wykres.appendChild(siatka);
    }

    // pączek: koło z dziurą, w środku liczba głosów
    function rysujPaczek(razem) {
      var r = 48, C = 2 * Math.PI * r, start = 0;
      var niezerowe = klucze.filter(function (k) { return wyn[k] > 0; }).length;
      var przerwa = niezerowe > 1 ? 1.6 : 0;
      var s = svg("svg", { viewBox: "0 0 120 120", "class": "ank-paczek" });
      s.appendChild(svg("circle", { cx: 60, cy: 60, r: r, "class": "ank-tlo" }));
      klucze.forEach(function (k) {
        if (!wyn[k]) return;
        var dl = C * wyn[k] / razem;
        s.appendChild(svg("circle", {
          cx: 60, cy: 60, r: r, "class": "ank-luk ank-" + k,
          "stroke-dasharray": Math.max(dl - przerwa, 0.4) + " " + C,
          "stroke-dashoffset": String(-start), transform: "rotate(-90 60 60)"
        }));
        start += dl;
      });
      var t1 = svg("text", { x: 60, y: 62, "class": "ank-srodek" }), t2 = svg("text", { x: 60, y: 77, "class": "ank-srodek-p" });
      t1.textContent = String(razem);
      t2.textContent = glosow(razem);
      s.appendChild(t1);
      s.appendChild(t2);
      wykres.appendChild(s);
    }

    function pokaz() {
      var razem = 0, naj = 0, p = procenty(wyn, klucze);
      klucze.forEach(function (k) { razem += wyn[k]; naj = Math.max(naj, wyn[k]); });
      przyciski.forEach(function (b) {
        var k = b.getAttribute("data-u"), n = wyn[k], dl = (naj ? 100 * n / naj : 0) + "%";
        var pas = b.querySelector(".ank-pas");
        // najdłuższy pasek (albo najwyższa kolumna) = uczucie z największą liczbą głosów, pozostałe w tej samej skali
        if (w === "kolumny") { pas.style.height = dl; pas.style.width = ""; } else { pas.style.width = dl; pas.style.height = ""; }
        b.querySelector(".ank-proc").textContent = p[k] + "%";
        b.querySelector(".ank-ile").textContent = String(n);
        b.setAttribute("aria-label", b.getAttribute("data-nazwa") + ": " + p[k] + "%, głosów: " + n + (wybrane.indexOf(k) >= 0 ? ", twój głos" : ""));
      });
      wykres.textContent = "";
      if (w === "pasek") rysujPasek(razem);
      else if (w === "kropki") rysujKropki(p);
      else if (w === "paczek") rysujPaczek(razem);
      suma.textContent = "GŁOSÓW: " + razem;
    }

    przyciski.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-u");
        if (wybrane.length >= NAJWIECEJ || wybrane.indexOf(k) >= 0) return;
        wybrane.push(k);
        wyn[k] += 1;
        b.setAttribute("aria-pressed", "true");
        b.setAttribute("aria-disabled", "true");
        if (wybrane.length >= NAJWIECEJ) {
          el.classList.add("ank-po");
          przyciski.forEach(function (x) { x.setAttribute("aria-disabled", "true"); });
        }
        pokaz();
      });
    });

    pokaz();
    el.hidden = false;
  });
})();
