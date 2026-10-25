#!/usr/bin/env python3
"""Strona robocza (prywatny podgląd na claude.ai) – z folderu _site buduje kopię strony z linkami względnymi i stronę startową.

Użycie: python3 -I narzedzia/strona_robocza/buduj.py <_site> <folder_wyjścia> --stan "<stan>" --opis "<co w tej wersji>"
        [--nowe https://mamydosc.github.io/publikacje/x/,…] [--plik]
Wynik: <folder_wyjścia>/index.html (strona startowa z wyborem strony i trybem komputer/telefon) i <folder_wyjścia>/strona/…
Lista stron powstaje sama z budowy (tytuły z <title>); strony z --nowe są na górze listy i otwierają się pierwsze.
Strony-przekierowania (meta refresh) są pomijane na liście.
--plik (25.10.2026): podgląd jako pliki na dysku (Klop\\Fundacja\\Strona – projekty i kopia\\Strona robocza, otwierany
w przeglądarce) – strona startowa jako pełny dokument HTML (na claude.ai szkielet dokumentu dodaje sam artefakt).
Wyszukiwarka słów w treści artykułów w podglądzie z dysku nie działa (przeglądarka nie wczyta indeksu z dysku) – zgoda Michała.
"""
import argparse, html, os, re, shutil, sys

ATR = re.compile(r'(\b(?:href|src|action)=")/(?!/)([^"]*)"')
ODS = re.compile(r'(content="\d+;\s*url=)/(?!/)([^"]*)"')
CSSURL = re.compile(r'url\((["\']?)/(?!/)([^"\')]*)\1\)')
FETCH = "fetch('/szukaj.json')"
FETCH_REL = "fetch((function(){var k=document.documentElement.getAttribute('data-korzen');return k===null?'/':k})()+'szukaj.json')"
WWW = "https://mamydosc.github.io"
STRONY = {"index.html": "Nasze publikacje (strona główna)", "zglos/index.html": "Zgłoś", "wesprzyj/index.html": "Wesprzyj",
          "o-fundacji/index.html": "O fundacji", "baza-danych/index.html": "Baza danych", "poradnik/index.html": "Poradnik",
          "lista-wstydu/index.html": "Lista… wstydu?", "polityka-prywatnosci/index.html": "Polityka prywatności",
          "404.html": "Strona błędu 404"}


def wzgl(sciezka, prefix):
    p, frag = (sciezka.split("#", 1) + [""])[:2]
    p = p.split("?", 1)[0]
    if p == "" or p.endswith("/"):
        p += "index.html"
    return prefix + p + ("#" + frag if frag else "")


def adres_na_plik(url):
    u = url.replace(WWW, "").split("#")[0].split("?")[0].lstrip("/")
    return (u + "index.html") if (u == "" or u.endswith("/")) else u


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("site"); ap.add_argument("wyjscie")
    ap.add_argument("--stan", default=""); ap.add_argument("--opis", default=""); ap.add_argument("--nowe", default="")
    ap.add_argument("--plik", action="store_true", help="podgląd jako pliki na dysku: strona startowa jako pełny dokument HTML")
    x = ap.parse_args()
    src, out = x.site, x.wyjscie
    strona = os.path.join(out, "strona")
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(strona)
    pliki, tytuly, przekier = [], {}, set()
    for kat, _, nazwy in os.walk(src):
        for n in nazwy:
            if n.startswith("."):
                continue
            pelna = os.path.join(kat, n)
            wz = os.path.relpath(pelna, src).replace(os.sep, "/")
            cel = os.path.join(strona, wz)
            os.makedirs(os.path.dirname(cel), exist_ok=True)
            prefix = "../" * wz.count("/")
            if n.endswith(".html"):
                t = open(pelna, encoding="utf-8").read()
                m = re.search(r"<title>(.*?)</title>", t, re.S)
                tytuly[wz] = html.unescape(re.sub(r"\s+", " ", m.group(1)).strip()) if m else wz
                if re.search(r'http-equiv="refresh"', t, re.I):
                    przekier.add(wz)
                t = ATR.sub(lambda m: m.group(1) + wzgl(m.group(2), prefix) + '"', t)
                t = ODS.sub(lambda m: m.group(1) + wzgl(m.group(2), prefix) + '"', t)
                t = t.replace('<html lang="pl">', '<html lang="pl" data-korzen="%s">' % prefix, 1)
                open(cel, "w", encoding="utf-8").write(t)
            elif n.endswith(".css"):
                t = open(pelna, encoding="utf-8").read()
                t = CSSURL.sub(lambda m: "url(" + m.group(1) + wzgl(m.group(2), prefix) + m.group(1) + ")", t)
                open(cel, "w", encoding="utf-8").write(t)
            elif n.endswith(".js"):
                t = open(pelna, encoding="utf-8").read()
                if t.count(FETCH) > 1:
                    sys.exit("Za dużo wywołań fetch('/szukaj.json') w " + wz)
                open(cel, "w", encoding="utf-8").write(t.replace(FETCH, FETCH_REL))
            else:
                shutil.copyfile(pelna, cel)
            pliki.append(wz)
    nowe = [adres_na_plik(u) for u in x.nowe.split(",") if u.strip()]
    nowe = [p for p in dict.fromkeys(nowe) if p in tytuly]
    strony = [p for p in STRONY if p in tytuly and p not in nowe]
    artykuly = sorted([p for p in tytuly if p not in STRONY and p not in nowe and p not in przekier and p.count("/") >= 1
                       and re.match(r"^(publikacje|sprawdzamy|akta)/", p) and p.endswith("/index.html")], key=lambda p: tytuly[p])
    inne = sorted([p for p in tytuly if p not in STRONY and p not in nowe and p not in przekier and p not in artykuly], key=lambda p: tytuly[p])
    grupy = [("Nowe w tej wersji", nowe), ("Strony", strony), ("Artykuły i karty", artykuly), ("Inne", inne)]
    nazwa = lambda p: STRONY.get(p) or re.sub(r"\s*·\s*MAMY DOŚĆ$", "", tytuly[p])
    opcje = "".join('<optgroup label="%s">%s</optgroup>' % (g, "".join('<option value="%s">%s</option>' % (html.escape(p), html.escape(nazwa(p))) for p in L)) for g, L in grupy if L)
    start = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "start.html"), encoding="utf-8").read()
    start = (start.replace("{{STAN}}", html.escape(x.stan)).replace("{{OPIS}}", html.escape(x.opis))
             .replace("{{OPCJE}}", opcje).replace("{{START}}", html.escape(nowe[0] if nowe else "index.html")))
    if x.plik:   # plik z dysku: bez szkieletu claude.ai przeglądarka otworzyłaby stronę startową w trybie zgodności
        start = ('<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n'
                 '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
                 + start + '\n</body>\n</html>\n')
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(start)
    print(f"{len(pliki)} plików strony; na liście: nowe {len(nowe)}, strony {len(strony)}, artykuły {len(artykuly)}, inne {len(inne)}")


if __name__ == "__main__":
    main()
