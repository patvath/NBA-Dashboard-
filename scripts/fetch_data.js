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

async function run() {
  console.log("🏀 Fetching teams list...");

  const res = await api.get("/teams");
  const teams = res.data.data;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, "teams.json"), JSON.stringify(teams, null, 2));

  console.log("✅ Teams data saved in /public/data/teams.json");
}

run().catch((err) => {
  console.error("❌ Error fetching data:", err.message);
  process.exit(1);
});
