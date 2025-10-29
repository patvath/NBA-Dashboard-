import fs from "fs";
import path from "path";
import axios from "axios";

const DATA_DIR = path.join(process.cwd(), "public/data");
const API_BASE = process.env.BALLDONTLIE_API || "https://api.balldontlie.io/v1";
const API_KEY = process.env.BALLDONTLIE_KEY;

const api = axios.create({
  baseURL: API_BASE,
  headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---- Smart Request Wrapper ----
async function safeRequest(url, params = {}, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await api.get(url, { params });
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        const wait = 2000 * attempt;
        console.warn(`⚠️ Rate limit hit. Waiting ${wait / 1000}s before retry...`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Too many retries — still rate limited.");
}

async function fetchTeams() {
  const res = await safeRequest("/teams");
  return res.data.data;
}

async function fetchPlayers() {
  let page = 1;
  let players = [];
  let hasMore = true;

  console.log("🔄 Fetching players from API...");

  while (hasMore) {
    const res = await safeRequest("/players", { page, per_page: 100 });
    const batch = res.data.data || [];
    if (batch.length === 0) break;

    players = players.concat(batch);
    console.log(`📄 Page ${page} retrieved (${batch.length} players)`);

    const meta = res.data.meta || {};
    hasMore =
      (meta.next_page && meta.next_page !== null) ||
      (meta.total_pages && page < meta.total_pages) ||
      batch.length === 100;

    page++;
    await sleep(1000); // 1s delay per request to stay under rate limit
  }

  console.log(`✅ Retrieved ${players.length} total players.`);
  return players;
}

async function run() {
  console.log("🏀 Fetching NBA data...");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const teams = await fetchTeams();
  const players = await fetchPlayers();

  const playersByTeam = {};
  teams.forEach((team) => {
    playersByTeam[team.id] = players.filter((p) => p.team?.id === team.id);
  });

  fs.writeFileSync(
    path.join(DATA_DIR, "teams.json"),
    JSON.stringify(teams, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "playersByTeam.json"),
    JSON.stringify(playersByTeam, null, 2)
  );

  const projections = {
    all: [],
    top10: [],
    expertPicks: [],
    updated: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(DATA_DIR, "projections.json"),
    JSON.stringify(projections, null, 2)
  );

  console.log("✅ Data saved in /public/data/");
}

run().catch((err) => {
  console.error("❌ Error fetching data:", err.message);
  process.exit(1);
});
