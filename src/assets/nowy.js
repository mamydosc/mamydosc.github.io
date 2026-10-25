// Nowy wygląd strony: Nasze publikacje, lista ciekawostek, dokumenty obok siebie, Zgłoś, Wesprzyj, finanse (22.10.2026).
(function () {
  'use strict';

  /* dokumenty: te same dane co w src/_data/dokumenty.json (strona wstawia je w <script id="dane-dokumenty">) */
  var DOKI = {};
  try { DOKI = JSON.parse(document.getElementById('dane-dokumenty').textContent) || {}; } catch (e) { DOKI = {}; }
  var LEADS = {
    anon_urz: 'Napisz, co widzisz od środka: kto, gdzie, od kiedy, jakie dokumenty to pokazują. Nie podawaj niczego, po czym można Cię rozpoznać.',
    anon_str: 'Anonimowo możesz przekazać trop. Żeby zająć się Twoją sprawą oficjalnie, potrzebujemy pisma z podpisem – wybierz to wyżej.',
    podpis_urz: 'Jeśli chcesz, żebyśmy oficjalnie zbadali sprawę z Twojego urzędu lub sądu, przyślij pismo z podpisem. Twoje dane znamy tylko my.',
    podpis_str: 'Przyślij pismo z podpisem, a zajmiemy się Twoją sprawą oficjalnie – w imieniu fundacji, bez żadnych opłat.'
  };

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var LINIE = '<span class="sp"></span><span class="ln"></span><span class="ln"></span><span class="ln m"></span><span class="ln"></span><span class="ln"></span><span class="ln s"></span><span class="sp"></span><span class="ln"></span><span class="ln m"></span><span class="ln"></span><span class="ln s"></span>';
  function stronaDok(d) {
    return '<span class="hd">' + esc(d.od) + '</span><span class="hd">Do: ' + esc(d.do) + '</span>' +
      '<span class="tt">' + esc(d.tytul) + '</span><span class="hd">Sygnatura: ' + esc(d.syg) + '</span>' + LINIE;
  }
  /* Adres pliku z danych dokumentów (25.10.2026): na stronie roboczej (atrybut data-korzen) adresy są względne */
  var KORZEN = document.documentElement.getAttribute('data-korzen');
  function adres(p) { p = String(p || ''); return (KORZEN !== null && p.charAt(0) === '/') ? KORZEN + p.slice(1) : p; }
  /* Dokument z obrazami stron (25.10.2026): w okienku wszystkie strony jedna pod drugą */
  function stronyDok(d) {
    var r = d.rozmiar || [];
    return '<div class="docstrony">' + d.strony.map(function (s, i) {
      return '<div class="dstrona" data-strona="' + (i + 1) + '"><img src="' + esc(adres(s)) + '" alt="' +
        esc(d.tytul + ' – strona ' + (i + 1) + ' z ' + d.strony.length) + '"' +
        (r.length === 2 ? ' width="' + r[0] + '" height="' + r[1] + '"' : '') + (i ? ' loading="lazy"' : '') + '></div>';
    }).join('') + '</div>';
  }

  /* Strona artykułu: wyszukiwarka – słowa (cała treść z /szukaj.json), temat, zagadnienie (23.10.2026).
     Nazwy zmiennych z przedrostkiem sz – bez nich filtr urzędów na stronie K001 nadpisywał pole i wyszukiwarka nie działała. */
  var szLista = document.getElementById('sz-lista');
  if (szLista) {
    var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l'); };
    var pozycje = $$('.aitem', szLista);
    var teksty = {};
    pozycje.forEach(function (el) { teksty[el.getAttribute('data-u')] = norm(el.getAttribute('data-q')); });
    var szQ = document.getElementById('sz-q'), szT = document.getElementById('sz-t'), szZ = document.getElementById('sz-z');
    var szIle = document.getElementById('sz-ile'), szPusto = document.getElementById('sz-pusto');
    var szukaj = function () {
      var slowa = norm(szQ.value).split(/\s+/).filter(Boolean), t = szT.value, z = szZ.value, n = 0;
      pozycje.forEach(function (el) {
        var hay = teksty[el.getAttribute('data-u')] || '';
        var ok = slowa.every(function (s) { return hay.indexOf(s) !== -1; }) &&
          (!t || ('|' + el.getAttribute('data-tm') + '|').indexOf('|' + t + '|') !== -1) &&
          (!z || ('|' + el.getAttribute('data-z') + '|').indexOf('|' + z + '|') !== -1);
        el.hidden = !ok;
        if (ok) n++;
      });
      szIle.textContent = 'ARTYKUŁÓW: ' + n;
      szPusto.hidden = n !== 0;
    };
    [szQ, szT, szZ].forEach(function (el) { el.addEventListener(el === szQ ? 'input' : 'change', szukaj); });
    if (window.fetch) {
      fetch('/szukaj.json').then(function (r) { return r.json(); }).then(function (indeks) {
        indeks.forEach(function (a) {
          if (a.u in teksty) teksty[a.u] = norm([a.n, a.t, a.l, (a.tm || []).join(' '), (a.z || []).join(' '), a.x].join(' '));
        });
        szukaj();
      }).catch(function () {});
    }
  }

  /* Strona artykułu: panel wyszukiwarki i listy – Zwiń/Rozwiń (23.10.2026). Na komputerze po zwinięciu artykuł na całą
     szerokość, stan pamiętany w karcie przeglądarki (sessionStorage, odczyt w <head>); na telefonie panel nad artykułem,
     domyślnie zwinięty. */
  var panel = document.getElementById('sz-panel');
  if (panel) {
    var korzen = document.documentElement;
    var przelaczniki = $$('[data-panel-przelacz]');
    var szeroki = window.matchMedia ? window.matchMedia('(min-width: 960px)') : { matches: true };
    var zwiniety = function () { return szeroki.matches ? korzen.getAttribute('data-panel') === 'zw' : !panel.classList.contains('otwarty'); };
    var etykiety = function () {
      var zw = zwiniety();
      przelaczniki.forEach(function (b) {
        var t = zw ? b.getAttribute('data-rozwin') : b.getAttribute('data-zwin');
        b.setAttribute('aria-expanded', zw ? 'false' : 'true');
        b.textContent = szeroki.matches ? t : t.replace(/\s*[»«]\s*/g, '');
      });
    };
    przelaczniki.forEach(function (b) {
      b.addEventListener('click', function () {
        if (szeroki.matches) {
          var zw = korzen.getAttribute('data-panel') === 'zw';
          if (zw) korzen.removeAttribute('data-panel'); else korzen.setAttribute('data-panel', 'zw');
          try { sessionStorage.setItem('panel', zw ? '' : 'zw'); } catch (e) {}
        } else {
          panel.classList.toggle('otwarty');
        }
        etykiety();
      });
    });
    if (szeroki.addEventListener) szeroki.addEventListener('change', etykiety);
    etykiety();

    /* Przycisk Zwiń (na telefonie Rozwiń) mruga na czerwono przez 3 s po wejściu na stronę artykułu (23.10.2026), żeby
       zwrócić uwagę na tę możliwość – tylko gdy przycisk widać; u osób z wyłączonymi animacjami bez mrugania (CSS) */
    var mrugajacy = panel.querySelector('.sz-zwin');
    if (mrugajacy && mrugajacy.offsetParent !== null) {
      var koniecMrugania = function () { mrugajacy.classList.remove('mruga'); };
      mrugajacy.classList.add('mruga');
      mrugajacy.addEventListener('animationend', koniecMrugania);
      mrugajacy.addEventListener('click', koniecMrugania);
      setTimeout(koniecMrugania, 3300);
    }
  }

  /* Strona główna: wybór widoku listy publikacji – wiersze / małe kafelki / duże kafelki (23.10.2026);
     wybór pamiętany w karcie przeglądarki (sessionStorage; odczyt na początku strony w <head>) */
  var widoki = $$('.widoki [data-widok]');
  if (widoki.length) {
    var ustawWidok = function (v) {
      if (v === 'male' || v === 'duze') document.documentElement.setAttribute('data-widok', v);
      else document.documentElement.removeAttribute('data-widok');
      widoki.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-widok') === (v || 'wiersze') ? 'true' : 'false'); });
    };
    widoki.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-widok');
        ustawWidok(v);
        try { sessionStorage.setItem('widok', v); } catch (e) {}
      });
    });
    ustawWidok(document.documentElement.getAttribute('data-widok') || 'wiersze');
  }

  /* Lista ciekawostek: wpis z adresu (#l1) otwiera się sam */
  var otworzWpis = function () {
    if (!location.hash) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView({ block: 'start' }); }
  };
  if ($('.lob-lista')) { otworzWpis(); window.addEventListener('hashchange', otworzWpis); }

  /* Kampania (Sprawdzamy): filtr statusu i wyszukiwarka */
  var lista = document.getElementById('lista-urzedow');
  if (lista) {
    var stanS = { f: 'all', q: '' };
    var pusto = document.getElementById('pusto');
    var chipyS = $$('[data-filtr]');
    var zastosujS = function () {
      var n = 0;
      $$('.file', lista).forEach(function (el) {
        var ok = (stanS.f === 'all' || el.getAttribute('data-s') === stanS.f) &&
          (!stanS.q || el.getAttribute('data-q').indexOf(stanS.q) !== -1);
        el.hidden = !ok;
        if (ok) n++;
      });
      if (pusto) pusto.hidden = n !== 0;
    };
    chipyS.forEach(function (c) {
      c.addEventListener('click', function () {
        stanS.f = c.getAttribute('data-filtr');
        chipyS.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        zastosujS();
      });
    });
    var q = document.getElementById('q-urzedy');
    if (q) q.addEventListener('input', function () { stanS.q = q.value.toLowerCase().trim(); zastosujS(); });
  }

  /* Podgląd dokumentów (karta sprawy i artykuł) */
  var viewer = document.getElementById('podglad');
  var vStan = { pierwszy: null, drugi: null, oba: false, powrot: null };
  function rysujPodglad() {
    var d1 = DOKI[vStan.pierwszy];
    var d2 = vStan.drugi ? DOKI[vStan.drugi] : null;
    var oba = vStan.oba && d2;
    var pokaz = oba ? [d1, d2] : [d1];
    $('#podglad-in').className = oba ? 'vin wide' : 'vin';
    var para = $('#podglad-dok');
    para.className = oba ? 'docpair' : 'docpair one';
    para.innerHTML = pokaz.map(function (d) {
      return '<div class="doccard"><header><span>' + esc(d.syg) + '</span><span>' + esc(d.typ) + ' · ' + esc(d.data) + '</span></header>' +
        (d.strony && d.strony.length ? stronyDok(d) : '<div class="docpage">' + stronaDok(d) + '</div>') + '</div>';
    }).join('');
    $('#podglad-t').textContent = oba ? 'Dwa dokumenty obok siebie' : d1.syg + ' · ' + d1.typ;
    var obok = $('#podglad-obok');
    obok.hidden = !d2 || vStan.oba;
    if (d2) obok.textContent = 'Połóż obok: ' + d2.syg;
    $('#podglad-jeden').hidden = !vStan.oba;
  }
  function otworz(pierwszy, drugi, skad) {
    if (!viewer) return;
    vStan.pierwszy = pierwszy;
    vStan.drugi = drugi && drugi !== pierwszy ? drugi : null;
    vStan.oba = false;
    vStan.powrot = skad || null;
    rysujPodglad();
    viewer.hidden = false;
    $('#podglad-in').scrollTop = 0;
    $('#podglad-zamknij').focus();
  }
  function zamknij() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    if (vStan.powrot) vStan.powrot.focus();
  }
  if (viewer) {
    $('#podglad-zamknij').addEventListener('click', zamknij);
    $('#podglad-obok').addEventListener('click', function () { vStan.oba = true; rysujPodglad(); });
    $('#podglad-jeden').addEventListener('click', function () { vStan.oba = false; rysujPodglad(); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) zamknij(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });
  }

  /* Karta sprawy: jeden albo dwa dokumenty, wybór dokumentów, powiększenie */
  var para = document.getElementById('para');
  if (para) {
    var wybrane = { l: 'WINU-42.MD.1', r: 'WINU-42.DM.1.1' };
    var ustawKarte = function (strona) {
      var d = DOKI[wybrane[strona]];
      var karta = document.getElementById('dok-' + strona);
      $('[data-pole="syg"]', karta).textContent = d.syg;
      $('[data-pole="opis"]', karta).textContent = d.typ + ' · ' + d.data;
      var btn = $('[data-powieksz]', karta);
      btn.innerHTML = stronaDok(d);
      btn.setAttribute('aria-label', 'Powiększ dokument ' + d.syg);
    };
    $$('[data-wybor]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        wybrane[sel.getAttribute('data-wybor')] = sel.value;
        ustawKarte(sel.getAttribute('data-wybor'));
      });
    });
    $$('[data-powieksz]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var s = btn.getAttribute('data-powieksz');
        otworz(wybrane[s], wybrane[s === 'l' ? 'r' : 'l'], btn);
      });
    });
    var ukladBtn = $$('[data-uklad]');
    ukladBtn.forEach(function (b) {
      b.addEventListener('click', function () {
        var dwa = b.getAttribute('data-uklad') === 'two';
        ukladBtn.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        para.className = dwa ? 'docpair' : 'docpair one';
        document.getElementById('dok-r').hidden = !dwa;
      });
    });
  }

  /* Artykuł: dołączone dokumenty */
  $$('[data-otworz]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      otworz(btn.getAttribute('data-otworz'), btn.getAttribute('data-obok'), btn);
    });
  });

  /* Finanse: dokument kosztu w okienku (wpłat nie otwieramy) */
  var dokmodal = document.getElementById('dokmodal');
  if (dokmodal) {
    var powrotD = null;
    var zamknijD = function () {
      if (dokmodal.hidden) return;
      dokmodal.hidden = true;
      $('#dokmodal-tresc').innerHTML = '';
      if (powrotD) powrotD.focus();
    };
    $$('[data-plik]').forEach(function (b) {
      b.addEventListener('click', function () {
        var plik = b.getAttribute('data-plik');
        var tytul = b.getAttribute('data-tytul') || 'Dokument';
        $('#dokmodal-t').textContent = tytul;
        $('#dokmodal-tresc').innerHTML = /\.pdf$/i.test(plik)
          ? '<iframe src="' + esc(plik) + '" title="' + esc(tytul) + '"></iframe>'
          : '<img class="dokimg" src="' + esc(plik) + '" alt="' + esc(tytul) + '">';
        powrotD = b;
        dokmodal.hidden = false;
        $('#dokmodal-zamknij').focus();
      });
    });
    $('#dokmodal-zamknij').addEventListener('click', zamknijD);
    dokmodal.addEventListener('click', function (e) { if (e.target === dokmodal) zamknijD(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknijD(); });
  }

  /* Zgłoś: kim jesteś i jak chcesz zgłosić */
  var sekAnon = document.getElementById('sek-anon');
  if (sekAnon) {
    var odswiez = function () {
      var urz = document.getElementById('kto-urz').checked;
      var anon = document.getElementById('jak-anon').checked;
      sekAnon.hidden = !anon;
      document.getElementById('sek-podpis').hidden = anon;
      document.getElementById('box-urz').hidden = !urz;
      document.getElementById('lead-anon').textContent = urz ? LEADS.anon_urz : LEADS.anon_str;
      document.getElementById('lead-podpis').textContent = urz ? LEADS.podpis_urz : LEADS.podpis_str;
    };
    $$('input[name="kto"], input[name="jak"]').forEach(function (r) { r.addEventListener('change', odswiez); });
    var wyslij = document.getElementById('wyslij-anon');
    if (wyslij) wyslij.addEventListener('click', function () { document.getElementById('info-anon').hidden = false; });
    /* przyciski z banera (#kto-urz, #kto-str) zaznaczają odpowiedź „Kim jesteś?” */
    var zAdresu = function () {
      var r = /^#kto-(urz|str)$/.test(location.hash) ? document.getElementById(location.hash.slice(1)) : null;
      if (r) { r.checked = true; odswiez(); }
    };
    window.addEventListener('hashchange', zAdresu);
    zAdresu();
    odswiez();
  }

  /* Wesprzyj: wybór celu ustawia tytuł przelewu */
  var celeBtn = $$('[data-cel]');
  celeBtn.forEach(function (b) {
    b.addEventListener('click', function () {
      celeBtn.forEach(function (x) {
        var wyb = x === b;
        x.className = wyb ? 'btn red' : 'btn line';
        x.textContent = wyb ? 'Wybrany cel' : 'Wybierz ten cel';
        x.setAttribute('aria-pressed', wyb ? 'true' : 'false');
      });
      var nazwa = b.getAttribute('data-nazwa');
      document.getElementById('cel-nazwa').textContent = nazwa;
      document.getElementById('cel-tytul').textContent = 'Darowizna na cele statutowe – ' + nazwa;
      var wplata = document.getElementById('wplata');
      if (wplata) wplata.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
