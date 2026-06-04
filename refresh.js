#!/usr/bin/env node
/**
 * Régénère le bloc de données du dashboard CMA à partir de l'API Monday.com.
 * Lit le board "Campagnes", filtre les clients CMA + CMA Formation, et réécrit
 * la section entre /*DATA_START*​/ et /*DATA_END*​/ dans index.html.
 *
 * Requiert la variable d'env MONDAY_TOKEN (token API personnel Monday).
 */
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.MONDAY_TOKEN;
if (!TOKEN) { console.error("MONDAY_TOKEN manquant"); process.exit(1); }

const BOARD_ID = 5091250450;
const CLIENTS = ["CMA", "CMA Formation"]; // noms exacts liés via la colonne Client
const COLS = {
  client: "board_relation_mm08s008",
  statut: "color_mm08xtat",
  timeline: "timerange_mm08k7s5",
  canaux: "dropdown_mm09snbc",
  mediaHT: "numeric_mm08yzzt",
  mediaStatut: "color_mm089w50",
  honoHT: "numeric_mm08a4wd",
  honoStatut: "color_mm08s5fb",
  code: "text_mm08e5s6",
};
const CANAL_MAP = {
  "Meta Ads": "Meta", "Tiktok Ads": "TikTok", "TikTok Ads": "TikTok",
  "Google Ads": "Google", "Taggage": "Taggage", "CRM": "CRM",
};

async function gql(query) {
  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": TOKEN, "API-Version": "2024-10" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const colIds = Object.values(COLS).map(c => `"${c}"`).join(",");

async function fetchAllItems() {
  const items = [];
  let cursor = null;
  // première page
  let data = await gql(`query {
    boards(ids: ${BOARD_ID}) {
      items_page(limit: 250) {
        cursor
        items { id name column_values(ids:[${colIds}]) { id text } }
      }
    }
  }`);
  let page = data.boards[0].items_page;
  items.push(...page.items);
  cursor = page.cursor;
  while (cursor) {
    data = await gql(`query {
      next_items_page(limit: 250, cursor: "${cursor}") {
        cursor
        items { id name column_values(ids:[${colIds}]) { id text } }
      }
    }`);
    page = data.next_items_page;
    items.push(...page.items);
    cursor = page.cursor;
  }
  return items;
}

const num = t => { if (t == null || t === "") return null; const n = parseFloat(("" + t).replace(",", ".")); return isNaN(n) ? null : n; };
const txt = t => (t == null || t === "") ? null : t.trim();

function parseTimeline(t) {
  if (!t) return [null, null];
  const m = t.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
  return m ? [m[1], m[2]] : [null, null];
}

function parseCanaux(t) {
  if (!t) return [];
  return t.split(",").map(s => s.trim()).map(s => CANAL_MAP[s] || s).filter(Boolean);
}

function colMap(item) {
  const m = {};
  item.column_values.forEach(cv => { m[cv.id] = cv.text; });
  return m;
}

(async () => {
  const all = await fetchAllItems();
  const rows = [];
  for (const it of all) {
    const m = colMap(it);
    const client = txt(m[COLS.client]);
    if (!CLIENTS.includes(client)) continue;
    const [debut, fin] = parseTimeline(m[COLS.timeline]);
    rows.push({
      id: Number(it.id),
      nom: it.name,
      client,
      statut: txt(m[COLS.statut]),
      debut, fin,
      canaux: parseCanaux(m[COLS.canaux]),
      mediaHT: num(m[COLS.mediaHT]),
      mediaStatut: txt(m[COLS.mediaStatut]),
      honoHT: num(m[COLS.honoHT]),
      honoStatut: txt(m[COLS.honoStatut]),
      code: txt(m[COLS.code]),
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines = rows.map(r => "{" + [
    `id:${r.id}`,
    `nom:${JSON.stringify(r.nom)}`,
    `client:${JSON.stringify(r.client)}`,
    `statut:${r.statut == null ? "null" : JSON.stringify(r.statut)}`,
    `debut:${r.debut == null ? "null" : JSON.stringify(r.debut)}`,
    `fin:${r.fin == null ? "null" : JSON.stringify(r.fin)}`,
    `canaux:${JSON.stringify(r.canaux)}`,
    `mediaHT:${r.mediaHT == null ? "null" : r.mediaHT}`,
    `mediaStatut:${r.mediaStatut == null ? "null" : JSON.stringify(r.mediaStatut)}`,
    `honoHT:${r.honoHT == null ? "null" : r.honoHT}`,
    `honoStatut:${r.honoStatut == null ? "null" : JSON.stringify(r.honoStatut)}`,
    `code:${r.code == null ? "null" : JSON.stringify(r.code)}`,
  ].join(",") + "}");

  const block =
    `/*DATA_START*/\n` +
    `const META = { generatedAt: ${JSON.stringify(today)}, boardUrl: "https://matcheo-company.monday.com/boards/${BOARD_ID}" };\n` +
    `const ITEMS = [\n${lines.join(",\n")}\n];\n` +
    `/*DATA_END*/`;

  const file = path.join(__dirname, "index.html");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/\/\*DATA_START\*\/[\s\S]*?\/\*DATA_END\*\//, block);
  fs.writeFileSync(file, html);
  console.log(`OK — ${rows.length} campagnes CMA/CMA Formation écrites (généré le ${today}).`);
})().catch(e => { console.error(e); process.exit(1); });
