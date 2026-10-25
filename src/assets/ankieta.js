/* Ankieta pod artykułem „Co czujesz po przeczytaniu?” (25.10.2026, PROJEKT – na razie tylko wygląd).
   Jeden głos na jedno wejście na stronę: po kliknięciu przyciski się blokują. W urządzeniu czytelnika nic nie zapisujemy
   (bez ciasteczek i bez pamięci przeglądarki). Licznika głosów (data-api) jeszcze nie ma – bez niego głos dolicza się
   tylko na tej stronie, do jej zamknięcia. Procenty liczone metodą największych reszt, więc zawsze sumują się do 100. */
(function () {
  "use strict";

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

  Array.prototype.forEach.call(document.querySelectorAll("section.ankieta"), function (el) {
    var przyciski = Array.prototype.slice.call(el.querySelectorAll(".ank-u"));
    var klucze = przyciski.map(function (b) { return b.getAttribute("data-u"); });
    var suma = el.querySelector(".ank-suma");
    var oddany = null, wyn = {};
    try { wyn = JSON.parse(el.getAttribute("data-wyniki") || "{}") || {}; } catch (e) { wyn = {}; }
    klucze.forEach(function (k) { wyn[k] = Math.max(0, parseInt(wyn[k], 10) || 0); });

    function pokaz() {
      var razem = 0, naj = 0, p = procenty(wyn, klucze);
      klucze.forEach(function (k) { razem += wyn[k]; naj = Math.max(naj, wyn[k]); });
      przyciski.forEach(function (b) {
        var k = b.getAttribute("data-u"), n = wyn[k];
        // najdłuższy pasek = uczucie z największą liczbą głosów, pozostałe w tej samej skali
        b.querySelector(".ank-pas").style.width = (naj ? 100 * n / naj : 0) + "%";
        b.querySelector(".ank-proc").textContent = p[k] + "%";
        b.querySelector(".ank-ile").textContent = String(n);
        b.setAttribute("aria-label", b.getAttribute("data-nazwa") + ": " + p[k] + "%, głosów: " + n + (oddany === k ? ", twój głos" : ""));
      });
      suma.textContent = "GŁOSÓW: " + razem;
    }

    przyciski.forEach(function (b) {
      b.addEventListener("click", function () {
        if (oddany) return;
        oddany = b.getAttribute("data-u");
        wyn[oddany] += 1;
        el.classList.add("ank-po");
        przyciski.forEach(function (x) { x.setAttribute("aria-disabled", "true"); });
        b.setAttribute("aria-pressed", "true");
        pokaz();
      });
    });

    pokaz();
    el.hidden = false;
  });
})();
