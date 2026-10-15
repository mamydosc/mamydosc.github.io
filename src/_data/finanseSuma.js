// Wyliczenia do strony /finanse/ z pliku finanse.json (bez ręcznego przepisywania liczb).
const F = require("./finanse.json");

module.exports = () => {
  const ops = [...F.operacje].sort((a, b) => a.data.localeCompare(b.data) || a.nr.localeCompare(b.nr, "pl", { numeric: true }));
  const r2 = (x) => Math.round(x * 100) / 100;
  const wplywy = r2(ops.filter((o) => o.kwota > 0).reduce((s, o) => s + o.kwota, 0));
  const koszty = r2(-ops.filter((o) => o.kwota < 0).reduce((s, o) => s + o.kwota, 0));

  // miesiące – ciągła oś, także miesiące bez operacji
  const mies = [];
  if (ops.length) {
    let [y, m] = ops[0].data.slice(0, 7).split("-").map(Number);
    const [y2, m2] = ops[ops.length - 1].data.slice(0, 7).split("-").map(Number);
    while (y < y2 || (y === y2 && m <= m2)) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      const w = ops.filter((o) => o.data.startsWith(k));
      mies.push({ k, wplywy: r2(w.filter((o) => o.kwota > 0).reduce((s, o) => s + o.kwota, 0)), koszty: r2(-w.filter((o) => o.kwota < 0).reduce((s, o) => s + o.kwota, 0)) });
      m++; if (m > 12) { m = 1; y++; }
    }
  }
  const maxM = Math.max(1, ...mies.map((x) => Math.max(x.wplywy, x.koszty)));
  // podziałka osi: 1, 2, 2,5 lub 5 × 10^n
  const krok = (() => { const raw = maxM / 4, p = Math.pow(10, Math.floor(Math.log10(raw))); for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= raw) return k * p; return 10 * p; })();
  const skala = Math.ceil(maxM / krok) * krok;

  const fundusze = F.fundusze.map((f) => {
    const w = ops.filter((o) => o.fundusz === f.id);
    const wp = r2(w.filter((o) => o.kwota > 0).reduce((s, o) => s + o.kwota, 0));
    const ko = r2(-w.filter((o) => o.kwota < 0).reduce((s, o) => s + o.kwota, 0));
    return { ...f, wplywy: wp, koszty: ko, saldo: r2(wp - ko), n: w.length };
  });
  const maxF = Math.max(1, ...fundusze.map((f) => Math.max(f.wplywy, f.koszty)));

  const kat = (typ) => Object.entries(F.kategorie).filter(([, k]) => k.typ === typ).map(([id, k]) => {
    const suma = r2(Math.abs(ops.filter((o) => o.kategoria === id).reduce((s, o) => s + o.kwota, 0)));
    return { id, nazwa: k.nazwa, suma };
  }).filter((k) => k.suma > 0).sort((a, b) => b.suma - a.suma);

  const csv = ["nr;data;rodzaj;kategoria;opis;kontrahent;fundusz;kwota;dokument"].concat(
    ops.map((o) => [o.nr, o.data, o.kwota > 0 ? "wpływ" : "koszt", F.kategorie[o.kategoria].nazwa, o.opis, o.kontrahent,
      (F.fundusze.find((f) => f.id === o.fundusz) || {}).nazwa, String(o.kwota).replace(".", ","), o.dokument]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
  ).join("\r\n");

  const W = 960, Lx = 64, kol = (W - Lx) / Math.max(1, mies.length);
  const wykres = { W, H: 260, L0: Lx, B: 228, kol, bw: Math.min(26, (kol - 18) / 2) };

  return {
    wykres, ops: [...ops].reverse(), wplywy, koszty, saldo: r2(wplywy - koszty),
    mies, skala, krok, fundusze, maxF,
    katWplywy: kat("wplyw"), katKoszty: kat("koszt"),
    udzialStalych: koszty ? Math.round((ops.filter((o) => o.kwota < 0 && o.fundusz === "ogolny").reduce((s, o) => s - o.kwota, 0) / koszty) * 100) : 0,
    csv: "﻿" + csv,
  };
};
