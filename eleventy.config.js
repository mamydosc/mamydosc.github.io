// Konfiguracja generatora strony mamydosc.org (Eleventy).
// Treść: src/_data/*.json (akta, cykle, ustawienia) i src/publikacje/**/*.md (artykuły).
const QRCode = require("qrcode");

const MIESIACE = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
const DNI = ["nd","pn","wt","śr","czw","pt","sob"];

function parse(d) {
  // przyjmuje "2026-10-12" albo obiekt Date
  if (d instanceof Date) return d;
  const [y, m, day] = String(d).split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
}

module.exports = function (cfg) {
  cfg.addPassthroughCopy({ "src/assets": "assets" });
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
  cfg.addFilter("gdzie", (arr, key, val) => (arr || []).filter((x) => x[key] === val));

  // Kod QR jako SVG (wbudowany w stronę, bez zewnętrznych usług)
  cfg.addAsyncShortcode("qr", async (text) =>
    QRCode.toString(text, { type: "svg", margin: 0, color: { dark: "#1D2939", light: "#FFFFFF" }, errorCorrectionLevel: "M" })
  );

  cfg.addCollection("artykuly", (api) =>
    api.getFilteredByGlob("src/publikacje/**/*.md").sort((a, b) => a.date - b.date)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
