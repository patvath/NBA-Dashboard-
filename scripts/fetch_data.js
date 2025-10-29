import fs from "fs";
import path from "path";
import axios from "axios";

const DATA_DIR = path.join(process.cwd(), "public/data");
const API_BASE = process.env.BALLDONTLIE_API || "https://api.balldontlie.io/v1";
const API_KEY = process.env.BALLDONTLIE_KEY;

// Axios instance with headers
const api = axios.create({
  baseURL: API_BASE,
  headers: API_KEY
    ? { Authorization: `Bearer ${API_KEY}` }
    : {},
});

// Utility delay
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchTeams() {
  const res = await api.get("/teams");
  return res.data.data;
}

async function fetchPlayers() {
  let page = 1;
  let players = [];
  let hasMore = true;

  console.log("🔄 Fetching players from API...");

  while (hasMore) {
    const res = await api.get("/players", { params: { page, per_page: 100 } });
    const batch = res.data.data;
    if (!batch || batch.length === 0) break;

    players = players.concat(batch);
    console.log(`📄 Page ${page} retrieved (${batch.length} players)`);

    // Detect next page (works for multiple API formats)
    const meta = res.data.meta || {};
    hasMore =
      (meta.next_page && meta.next_page !== null) ||
      (meta.total_pages && page < meta.total_pages) ||
      batch.length === 100;

    page++;
    await sleep(500); // Prevents throttling
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

  fs.writeFileSync(path.join(DATA_DIR, "teams.json"), JSON.stringify(teams, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "playersByTeam.json"), JSON.stringify(playersByTeam, null, 2));

  const projections = {
    all: [],
    top10: [],
    expertPicks: [],
    updated: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(DATA_DIR, "projections.json"), JSON.stringify(projections, null, 2));

  console.log("✅ Data saved in /public/data/");
}

run().catch((err) => {
  console.error("❌ Error fetching data:", err.message);
  process.exit(1);
});
}

run().catch(err => {
  console.error("❌ Error fetching data:", err.message);
  process.exit(1);
});
