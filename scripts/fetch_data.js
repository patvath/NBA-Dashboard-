import fs from "fs";
import path from "path";
import axios from "axios";

const DATA_DIR = path.join(process.cwd(), "public/data");
const API_BASE = process.env.BALLDONTLIE_API || "https://www.balldontlie.io/api/v1";

async function fetchTeams() {
  const res = await axios.get(`${API_BASE}/teams`);
  return res.data.data;
}

async function fetchPlayers() {
  let page = 1;
  let players = [];
  while (true) {
    const res = await axios.get(`${API_BASE}/players`, { params: { page, per_page: 100 } });
    players = players.concat(res.data.data);
    if (!res.data.meta.next_page) break;
    page++;
  }
  return players;
}

async function run() {
  console.log("🏀 Fetching NBA data...");

  // Ensure output directory
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const teams = await fetchTeams();
  const players = await fetchPlayers();

  // Group players by team
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
