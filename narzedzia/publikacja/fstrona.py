#!/usr/bin/env python3
"""Zadanie „F Strona” (Fundacja MAMY DOŚĆ) – część stała, sprawdzalna: paczki z Platformy Fundacji → pliki strony.

Polecenia (uruchamiaj: python3 -I narzedzia/publikacja/fstrona.py <polecenie> …):
  stan        – stan strony z repozytorium (dokument www/strona dla Platformy): artykuły, przypięcia, artykuł główny,
                tematy, zagadnienia.
  przygotuj   – na bieżącej gałęzi repozytorium zapisuje zmiany (jeden commit na pozycję): teksty z paczek „www”,
                karty pism z paczek „karta” (src/_data/akta.json), układ strony głównej (przypięcia, artykuł główny).
                Wynik: lista zmian, baza (commit wyjściowy), drzewo (skrót zawartości po zmianach) – do porównania
                przy publikacji po „tak” Michała.
  sprawdz     – po zbudowaniu strony (npm run build): czy nowe strony istnieją i pokazują tytuł, bez resztek szablonu.

Dane z Platformy: folder z dokumentami zapisanymi narzędziem ArtifactData (out_dir): <folder>/<kolekcja>/<id>.json.
Treści paczek nie poprawia – to zatwierdzony tekst Michała. Zmienia wyłącznie: src/publikacje/teksty/*.md (pliki paczek),
src/_data/akta.json, src/_data/artykulGlowny.json i linię „przypiety” w front matter stron z listy „Nasze publikacje”.
"""
import argparse, datetime, json, os, re, subprocess, sys

import yaml

WWW = "https://mamydosc.github.io"
AUTOR = ["-c", "user.name=Claude", "-c", "user.email=noreply@anthropic.com"]
ZAKAZANE = [r"wersja\s+próbna", r"wersja\s+robocza", r"\[sygnatura\]", r"\[data"]


# ----------------------------------------------------------------------------------------------------- pomocnicze
def teraz():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def minut_od(iso):
    """Ile minut minęło od chwili zapisanej jak na Platformie (np. 2026-10-24T05:52:10.123Z); brak daty – bardzo dawno."""
    try:
        t = datetime.datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except ValueError:
        return 10 ** 9
    return (datetime.datetime.now(datetime.timezone.utc) - t).total_seconds() / 60


def slug_syg(s):
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", str(s or "").lower()))


def git(repo, *a, wejscie=None):
    r = subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, input=wejscie)
    if r.returncode:
        raise RuntimeError(f"git {' '.join(a)}: {r.stderr.strip()}")
    return r.stdout.strip()


def czytaj_platforme(folder):
    """{kolekcja: {id: dane}} z plików <folder>/<kolekcja>/<id>.json (także zagnieżdżone, np. pomysly/<pid>/wersje)."""
    P = {}
    if not folder or not os.path.isdir(folder):
        return P
    for kat, _, pliki in os.walk(folder):
        for n in pliki:
            if not n.endswith(".json"):
                continue
            kol = os.path.relpath(kat, folder).replace(os.sep, "/")
            try:
                P.setdefault(kol, {})[n[:-5]] = json.load(open(os.path.join(kat, n), encoding="utf-8"))
            except Exception as e:
                raise RuntimeError(f"Nie da się odczytać {kol}/{n}: {e}")
    return P


def rozdziel_fm(tekst):
    """(front matter jako tekst, treść) – None, gdy plik nie zaczyna się od '---'."""
    if not tekst.startswith("---"):
        return None, tekst
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", tekst, re.S)
    if not m:
        return None, tekst
    return m.group(1), tekst[m.end():]


def fm_dane(fm):
    try:
        d = yaml.safe_load(fm) or {}
    except yaml.YAMLError as e:
        raise ValueError(f"front matter: {e}")
    if not isinstance(d, dict):
        raise ValueError("front matter nie jest słownikiem")
    return d


def lista(v):
    if v is None:
        return []
    return [str(x) for x in (v if isinstance(v, list) else [v])]


def data_str(v):
    if isinstance(v, (datetime.date, datetime.datetime)):
        return v.isoformat()[:10]
    return str(v or "")[:10]


def adres_domyslny(rel):
    """Adres strony Eleventy z ścieżki pliku względem src (bez permalink)."""
    bez = re.sub(r"\.(njk|md|html|liquid)$", "", rel)
    if bez.endswith("/index") or bez == "index":
        bez = bez[:-5]
    return "/" + (bez.strip("/") + "/" if bez.strip("/") else "")


# ---------------------------------------------------------------------------------------- strony „Nasze publikacje”
def strony_nasze(repo):
    """Strony z listy artykułów: src/publikacje/teksty/*.md oraz strony z tags „nasze”."""
    src = os.path.join(repo, "src")
    wynik = []
    for kat, katalogi, pliki in os.walk(src):
        katalogi[:] = [k for k in katalogi if not k.startswith("_") and k not in ("assets", "pliki")]
        for n in pliki:
            if not re.search(r"\.(md|njk)$", n):
                continue
            pelna = os.path.join(kat, n)
            rel = os.path.relpath(pelna, src).replace(os.sep, "/")
            tekst = open(pelna, encoding="utf-8").read()
            fm, _ = rozdziel_fm(tekst)
            if fm is None:
                continue
            try:
                d = fm_dane(fm)
            except ValueError:
                continue
            teksty = rel.startswith("publikacje/teksty/") and n.endswith(".md")
            if not (teksty or "nasze" in lista(d.get("tags"))):
                continue
            wynik.append({"plik": "src/" + rel, "dane": d, "url": d.get("permalink") or adres_domyslny(rel)})
    return wynik


def wczytaj_json(sciezka, domyslnie):
    return json.load(open(sciezka, encoding="utf-8")) if os.path.exists(sciezka) else domyslnie


def stan_strony(repo, commit=""):
    art = []
    for s in strony_nasze(repo):
        d = s["dane"]
        art.append({"numer": str(d.get("numer") or ""), "tytul": str(d.get("title") or ""), "url": s["url"],
                    "data": data_str(d.get("date")), "rodzaj": str(d.get("rodzaj") or "mały"),
                    "tematy": lista(d.get("tematy")), "zagadnienia": lista(d.get("zagadnienia")),
                    "przypiety": bool(d.get("przypiety")), "pinowalny": True, "plik": s["plik"]})
    for a in wczytaj_json(os.path.join(repo, "src/_data/akta.json"), []):
        art.append({"numer": str(a.get("sygnatura") or ""), "tytul": str(a.get("tytul") or ""),
                    "url": "/akta/" + slug_syg(a.get("sygnatura")) + "/", "data": str(a.get("data") or "")[:10],
                    "rodzaj": "dokumenty", "tematy": [], "zagadnienia": [], "przypiety": False, "pinowalny": False,
                    "plik": "src/_data/akta.json"})
    art = [a for a in art if a["numer"]]
    art.sort(key=lambda a: a["data"], reverse=True)
    g = wczytaj_json(os.path.join(repo, "src/_data/artykulGlowny.json"), {})
    glowny = {"tryb": g.get("tryb", "ręcznie"), "numer": g.get("numer", ""), "kolejka": g.get("kolejka", []),
              "coIleDni": g.get("coIleDni", 1)}
    tem = sorted({t for a in art for t in a["tematy"]}, key=str.lower)
    zag = sorted({z for a in art for z in a["zagadnienia"]}, key=str.lower)
    return {"stan_na": teraz(), "commit": commit, "artykuly": art, "glowny": glowny,
            "przypiete": [a["numer"] for a in art if a["przypiety"]], "tematy": tem[:60], "zagadnienia": zag[:120]}


# ---------------------------------------------------------------------------------------------- kontrola paczek
def rachunki_fundacji(repo):
    site = wczytaj_json(os.path.join(repo, "src/_data/site.json"), {})
    return {re.sub(r"\D", "", r.get("nr", "")) for r in site.get("rachunki", [])}


def pesel_ok(s):
    w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    return (10 - sum(int(s[i]) * w[i] for i in range(10)) % 10) % 10 == int(s[10])


def kontrola_tresci(tekst, rachunki):
    bledy = []
    for wz in ZAKAZANE:
        m = re.search(wz, tekst, re.I)
        if m:
            bledy.append(f"napis „{m.group(0)}”")
    for m in re.finditer(r"(?<!\d)\d{11}(?!\d)", tekst):
        if pesel_ok(m.group(0)):
            bledy.append(f"liczba wyglądająca na PESEL: {m.group(0)[:3]}…")
    for m in re.finditer(r"(?:PL)?\s?\d{2}(?:[  ]?\d{4}){6}", tekst):
        cyfry = re.sub(r"\D", "", m.group(0))
        if len(cyfry) == 26 and cyfry not in rachunki:
            bledy.append(f"numer rachunku spoza rachunków fundacji: …{cyfry[-4:]}")
    for m in re.finditer(r"\b[A-Z]{3}\s?\d{6}\b", tekst):
        bledy.append(f"zapis wyglądający na numer dowodu osobistego: {m.group(0)[:3]}…")
    return bledy


def kontrola_paczki_www(pk, repo, rachunki):
    bl = []
    for k in ("plik", "url", "sygn", "wersja", "md"):
        if not pk.get(k) and pk.get(k) != 0:
            bl.append(f"paczka nie ma pola {k}")
    if bl:
        return bl, None
    slug = slug_syg(pk["sygn"])
    if pk["plik"] != f"src/publikacje/teksty/{slug}.md":
        bl.append(f"plik {pk['plik']} – oczekiwano src/publikacje/teksty/{slug}.md")
    if pk["url"] != f"{WWW}/publikacje/{slug}/":
        bl.append(f"adres {pk['url']} – oczekiwano {WWW}/publikacje/{slug}/")
    fm, _ = rozdziel_fm(pk["md"])
    if fm is None:
        return bl + ["tekst nie zaczyna się od front matter (---)"], None
    try:
        d = fm_dane(fm)
    except ValueError as e:
        return bl + [str(e)], None
    for k in ("title", "date", "numer", "permalink", "lead", "zrodla"):
        if k not in d:
            bl.append(f"front matter bez pola {k}")
    if str(d.get("numer")) != pk["sygn"]:
        bl.append(f"numer w tekście {d.get('numer')} ≠ sygnatura paczki {pk['sygn']}")
    if d.get("permalink") != f"/publikacje/{slug}/":
        bl.append(f"permalink {d.get('permalink')} – oczekiwano /publikacje/{slug}/")
    bl += kontrola_tresci(pk["md"], rachunki)
    # inny plik z tym samym numerem albo adresem
    for s in strony_nasze(repo):
        if s["plik"] == pk["plik"]:
            continue
        if str(s["dane"].get("numer") or "") == pk["sygn"] or s["url"] == f"/publikacje/{slug}/":
            bl.append(f"na stronie jest już inny tekst z tym numerem albo adresem: {s['plik']}")
    return bl, d


def kontrola_paczki_karta(pk, rachunki):
    bl = []
    w = pk.get("wpis") or {}
    if pk.get("plik") != "src/_data/akta.json":
        bl.append(f"plik karty {pk.get('plik')} – oczekiwano src/_data/akta.json")
    for k in ("sygnatura", "typ", "tytul", "data", "adresat", "temat", "tresc"):
        if not w.get(k):
            bl.append(f"wpis karty bez pola {k}")
    if w.get("sygnatura") != pk.get("sygn"):
        bl.append("sygnatura wpisu ≠ sygnatura paczki")
    odp = w.get("odpowiedz")
    if odp and set(odp) - {"data"}:
        bl.append("o odpowiedzi wpis może mieć tylko datę")
    bl += kontrola_tresci(json.dumps(w, ensure_ascii=False), rachunki)
    return bl


# ------------------------------------------------------------------------------------------------- zmiany w repo
def zapisz(repo, rel, tekst):
    p = os.path.join(repo, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(tekst if tekst.endswith("\n") else tekst + "\n")


def commit(repo, opis, pliki):
    git(repo, "add", "--", *pliki)
    if not git(repo, "status", "--porcelain", "--", *pliki):
        return None
    git(repo, *AUTOR, "commit", "-q", "-m", opis)
    return git(repo, "rev-parse", "HEAD")


def ustaw_przypiety(tekst, chce):
    """Ustawia albo usuwa „przypiety: true” w front matter (inne linie bez zmian)."""
    m = re.match(r"^(---\r?\n)(.*?)(\r?\n---\r?\n?)", tekst, re.S)
    if not m:
        return tekst
    linie = [l for l in m.group(2).split("\n") if not re.match(r"^przypiety\s*:", l)]
    if chce:
        linie.append("przypiety: true")
    return m.group(1) + "\n".join(linie) + m.group(3) + tekst[m.end():]


def wybor_terminow(P, dzis, tryb, tids, sprawdzenie):
    """Terminy www do publikacji: (lista [(tid, termin, paczka, rodzaj_zmiany)], pominiete, bledy)."""
    T, PK, POM = P.get("terminy", {}), P.get("publikacje", {}), P.get("pomysly", {})
    wyb, pom, bl = [], [], []
    if tryb == "uklad":
        return wyb, pom, bl
    kandydaci = tids if tids else sorted(T)
    for tid in kandydaci:
        t = T.get(tid)
        if not t:
            bl.append({"tid": tid, "blad": "Nie ma takiego terminu na Platformie."})
            continue
        if t.get("typ") != "www":
            continue
        pk = PK.get(tid)
        karta_aktual = (t.get("stan") == "zrobione" and pk and pk.get("kanal") == "karta" and not pk.get("blad")
                        and not pk.get("czeka") and pk.get("hash") and pk.get("hash") != (t.get("pub") or {}).get("hash"))
        if t.get("stan") == "zrobione" and not (karta_aktual and not tids):
            if tids:
                pom.append({"tid": tid, "powod": "już opublikowany"})
            continue
        if not karta_aktual:
            if t.get("stan") != "ustalony":
                if tids:
                    pom.append({"tid": tid, "powod": f"stan terminu „{t.get('stan')}”"})
                continue
            if t.get("auto") is not True:
                if tids:
                    pom.append({"tid": tid, "powod": "termin zapisany przed włączeniem publikacji (bez „auto”)"})
                continue
            if str(t.get("data") or "") > dzis:
                if tids:
                    pom.append({"tid": tid, "powod": f"data publikacji {t.get('data')} jeszcze nie nadeszła"})
                continue
        pub = t.get("pub") or {}
        if pub.get("stan") == "w toku" and minut_od(pub.get("start")) < 30:
            pom.append({"tid": tid, "powod": "pracuje inne uruchomienie (w toku)"})
            continue
        if not pk:
            bl.append({"tid": tid, "blad": "Brak paczki – otwórz Platformę (przygotuje ją) i kliknij „Publikuj teraz”."})
            continue
        if pk.get("czeka"):
            pom.append({"tid": tid, "powod": pk["czeka"]})
            continue
        if pk.get("blad"):
            bl.append({"tid": tid, "blad": pk["blad"]})
            continue
        if (pk.get("test") or t.get("test")) and not sprawdzenie:
            bl.append({"tid": tid, "blad": "To dane testowe – nie publikuję."})
            continue
        p = POM.get(pk.get("pid") or t.get("pid") or "") or {}
        zw = (p.get("zatwierdzone") or {}).get("wersja")
        if zw is None or int(zw) != int(pk.get("wersja") or -1):
            bl.append({"tid": tid, "blad": "Zatwierdzona wersja się zmieniła albo jej nie ma – otwórz Platformę (odświeży paczkę) i kliknij „Publikuj teraz”."})
            continue
        wyb.append((tid, t, pk, "karta" if pk.get("kanal") == "karta" else "tekst"))
    return wyb, pom, bl


def przygotuj(repo, P, dzis, tryb, tids, uklad, sprawdzenie, rachunki):
    baza = git(repo, "rev-parse", "HEAD")
    wynik = {"tryb": tryb, "dzis": dzis, "baza": baza, "lista": [], "pominiete": [], "bledy": [], "commity": [],
             "pakiety": {}, "nowe_adresy": [], "uklad": None, "wybor": {"tids": [], "uklad": False}}
    wyb, pom, bl = wybor_terminow(P, dzis, tryb, tids, sprawdzenie)
    wynik["pominiete"] += pom
    wynik["bledy"] += bl
    przypinane = []
    for tid, t, pk, rodz in wyb:
        if rodz == "tekst":
            b, d = kontrola_paczki_www(pk, repo, rachunki)
            if b:
                wynik["bledy"].append({"tid": tid, "blad": "; ".join(b)})
                continue
            # paczki sprzed Platformy v17 nie mają w tekście „przypiety” – przypięcie z terminu dopisujemy tak samo
            zapisz(repo, pk["plik"], ustaw_przypiety(pk["md"], True) if pk.get("przypnij") and not d.get("przypiety") else pk["md"])
            tyt = str(d.get("title") or pk.get("tytul") or "")
            sha = commit(repo, f"Publikacja: {pk['sygn']} – {tyt}", [pk["plik"]])
            if pk.get("przypnij") or d.get("przypiety"):
                przypinane.append(pk["sygn"])
            poz = {"rodzaj": "tekst", "tid": tid, "sygn": pk["sygn"], "tytul": tyt, "plik": pk["plik"], "url": pk["url"],
                   "opis": "bez zmian względem strony" if sha is None else ""}
        else:
            b = kontrola_paczki_karta(pk, rachunki)
            if b:
                wynik["bledy"].append({"tid": tid, "blad": "; ".join(b)})
                continue
            sciezka = os.path.join(repo, "src/_data/akta.json")
            akta = wczytaj_json(sciezka, [])
            akta = [a for a in akta if a.get("sygnatura") != pk["wpis"]["sygnatura"]] + [pk["wpis"]]
            akta.sort(key=lambda a: (str(a.get("data") or ""), str(a.get("sygnatura") or "")))
            zapisz(repo, "src/_data/akta.json", json.dumps(akta, ensure_ascii=False, indent=1))
            tyt = str(pk["wpis"].get("tytul") or "")
            aktual = t.get("stan") == "zrobione"
            sha = commit(repo, f"{'Karta pisma – aktualizacja' if aktual else 'Karta pisma'}: {pk['sygn']} – {tyt}", ["src/_data/akta.json"])
            poz = {"rodzaj": "karta", "tid": tid, "sygn": pk["sygn"], "tytul": tyt, "plik": "src/_data/akta.json",
                   "url": pk.get("url") or f"{WWW}/akta/{slug_syg(pk['sygn'])}/",
                   "opis": "aktualizacja przebiegu" if aktual else ("bez zmian względem strony" if sha is None else "")}
        if sha:
            wynik["commity"].append({"sha": sha, "opis": git(repo, "log", "-1", "--format=%s")})
        wynik["lista"].append(poz)
        wynik["pakiety"][tid] = pk.get("hash", "")
        wynik["nowe_adresy"].append(poz["url"])
        wynik["wybor"]["tids"].append(tid)
    # układ strony głównej
    if uklad:
        wynik["wybor"]["uklad"] = True
        g = (P.get("www") or {}).get("glowna") or {}
        chce = [str(x.get("sygn") or x.get("id")) for x in (g.get("przypiete") or [])]
        for s in przypinane:
            if s not in chce:
                chce.append(s)
        zmienione, przyp_zm = [], []
        nasze = {str(s["dane"].get("numer") or ""): s for s in strony_nasze(repo)}
        for numer, s in nasze.items():
            if not numer:
                continue
            ma = bool(s["dane"].get("przypiety"))
            ma_byc = numer in chce
            if ma != ma_byc:
                p = os.path.join(repo, s["plik"])
                stary = open(p, encoding="utf-8").read()
                nowy = ustaw_przypiety(stary, ma_byc)
                if nowy != stary:
                    open(p, "w", encoding="utf-8", newline="\n").write(nowy)
                    zmienione.append(s["plik"])
                    przyp_zm.append(("+" if ma_byc else "−") + numer)
        brak = [n for n in chce if n not in nasze]
        gl_opis = ""
        if g.get("glowny"):
            sciezka = os.path.join(repo, "src/_data/artykulGlowny.json")
            stary = wczytaj_json(sciezka, {})
            nowy = dict(stary)
            gg = g["glowny"]
            nowy.update({"tryb": "cyklicznie" if gg.get("tryb") == "cyklicznie" else "ręcznie",
                         "numer": str(gg.get("numer") or stary.get("numer") or ""),
                         "kolejka": [str(x) for x in (gg.get("kolejka") or [])] if gg.get("tryb") == "cyklicznie" else stary.get("kolejka", []),
                         "coIleDni": int(gg.get("coIleDni") or 1)})
            if nowy != stary:
                # ten sam układ co w pliku: każde pole w osobnej linii, listy w jednej linii
                tekst = "{\n" + ",\n".join(f"  {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}" for k, v in nowy.items()) + "\n}"
                zapisz(repo, "src/_data/artykulGlowny.json", tekst)
                zmienione.append("src/_data/artykulGlowny.json")
                gl_opis = (f"artykuł główny cyklicznie co {nowy['coIleDni']} dni: {', '.join(nowy['kolejka'])}"
                           if nowy["tryb"] == "cyklicznie" else f"artykuł główny: {nowy['numer']}")
        opis = "; ".join(x for x in [gl_opis, ("przypięcia: " + ", ".join(przyp_zm)) if przyp_zm else ""] if x)
        sha = commit(repo, "Strona główna: " + (opis or "układ"), zmienione) if zmienione else None
        if sha:
            wynik["commity"].append({"sha": sha, "opis": git(repo, "log", "-1", "--format=%s")})
        wynik["uklad"] = {"zmiana": bool(sha), "przypiete": chce, "glowny": g.get("glowny"), "brak_na_stronie": brak}
        wynik["lista"].append({"rodzaj": "uklad", "tid": "", "sygn": "", "tytul": "Układ strony głównej",
                               "plik": ", ".join(zmienione), "url": WWW + "/",
                               "opis": (opis or "bez zmian względem strony") + (f"; nie ma na stronie: {', '.join(brak)}" if brak else "")})
        if sha:
            wynik["nowe_adresy"].insert(0, WWW + "/")
    wynik["drzewo"] = git(repo, "rev-parse", "HEAD^{tree}")
    wynik["zmiany"] = bool(wynik["commity"])
    return wynik


# ---------------------------------------------------------------------------------------------------- sprawdzenie
def sprawdz(site, wynik):
    bledy = []
    for poz in wynik.get("lista", []):
        if poz["rodzaj"] == "uklad":
            if not os.path.exists(os.path.join(site, "index.html")):
                bledy.append("brak strony głównej po budowie")
            continue
        url = poz["url"].replace(WWW, "")
        p = os.path.join(site, url.strip("/"), "index.html")
        if not os.path.exists(p):
            bledy.append(f"{poz['sygn']}: po budowie nie ma strony {url}")
            continue
        h = open(p, encoding="utf-8").read()
        import html as _h
        tyt = _h.escape(poz.get("tytul") or "", quote=False)
        if tyt and tyt not in h and (poz.get("tytul") or "") not in h:
            bledy.append(f"{poz['sygn']}: strona {url} nie pokazuje tytułu")
        if re.search(r"\{\{|\{%", h):
            bledy.append(f"{poz['sygn']}: na stronie {url} zostały znaczniki szablonu {{ }}")
        for wz in ZAKAZANE:
            if re.search(wz, h, re.I):
                bledy.append(f"{poz['sygn']}: na stronie {url} jest zakazany napis ({wz})")
    if any(p["rodzaj"] == "tekst" for p in wynik.get("lista", [])):
        idx = os.path.join(site, "index.html")
        h = open(idx, encoding="utf-8").read() if os.path.exists(idx) else ""
        for poz in wynik["lista"]:
            if poz["rodzaj"] == "tekst" and poz["sygn"] not in h:
                bledy.append(f"{poz['sygn']}: nie ma go na liście publikacji na stronie głównej")
    return bledy


# --------------------------------------------------------------------------------------------------------- główne
def tryb_z_wiadomosci(w):
    w = (w or "").strip()
    if "SPRAWDZENIE BEZ PUBLIKACJI" in w:
        return "sprawdzenie", []
    m = re.search(r"PLATFORMA FUNDACJI – PUBLIKACJA (.+)$", w, re.M)
    if m:
        return "publikacja", [x.strip() for x in m.group(1).split(",") if x.strip()]
    if "PLATFORMA FUNDACJI – UKŁAD STRONY GŁÓWNEJ" in w:
        return "uklad", []
    return "reczny", []


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("stan")
    a.add_argument("--repo", required=True)
    a.add_argument("--wyjscie", required=True)
    a.add_argument("--commit", default="")
    b = sub.add_parser("przygotuj")
    b.add_argument("--repo", required=True)
    b.add_argument("--dane", required=True, help="folder z dokumentami Platformy (ArtifactData out_dir)")
    b.add_argument("--dzis", required=True)
    b.add_argument("--wiadomosc", default="")
    b.add_argument("--wybor", default="", help="JSON {tids:[…], uklad:bool} – powtórzenie zatwierdzonego podglądu")
    b.add_argument("--dolacz", default="", help="JSON {tids:[…], uklad:bool} – pozycje czekającego podglądu, dołączane do nowego")
    b.add_argument("--wyjscie", required=True)
    c = sub.add_parser("sprawdz")
    c.add_argument("--site", required=True)
    c.add_argument("--wynik", required=True)
    x = ap.parse_args()
    if x.cmd == "stan":
        s = stan_strony(x.repo, x.commit)
        json.dump(s, open(x.wyjscie, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"artykułów: {len(s['artykuly'])}, przypięte: {', '.join(s['przypiete']) or '—'}, artykuł główny: {s['glowny']}")
        return 0
    if x.cmd == "przygotuj":
        P = czytaj_platforme(x.dane)
        tryb, tids = tryb_z_wiadomosci(x.wiadomosc)
        uklad = tryb == "uklad"
        if x.wybor:
            w = json.loads(x.wybor)
            tryb, tids, uklad = "powtorzenie", list(w.get("tids") or []), bool(w.get("uklad"))
        elif tryb in ("reczny", "sprawdzenie"):
            g = (P.get("www") or {}).get("glowna") or {}
            st = (P.get("www") or {}).get("strona") or {}
            uklad = bool(g.get("do_publikacji")) and (not st.get("uklad_kiedy") or g["do_publikacji"] > st["uklad_kiedy"])
        if x.dolacz and not x.wybor:
            d = json.loads(x.dolacz)
            if tryb in ("publikacja", "uklad"):
                tids = list(dict.fromkeys(list(tids) + [str(t) for t in (d.get("tids") or [])]))
                if tryb == "uklad" and tids:
                    tryb = "publikacja"
            uklad = uklad or bool(d.get("uklad"))
        w = przygotuj(x.repo, P, x.dzis, tryb, tids, uklad, tryb == "sprawdzenie", rachunki_fundacji(x.repo))
        json.dump(w, open(x.wyjscie, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"tryb {w['tryb']}: {len(w['lista'])} pozycji, {len(w['commity'])} commitów, błędy {len(w['bledy'])}, pominięte {len(w['pominiete'])}; drzewo {w['drzewo'][:10]}")
        return 0
    if x.cmd == "sprawdz":
        b = sprawdz(x.site, json.load(open(x.wynik, encoding="utf-8")))
        print("\n".join(b) if b else "SPRAWDZENIE OK")
        return 1 if b else 0


if __name__ == "__main__":
    sys.exit(main())
