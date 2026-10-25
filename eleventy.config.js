// Konfiguracja generatora strony mamydosc.org (Eleventy).
// Treść: src/_data/*.json (akta, cykle, ustawienia) i src/publikacje/**/*.md (artykuły).
const QRCode = require("qrcode");

const MIESIACE = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
const DNI = ["nd","pn","wt","śr","czw","pt","sob"];

const slugSyg = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(d) {
  // przyjmuje "2026-10-12" albo obiekt Date
  if (d instanceof Date) return d;
  const [y, m, day] = String(d).split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
}

module.exports = function (cfg) {
  cfg.addPassthroughCopy({ "src/assets": "assets" });
  // Wersja plików CSS/JS – inna przy każdym zbudowaniu strony, żeby przeglądarka po publikacji od razu brała nowe pliki
  // (bez tego GitHub Pages pozwala przeglądarce trzymać stare pliki do 10 minut).
  cfg.addGlobalData("wersja", Date.now().toString(36));
  cfg.addPassthroughCopy({ "src/favicon.png": "favicon.png" });
  // Po przepięciu domeny: utwórz plik src/CNAME z treścią "mamydosc.org" i odkomentuj:
  // cfg.addPassthroughCopy({ "src/CNAME": "CNAME" });
  cfg.addPassthroughCopy({ "src/pliki": "pliki" });

  // 12.10.2026
  cfg.addFilter("data", (d) => {
    if (!d) return "";
    const x = parse(d);
    return `${String(x.getUTCDate()).padStart(2, "0")}.${String(x.getUTCMonth() + 1).padStart(2, "0")}.${x.getUTCFullYear()}`;
  });
  // pn 12.10.2026
  cfg.addFilter("dataDzien", (d) => {
    if (!d) return "";
    const x = parse(d);
    return `${DNI[x.getUTCDay()]} ${x.getUTCDate()}.${x.getUTCMonth() + 1}.${x.getUTCFullYear()}`;
  });
  // 12 października 2026
  cfg.addFilter("dataSlownie", (d) => {
    if (!d) return "";
    const x = parse(d);
    return `${x.getUTCDate()} ${MIESIACE[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });
  cfg.addFilter("iso", (d) => (d ? parse(d).toISOString().slice(0, 10) : ""));
  // MD/WNS/2026/001 -> md-wns-2026-001
  cfg.addFilter("slugSyg", (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  cfg.addFilter("czasCzytania", (html) => {
    const slowa = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(slowa / 200));
  });
  cfg.addFilter("znajdz", (arr, key, val) => (arr || []).find((x) => x[key] === val) || false);
  cfg.addFilter("artykulCyklu", (arts, cykl, czesc) => (arts || []).find((a) => a.data.cykl === cykl && a.data.czesc === czesc) || false);
  // Licznik na stronie głównej – liczony z Akt spraw
  cfg.addFilter("licznik", (akta) => {
    const w = (akta || []).filter((a) => a.wyslane);
    return {
      wyslane: w.length,
      wTerminie: w.filter((a) => a.odpowiedz === "w terminie").length,
      poTerminie: w.filter((a) => a.odpowiedz === "po terminie" || a.odpowiedz === "brak").length,
      skargi: w.filter((a) => a.typ === "SKG").length,
    };
  });
  cfg.addFilter("znajdzNr", (arr, nr) => (arr || []).find((x) => x.data.numer === nr) || false);
  cfg.addFilter("watki", (arr, nr) => (arr || []).filter((x) => x.data.nadrzedny === nr));
  cfg.addFilter("gdzieBrak", (arr, key) => (arr || []).filter((x) => !(x.data && x.data[key])));
  cfg.addFilter("gdzie", (arr, key, val) => (arr || []).filter((x) => x[key] === val));

  // Kalendarz cyklu: stan części liczony w dniu budowania strony (strona buduje się codziennie o 4:15 UTC);
  // przeglądarka poprawia napis „za X dni” na bieżąco (main.js).
  cfg.addFilter("stanCyklu", (czesci) => {
    const dzis = new Date(); dzis.setUTCHours(0, 0, 0, 0);
    let nastepna = -1, wyszlo = 0;
    const lista = (czesci || []).map((c, i) => {
      const d = parse(c.data);
      let stan = "c-future";
      if (d <= dzis) { stan = "c-done"; wyszlo++; }
      else if (nastepna < 0) { stan = "c-next"; nastepna = i; }
      return { ...c, nr: i + 1, stan };
    });
    lista.forEach((c, i) => { c.ukryta = c.stan === "c-future" && i >= wyszlo + 3; });
    return { czesci: lista, wyszlo, nastepna, ukryte: lista.filter((c) => c.ukryta).length };
  });
  // kwota w złotych: 1 234,50 zł
  cfg.addFilter("liczba", (n) => Math.round(Number(n) || 0).toLocaleString("pl-PL").replace(/\u00a0|,/g, "\u2009").replace(/\s/g, "\u00a0"));
  cfg.addFilter("zl", (n, bezGroszy) => {
    const v = Number(n || 0);
    const s = v.toLocaleString("pl-PL", { minimumFractionDigits: bezGroszy ? 0 : 2, maximumFractionDigits: bezGroszy ? 0 : 2 });
    return s + " zł";
  });
  cfg.addFilter("miesiac", (ym) => {
    const [y, m] = String(ym).split("-").map(Number);
    return ["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"][m - 1] + " " + String(y).slice(2);
  });

  // Kod QR jako SVG (wbudowany w stronę, bez zewnętrznych usług)
  cfg.addAsyncShortcode("qr", async (text) =>
    QRCode.toString(text, { type: "svg", margin: 0, color: { dark: "#1D2939", light: "#FFFFFF" }, errorCorrectionLevel: "M" })
  );

  cfg.addCollection("artykuly", (api) =>
    api.getFilteredByGlob("src/publikacje/**/*.md").sort((a, b) => a.date - b.date)
  );

  // „Nasze publikacje” (23.10.2026): same artykuły – duże, małe, same dokumenty albo kolejne części.
  // Strony dołączają się front matterem: tags: nasze (artykuły .md z /publikacje/teksty/ – same), rodzaj, numer, lead,
  // przypiety (na górze listy po prawej), tematy, zagadnienia (wyszukiwarka), wykres albo grafika (baner), nadrzedny i czesc (części).
  cfg.addCollection("nasze", (api) =>
    api.getAll().filter((p) => (p.data.tags || []).includes("nasze") || p.inputPath.includes("/publikacje/teksty/"))
  );
  const RODZAJE = { "duży": "Artykuł", "mały": "Artykuł", "dokumenty": "Dokumenty", "część": "Część" };
  const KLASY_RODZAJU = { "duży": "duzy", "mały": "maly", "dokumenty": "dokumenty", "część": "czesc" };
  cfg.addFilter("artykuly", (strony, akta) => {
    const lista = (strony || []).map((p) => {
      const d = p.data;
      const rodzaj = RODZAJE[d.rodzaj] ? d.rodzaj : "mały";
      return {
        numer: d.numer || "", tytul: d.title, url: p.url, data: parse(p.date), lead: d.lead || "",
        rodzaj, rodzajKlasa: KLASY_RODZAJU[rodzaj],
        rodzajNazwa: rodzaj === "część" && d.czesc ? "Część " + d.czesc : RODZAJE[rodzaj],
        przypiety: !!d.przypiety, przyklad: !!d.przyklad,
        tematy: d.tematy || [], zagadnienia: d.zagadnienia || [],
        wykres: d.wykres || null, grafika: d.grafika || null, nadrzedny: d.nadrzedny || "", strona: p,
      };
    });
    (akta || []).forEach((a) => lista.push({
      numer: a.sygnatura, tytul: a.tytul, url: "/akta/" + slugSyg(a.sygnatura) + "/", data: parse(a.data || "2000-01-01"),
      lead: a.opis || "", rodzaj: "dokumenty", rodzajKlasa: "dokumenty", rodzajNazwa: "Dokumenty", przypiety: false, przyklad: false,
      tematy: [], zagadnienia: [], wykres: null, grafika: null, nadrzedny: "", strona: null,
    }));
    lista.sort((a, b) => b.data - a.data);
    return lista;
  });
  // Artykuł główny: ręcznie (numer) albo cyklicznie (kolejka, co ile dni – zmiana przy codziennym odświeżeniu strony)
  cfg.addFilter("artykulGlowny", (lista, ust) => {
    if (!lista || !lista.length) return null;
    const u = ust || {};
    let numer = u.numer;
    if (u.tryb === "cyklicznie" && (u.kolejka || []).length) {
      const dzien = Math.floor(Date.now() / 864e5), co = Math.max(1, Number(u.coIleDni) || 1);
      numer = u.kolejka[Math.floor(dzien / co) % u.kolejka.length];
    }
    return lista.find((a) => a.numer === numer) || lista.find((a) => a.przypiety) || lista[0];
  });
  // Lista po prawej: bez artykułu głównego (albo bieżącego), przypięte na górze, potem najnowsze
  cfg.addFilter("bezArtykulu", (lista, bez) =>
    (lista || []).filter((a) => !bez || a.url !== bez.url).sort((a, b) => (b.przypiety - a.przypiety) || (b.data - a.data)));
  // Ciąg dalszy artykułu głównego: treść do znacznika <!--wiecej-->
  cfg.addFilter("przedWiecej", (html) => String(html || "").split("<!--wiecej-->")[0]);
  cfg.addFilter("unikalne", (lista, pole) =>
    [...new Set((lista || []).flatMap((a) => a[pole] || []))].sort((a, b) => a.localeCompare(b, "pl")));
  // Czysty tekst artykułu do wyszukiwarki słownej
  cfg.addFilter("tekst", (html) => String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim().slice(0, 8000));

  // Elementy artykułu (23.10.2026): dokumenty w okienku albo otwarte w tekście, aktywne nazwiska i urzędy (do Bazy danych),
  // odesłania i grafiki. Dane dokumentów: src/_data/dokumenty.json (te same dane czyta podgląd w przeglądarce).
  // dokumenty.json: klucz = sygnatura dokumentu; pola syg, typ, data, od, do, tytul; od 25.10.2026 także strony (obrazy
  // kolejnych stron, WebP), rozmiar (szerokość i wysokość obrazu strony w pikselach) i miniatura (mały obraz pierwszej strony
  // do tekstu artykułu); bez pola strony okienko pokazuje schemat strony. Plik trafia w całości do każdej strony – bez opisów.
  const DOKUMENTY = require("./src/_data/dokumenty.json");
  const esc = (t) => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const slugPl = (t) => String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const LINIE = '<span class="sp"></span><span class="ln"></span><span class="ln"></span><span class="ln m"></span><span class="ln"></span><span class="ln"></span><span class="ln s"></span><span class="sp"></span><span class="ln"></span><span class="ln m"></span><span class="ln"></span><span class="ln s"></span>';
  // Dokument z obrazami stron (25.10.2026): w tekście miniatura pierwszej strony zamiast schematu strony
  const stronaDok = (d) => d.miniatura
    ? `<img src="${esc(d.miniatura)}" alt="${esc(d.tytul)} – pierwsza strona"${d.rozmiar ? ` width="${d.rozmiar[0]}" height="${d.rozmiar[1]}"` : ""} loading="lazy">`
    : `<span class="hd">${esc(d.od)}</span><span class="hd">Do: ${esc(d.do)}</span><span class="tt">${esc(d.tytul)}</span><span class="hd">Sygnatura: ${esc(d.syg)}</span>${LINIE}`;
  const klasaStrony = (d) => (d.miniatura ? "docpage zdj" : "docpage");
  const dokument = (syg, obok) => {
    const d = DOKUMENTY[syg];
    if (!d) return `<span class="brakdok">[brak dokumentu ${esc(syg)}]</span>`;
    return `<button type="button" class="attdoc" data-otworz="${esc(syg)}"${obok ? ` data-obok="${esc(obok)}"` : ""} aria-label="Otwórz dokument ${esc(syg)}"><span class="mini" aria-hidden="true"><i></i><i class="s"></i><i></i><i></i><i class="s"></i><i></i><i></i></span><span><b>${esc(syg)}</b><small>${esc(d.typ)} · ${esc(d.data)}</small></span></button>`;
  };
  cfg.addShortcode("dokument", (syg, obok) => dokument(syg, obok));
  cfg.addShortcode("dokumenty", (...sygi) => `<div class="attach"><b>Dokumenty w tym tekście</b><div class="att">${sygi.map((s, i) => dokument(s, sygi.length > 1 ? sygi[(i + 1) % sygi.length] : "")).join("")}</div><p class="note" style="margin: 10px 0 0;">KLIKNIJ DOKUMENT, ABY OTWORZYĆ GO W OKIENKU. W OKIENKU MOŻESZ POŁOŻYĆ OBOK DRUGI.</p></div>`);
  cfg.addShortcode("dokumentOtwarty", (syg, obok) => {
    const d = DOKUMENTY[syg];
    if (!d) return `<span class="brakdok">[brak dokumentu ${esc(syg)}]</span>`;
    return `<figure class="docinline"><div class="doccard"><header><span>${esc(syg)}</span><span>${esc(d.typ)} · ${esc(d.data)}</span></header><button type="button" class="${klasaStrony(d)}" data-otworz="${esc(syg)}"${obok ? ` data-obok="${esc(obok)}"` : ""} aria-label="Powiększ dokument ${esc(syg)}">${stronaDok(d)}</button></div><figcaption>DOKUMENT OTWARTY W TEKŚCIE · KLIKNIJ, ABY POWIĘKSZYĆ</figcaption></figure>`;
  });
  // Kilka dokumentów otwartych w tekście obok siebie (25.10.2026); w okienku można położyć obok następny dokument z rzędu
  cfg.addShortcode("dokumentyOtwarte", (...sygi) => `<figure class="docinline docrzad">${sygi.map((s, i) => {
    const d = DOKUMENTY[s];
    if (!d) return `<span class="brakdok">[brak dokumentu ${esc(s)}]</span>`;
    const obok = sygi.length > 1 ? sygi[(i + 1) % sygi.length] : "";
    return `<div class="doccard"><header><span>${esc(s)}</span><span>${esc(d.typ)} · ${esc(d.data)}</span></header><button type="button" class="${klasaStrony(d)}" data-otworz="${esc(s)}"${obok ? ` data-obok="${esc(obok)}"` : ""} aria-label="Powiększ dokument ${esc(s)}">${stronaDok(d)}</button></div>`;
  }).join("")}<figcaption>DOKUMENTY OTWARTE W TEKŚCIE · KLIKNIJ, ABY POWIĘKSZYĆ</figcaption></figure>`);
  cfg.addShortcode("osoba", (tekst, nazwa) => `<a class="aktywne osoba" href="/baza-danych/#osoba-${slugPl(nazwa || tekst)}" title="Baza danych: ${esc(nazwa || tekst)}">${esc(tekst)}</a>`);
  cfg.addShortcode("urzad", (tekst, nazwa) => `<a class="aktywne urzad" href="/baza-danych/#urzad-${slugPl(nazwa || tekst)}" title="Baza danych: ${esc(nazwa || tekst)}">${esc(tekst)}</a>`);
  cfg.addShortcode("zob", (url, tekst, opis) => `<a class="zob" href="${esc(url)}"><span class="zob-k">Zobacz</span><b>${esc(tekst)} →</b>${opis ? `<span class="zob-o">${esc(opis)}</span>` : ""}</a>`);
  cfg.addShortcode("grafika", (src, opis) => `<figure class="grafika"><img src="${esc(src)}" alt="${esc(opis)}" loading="lazy"><figcaption>${esc(opis)}</figcaption></figure>`);

  // Finanse w „O fundacji”: najnowsze na górze, saldo całkowite po każdej operacji.
  // Wpłaty: tylko data i kwota – bez danych wpłacającego i bez dokumentu do otwarcia.
  cfg.addFilter("tabelaFinansow", (operacje) => {
    const ops = [...(operacje || [])].sort((a, b) => a.data.localeCompare(b.data) || String(a.nr).localeCompare(String(b.nr), "pl", { numeric: true }));
    let saldo = 0;
    const wiersze = ops.map((o) => {
      saldo = Math.round((saldo + Number(o.kwota)) * 100) / 100;
      const wplata = Number(o.kwota) > 0;
      return {
        nr: o.nr, data: o.data, kwota: Number(o.kwota), saldo, fundusz: o.fundusz, wplata,
        opis: wplata ? "Wpłata" : o.opis,
        plik: wplata ? "" : (o.plik || ""),
      };
    });
    return wiersze.reverse();
  });
  cfg.addFilter("najnowszeNaGorze", (arr, klucz) => [...(arr || [])].sort((a, b) => String(b[klucz]).localeCompare(String(a[klucz]))));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
