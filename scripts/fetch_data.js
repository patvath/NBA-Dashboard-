import fs from "fs";
import path from "path";
import axios from "axios";

const DATA_DIR = path.join(process.cwd(), "public/data");
const API_BASE = process.env.BALLDONTLIE_API || "https://api.balldontlie.io/v1";
const API_KEY = process.env.BALLDONTLIE_KEY;

const api = axios.create({
  baseURL: API_BASE,
  headers: API_KEY
    ? { Authorization: `Bearer ${API_KEY}` }
    : {},
});

async function fetchTeams() {
  const res = await api.get("/teams");
  return res.data.data;
}

async function fetchPlayers() {
  let page = 1;
  let players = [];
  console.log("🔄 Fetching players from API...");
  while (true) {
    const res = await api.get("/players", { params: { page, per_page: 100 } });
    players = players.concat(res.data.data);
    if (!res.data.meta.next_page) break;
    page++;
  }
  console.log(`✅ Retrieved ${players.length} players.`);
  return players;
}

async function run() {
  console.log("🏀 Fetching NBA data...");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const teams = await fetchTeams();
  const players = await fetchPlayers();

  const playersByTeam = {};
  teams.forEach(team => {
    playersByTeam[team.id] = players.filter(p => p.team?.id === team.id);
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

run().catch(err => {
  console.error("❌ Error fetching data:", err.message);
  process.exit(1);
});
