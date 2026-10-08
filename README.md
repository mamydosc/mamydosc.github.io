# Strona Fundacji MAMY DOŚĆ (mamydosc.org)

Strona budowana generatorem Eleventy. Po każdej zmianie w gałęzi `main` GitHub sam ją buduje i publikuje (plik `.github/workflows/publikuj.yml`). Raz dziennie przebudowuje się też automatycznie, żeby odświeżyć daty i liczniki.

## Gdzie co jest

| Co | Plik |
|---|---|
| Ustawienia (e-maile, KRS, NIP, tryb roboczy) | `src/_data/site.json` |
| Akta spraw (sygnatury, statusy, przebieg) | `src/_data/akta.json` |
| Cykle publikacji i daty części | `src/_data/cykle.json` |
| Artykuły | `src/publikacje/<cykl>/<nr>-<tytul>.md` |
| PDF-y pism | `src/pliki/MD-TYP-ROK-NR.pdf` |
| Wygląd | `src/assets/style.css` |

## Zasady

- Repozytorium jest publiczne. Trafia tu tylko to, co ma być na stronie.
- Każde pismo ma sygnaturę `MD/TYP/ROK/NR`. Adres karty akt: `/akta/md-typ-rok-nr/`. Ten sam adres jest w kodzie QR na piśmie.
- `"robocza": true` w `site.json` pokazuje pasek „wersja robocza” i blokuje indeksowanie przez wyszukiwarki. Przed startem ustawić `false`.
- Strona nie używa cookies ani zewnętrznych czcionek i skryptów.

## Praca lokalna

```
npm install
npm start        # podgląd na http://localhost:8080
npm run build    # gotowa strona w folderze _site
```
