// Nowy wygląd strony (20.10.2026): dokumenty obok siebie, filtry, Ludzie władzy, Zgłoś, Wesprzyj.
(function () {
  'use strict';
  var DANE = {"doki": {"WINU-42.MD.1": {"syg": "WINU-42.MD.1", "data": "30.09.2026", "typ": "Nasz wniosek", "tytul": "WNIOSEK O UDOSTĘPNIENIE INFORMACJI PUBLICZNEJ", "od": "Fundacja MAMY DOŚĆ", "do": "[Urząd B]"}, "WINU-42.DM.1.1": {"syg": "WINU-42.DM.1.1", "data": "09.10.2026", "typ": "Odpowiedź urzędu", "tytul": "ODPOWIEDŹ NA WNIOSEK – ODMOWA PISMEM", "od": "[Urząd B]", "do": "Fundacja MAMY DOŚĆ"}, "WINU-42.MD.2": {"syg": "WINU-42.MD.2", "data": "projekt", "typ": "Zawiadomienie", "tytul": "ZAWIADOMIENIE O MOŻLIWOŚCI POPEŁNIENIA PRZESTĘPSTWA", "od": "Fundacja MAMY DOŚĆ", "do": "[Prokuratura rejonowa]"}, "WINU-17.MD.1": {"syg": "WINU-17.MD.1", "data": "30.09.2026", "typ": "Nasz wniosek", "tytul": "WNIOSEK O UDOSTĘPNIENIE INFORMACJI PUBLICZNEJ", "od": "Fundacja MAMY DOŚĆ", "do": "[Urząd skarbowy A]"}, "WINU-17.MD.2": {"syg": "WINU-17.MD.2", "data": "19.10.2026", "typ": "Skarga na bezczynność", "tytul": "SKARGA NA BEZCZYNNOŚĆ", "od": "Fundacja MAMY DOŚĆ", "do": "[Wojewódzki sąd administracyjny]"}}, "osoby": [{"id": "p1", "g": "us", "imie": "[Imię Nazwisko 1]", "stanowisko": "Naczelnik urzędu skarbowego", "jednostka": "[Urząd skarbowy A]", "komorka": "Kierownictwo urzędu", "od": "[data powołania]", "zrodlo": "BIP [Urzędu skarbowego A], strona „Kierownictwo”, stan na 15.10.2026", "wczesniej": [{"co": "Zastępca naczelnika · [Urząd skarbowy X]", "kiedy": "[rok]–[rok]", "zr": "BIP [Urzędu skarbowego X], archiwum strony"}, {"co": "Kierownik działu kontroli · [Urząd skarbowy Y]", "kiedy": "[rok]–[rok]", "zr": "odpowiedź na wniosek WINU-[nr]"}], "czynnosci": [{"syg": "WINU-17", "data": "30.09.2026", "opis": "Organ, do którego skierowaliśmy wniosek o metryki spraw", "dok": "Wniosek WINU-17.MD.1 · brak odpowiedzi", "s": "sil"}, {"syg": "WINU-17", "data": "19.10.2026", "opis": "Skarga na bezczynność organu", "dok": "Skarga WINU-17.MD.2", "s": "sil"}]}, {"id": "p2", "g": "us", "imie": "[Imię Nazwisko 2]", "stanowisko": "Zastępca naczelnika", "jednostka": "[Urząd skarbowy C]", "komorka": "Pion orzecznictwa", "od": "[data]", "zrodlo": "BIP [Urzędu skarbowego C], stan na 15.10.2026", "wczesniej": [{"co": "Kierownik referatu · [Urząd skarbowy C]", "kiedy": "[rok]–[rok]", "zr": "BIP [Urzędu skarbowego C], archiwum strony"}], "czynnosci": [{"syg": "WINU-108", "data": "16.10.2026", "opis": "Podpisał odpowiedź na wniosek – 2 dni po terminie", "dok": "Odpowiedź WINU-108.DM.1.1", "s": "late"}]}, {"id": "p3", "g": "ias", "imie": "[Imię Nazwisko 3]", "stanowisko": "Kierownik działu", "jednostka": "[Izba Administracji Skarbowej D]", "komorka": "Dział informacji publicznej", "od": "[data]", "zrodlo": "odpowiedź na wniosek WINU-133", "wczesniej": [{"co": "Starszy specjalista · [Izba Administracji Skarbowej D]", "kiedy": "[rok]–[rok]", "zr": "odpowiedź na wniosek WINU-133"}], "czynnosci": [{"syg": "WINU-133", "data": "07.10.2026", "opis": "Podpisał odpowiedź na wniosek", "dok": "Odpowiedź WINU-133.DM.1.1", "s": "ok"}]}, {"id": "p4", "g": "sad", "imie": "[Imię Nazwisko 4]", "stanowisko": "Sędzia", "jednostka": "[Wojewódzki sąd administracyjny]", "komorka": "[Wydział]", "od": "[data]", "zrodlo": "strona internetowa sądu, zakładka „Sędziowie”, stan na 15.10.2026", "wczesniej": [{"co": "[poprzednie stanowisko służbowe]", "kiedy": "[rok]–[rok]", "zr": "[źródło]"}], "czynnosci": [{"syg": "[sygnatura sprawy sądowej]", "data": "[data]", "opis": "Przewodniczący składu w sprawie ze skargi fundacji", "dok": "Zarządzenie / wyrok w aktach sprawy", "s": "akt"}]}, {"id": "p5", "g": "sad", "imie": "[Imię Nazwisko 5]", "stanowisko": "Referendarz sądowy", "jednostka": "[Wojewódzki sąd administracyjny]", "komorka": "[Wydział]", "od": "[data]", "zrodlo": "strona internetowa sądu, stan na 15.10.2026", "wczesniej": [{"co": "[poprzednie stanowisko służbowe]", "kiedy": "[rok]–[rok]", "zr": "[źródło]"}], "czynnosci": [{"syg": "[sygnatura sprawy sądowej]", "data": "[data]", "opis": "Wydał zarządzenie w sprawie ze skargi fundacji", "dok": "Zarządzenie w aktach sprawy", "s": "akt"}]}, {"id": "p6", "g": "inne", "imie": "[Imię Nazwisko 6]", "stanowisko": "Kierownik urzędu", "jednostka": "[Urząd B]", "komorka": "Kierownictwo", "od": "[data]", "zrodlo": "BIP [Urzędu B], stan na 15.10.2026", "wczesniej": [{"co": "[poprzednie stanowisko służbowe]", "kiedy": "[rok]–[rok]", "zr": "[źródło]"}], "czynnosci": [{"syg": "WINU-42", "data": "09.10.2026", "opis": "Podpisał odmowę udostępnienia informacji – pismem, bez decyzji", "dok": "Odpowiedź WINU-42.DM.1.1", "s": "ref"}]}], "grupy": {"us": "URZĘDY SKARBOWE", "ias": "IZBY ADMINISTRACJI SKARBOWEJ", "sad": "SĄDY ADMINISTRACYJNE", "inne": "INNE URZĘDY"}, "st": {"sil": ["pill late", "milczenie"], "ref": ["pill ref", "odmowa bez decyzji"], "ok": ["pill ok", "odpowiedź w terminie"], "late": ["pill wait", "po terminie"], "akt": ["pill plan", "w aktach"]}, "leads": {"anon_urz": "Napisz, co widzisz od środka: kto, gdzie, od kiedy, jakie dokumenty to pokazują. Nie podawaj niczego, po czym można Cię rozpoznać.", "anon_str": "Anonimowo możesz przekazać trop. Żeby zająć się Twoją sprawą oficjalnie, potrzebujemy pisma z podpisem – wybierz to wyżej.", "podpis_urz": "Jeśli chcesz, żebyśmy oficjalnie zbadali sprawę z Twojego urzędu lub sądu, przyślij pismo z podpisem. Twoje dane znamy tylko my.", "podpis_str": "Przyślij pismo z podpisem, a zajmiemy się Twoją sprawą oficjalnie – w imieniu fundacji, bez żadnych opłat."}};

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

  /* Śledztwo: filtr statusu i wyszukiwarka */
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
    if (!viewer) return;
    var d1 = DANE.doki[vStan.pierwszy];
    var d2 = vStan.drugi ? DANE.doki[vStan.drugi] : null;
    var pokaz = vStan.oba && d2 ? [d1, d2] : [d1];
    $('#podglad-in').className = vStan.oba && d2 ? 'vin wide' : 'vin';
    var para = $('#podglad-dok');
    para.className = vStan.oba && d2 ? 'docpair' : 'docpair one';
    para.innerHTML = pokaz.map(function (d) {
      return '<div class="doccard"><header><span>' + esc(d.syg) + '</span><span>' + esc(d.typ) + ' · ' + esc(d.data) + '</span></header>' +
        '<div class="docpage">' + stronaDok(d) + '</div></div>';
    }).join('');
    $('#podglad-t').textContent = vStan.oba && d2 ? 'Dwa dokumenty obok siebie' : d1.syg + ' · ' + d1.typ;
    var obok = $('#podglad-obok');
    var jeden = $('#podglad-jeden');
    obok.hidden = !d2 || vStan.oba;
    if (d2) obok.textContent = 'Połóż obok: ' + d2.syg;
    jeden.hidden = !vStan.oba;
  }
  function otworz(pierwszy, drugi, skad) {
    if (!viewer) return;
    vStan.pierwszy = pierwszy;
    vStan.drugi = drugi && drugi !== pierwszy ? drugi : null;
    vStan.oba = false;
    vStan.powrot = skad || null;
    rysujPodglad();
    viewer.hidden = false;
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
      var d = DANE.doki[wybrane[strona]];
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
        var inna = s === 'l' ? 'r' : 'l';
        otworz(wybrane[s], wybrane[inna], btn);
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

  /* Ludzie władzy */
  var listaOsob = document.getElementById('lista-osob');
  if (listaOsob) {
    var stanL = { g: 'all', q: '' };
    var profil = document.getElementById('profil');
    var rysujProfil = function (o) {
      var wcz = o.wczesniej.map(function (w) {
        return '<span style="display: block; margin-bottom: 10px;">' + esc(w.co) + ' · ' + esc(w.kiedy) + '<span class="src">Źródło: ' + esc(w.zr) + '</span></span>';
      }).join('');
      var czy = o.czynnosci.map(function (c) {
        var st = DANE.st[c.s];
        return '<a class="file" href="/akta/winu-42/"><span class="sig">' + esc(c.syg) + '<small>' + esc(c.data) + '</small></span><div><h3>' + esc(c.opis) + '</h3><p>' + esc(c.dok) + '</p></div><span class="' + st[0] + '">' + esc(st[1]) + '</span></a>';
      }).join('');
      profil.innerHTML =
        '<span class="metaline">' + esc(DANE.grupy[o.g]) + '</span>' +
        '<h2 class="pname" id="h-osoba">' + esc(o.imie) + '</h2>' +
        '<p style="margin: 0 0 20px; color: var(--slate);">' + esc(o.stanowisko) + ' · ' + esc(o.jednostka) + '</p>' +
        '<dl class="facts">' +
        '<dt>Stanowisko</dt><dd>' + esc(o.stanowisko) + '<span class="src">Źródło: ' + esc(o.zrodlo) + '</span></dd>' +
        '<dt>Komórka</dt><dd>' + esc(o.komorka) + '<span class="src">Źródło: ' + esc(o.zrodlo) + '</span></dd>' +
        '<dt>W tej funkcji od</dt><dd>' + esc(o.od) + '<span class="src">Źródło: ' + esc(o.zrodlo) + '</span></dd>' +
        '<dt>Wcześniej</dt><dd>' + wcz + '</dd></dl>' +
        '<h3 style="font: 800 1.1rem var(--font-display); margin: 26px 0 12px;">Czynności w naszych aktach</h3>' +
        '<div class="files">' + czy + '</div>' +
        '<p class="note" style="margin: 22px 0 0;">CZEGO NIE PUBLIKUJEMY: ADRESÓW, ZDJĘĆ, DANYCH RODZINY ANI NICZEGO SPOZA PEŁNIENIA FUNKCJI.</p>' +
        '<div class="btns" style="margin-top: 18px;"><a class="btn line" href="/zglos/">Zgłoś sprostowanie</a><a class="btn line" href="/zglos/">Wiesz więcej? Zgłoś anonimowo</a></div>';
    };
    var karty = $$('[data-osoba]', listaOsob);
    karty.forEach(function (k) {
      k.addEventListener('click', function () {
        var o = DANE.osoby.filter(function (x) { return x.id === k.getAttribute('data-osoba'); })[0];
        karty.forEach(function (x) { x.setAttribute('aria-pressed', x === k ? 'true' : 'false'); });
        rysujProfil(o);
        if (window.matchMedia('(max-width: 900px)').matches) profil.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    var pustoL = document.getElementById('pusto-osoby');
    var zastosujL = function () {
      var n = 0;
      karty.forEach(function (k) {
        var ok = (stanL.g === 'all' || k.getAttribute('data-g') === stanL.g) &&
          (!stanL.q || k.getAttribute('data-q').indexOf(stanL.q) !== -1);
        k.hidden = !ok;
        if (ok) n++;
      });
      pustoL.hidden = n !== 0;
    };
    var chipyL = $$('[data-grupa]');
    chipyL.forEach(function (c) {
      c.addEventListener('click', function () {
        stanL.g = c.getAttribute('data-grupa');
        chipyL.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        zastosujL();
      });
    });
    var qo = document.getElementById('q-osoby');
    if (qo) qo.addEventListener('input', function () { stanL.q = qo.value.toLowerCase().trim(); zastosujL(); });
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
      document.getElementById('lead-anon').textContent = urz ? DANE.leads.anon_urz : DANE.leads.anon_str;
      document.getElementById('lead-podpis').textContent = urz ? DANE.leads.podpis_urz : DANE.leads.podpis_str;
    };
    $$('input[name="kto"], input[name="jak"]').forEach(function (r) { r.addEventListener('change', odswiez); });
    var wyslij = document.getElementById('wyslij-anon');
    if (wyslij) wyslij.addEventListener('click', function () { document.getElementById('info-anon').hidden = false; });
    odswiez();
  }

  /* Wesprzyj: wybór celu ustawia tytuł przelewu */
  var celeBtn = $$('[data-cel]');
  if (celeBtn.length) {
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
  }
})();
