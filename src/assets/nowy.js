// Nowy wygląd strony: Nasze publikacje, lista ciekawostek, dokumenty obok siebie, Zgłoś, Wesprzyj, finanse (22.10.2026).
(function () {
  'use strict';

  var DOKI = {
    'WINU-42.MD.1': { syg: 'WINU-42.MD.1', data: '30.09.2026', typ: 'Nasz wniosek', tytul: 'WNIOSEK O UDOSTĘPNIENIE INFORMACJI PUBLICZNEJ', od: 'Fundacja MAMY DOŚĆ', do: '[Urząd B]' },
    'WINU-42.DM.1.1': { syg: 'WINU-42.DM.1.1', data: '09.10.2026', typ: 'Odpowiedź urzędu', tytul: 'ODPOWIEDŹ NA WNIOSEK – ODMOWA PISMEM', od: '[Urząd B]', do: 'Fundacja MAMY DOŚĆ' },
    'WINU-42.MD.2': { syg: 'WINU-42.MD.2', data: 'projekt', typ: 'Zawiadomienie', tytul: 'ZAWIADOMIENIE O MOŻLIWOŚCI POPEŁNIENIA PRZESTĘPSTWA', od: 'Fundacja MAMY DOŚĆ', do: '[Prokuratura rejonowa]' },
    'WINU-17.MD.1': { syg: 'WINU-17.MD.1', data: '30.09.2026', typ: 'Nasz wniosek', tytul: 'WNIOSEK O UDOSTĘPNIENIE INFORMACJI PUBLICZNEJ', od: 'Fundacja MAMY DOŚĆ', do: '[Urząd skarbowy A]' },
    'WINU-17.MD.2': { syg: 'WINU-17.MD.2', data: '19.10.2026', typ: 'Skarga na bezczynność', tytul: 'SKARGA NA BEZCZYNNOŚĆ', od: 'Fundacja MAMY DOŚĆ', do: '[Wojewódzki sąd administracyjny]' }
  };
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

  /* Nasze publikacje: filtr rodzaju (także z adresu: #sledztwa, #artykuly, #akta) */
  var publist = document.getElementById('publist');
  if (publist) {
    var chipyP = $$('[data-pf]');
    var lead = $('.leadcard');
    var pustoP = document.getElementById('pub-pusto');
    var filtruj = function (f) {
      var n = 0;
      chipyP.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-pf') === f ? 'true' : 'false'); });
      $$('.file', publist).forEach(function (el) {
        var ok = f === 'all' || el.getAttribute('data-typ') === f;
        el.hidden = !ok;
        if (ok) n++;
      });
      if (lead) {
        var okL = f === 'all' || lead.getAttribute('data-typ') === f;
        lead.hidden = !okL;
        if (okL) n++;
      }
      if (pustoP) pustoP.hidden = n !== 0;
    };
    chipyP.forEach(function (c) {
      c.addEventListener('click', function () { filtruj(c.getAttribute('data-pf')); });
    });
    var zHasha = { '#sledztwa': 'sledztwo', '#artykuly': 'artykul', '#akta': 'akta' }[location.hash];
    if (zHasha) filtruj(zHasha);
  }

  /* Lista ciekawostek: wpis z adresu (#l1) otwiera się sam */
  var otworzWpis = function () {
    if (!location.hash) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView({ block: 'start' }); }
  };
  if ($('.lob-lista')) { otworzWpis(); window.addEventListener('hashchange', otworzWpis); }

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
    var d1 = DOKI[vStan.pierwszy];
    var d2 = vStan.drugi ? DOKI[vStan.drugi] : null;
    var oba = vStan.oba && d2;
    var pokaz = oba ? [d1, d2] : [d1];
    $('#podglad-in').className = oba ? 'vin wide' : 'vin';
    var para = $('#podglad-dok');
    para.className = oba ? 'docpair' : 'docpair one';
    para.innerHTML = pokaz.map(function (d) {
      return '<div class="doccard"><header><span>' + esc(d.syg) + '</span><span>' + esc(d.typ) + ' · ' + esc(d.data) + '</span></header>' +
        '<div class="docpage">' + stronaDok(d) + '</div></div>';
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
