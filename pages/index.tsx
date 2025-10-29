import { useState, useEffect } from "react";
import ProjectionCard from "../components/ProjectionCard";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_BALLDONTLIE_KEY || "";

  // Utility: universal fetch wrapper that logs everything
  async function safeFetch(url: string, label: string) {
    console.log(`🔹 Fetching ${label} → ${url}`);
    try {
      const res = await fetch(url, { headers: { Authorization: apiKey } });
      const json = await res.json();
      console.log(`✅ ${label} response:`, json);
      if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
      return json;
    } catch (e: any) {
      console.error(`❌ Error fetching ${label}:`, e.message);
      throw e;
    }
  }

  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const data = await safeFetch(
          "https://api.balldontlie.io/v1/teams",
          "Teams"
        );
        setTeams(data.data || []);
      } catch {
        setError("Failed to load NBA teams (check API key).");
      }
    }
    fetchTeams();
  }, []);

  // Fetch players for selected team
  useEffect(() => {
    if (!selectedTeam) return;
    async function fetchPlayers() {
      setPlayers([]);
      setPlayerStats(null);
      setLoading(true);
      try {
        const data = await safeFetch(
          `https://api.balldontlie.io/v1/players?team_ids[]=${selectedTeam}&per_page=100`,
          "Players"
        );
        setPlayers(data.data || []);
      } catch {
        setError("Failed to load players for this team.");
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, [selectedTeam]);

  // Fetch player stats when player selected
  useEffect(() => {
    if (!selectedPlayer) return;

    async function fetchPlayerStats() {
      setLoading(true);
      setError("");
      setPlayerStats(null);
      try {
        // Try season averages first
        const season = await safeFetch(
          `https://api.balldontlie.io/v1/season_averages?player_ids[]=${selectedPlayer}`,
          "Season Averages"
        );

        let stats = season.data?.[0] || null;

        // If no season averages → get last 10 games
        if (!stats) {
          console.log("ℹ️ No season averages found, fetching last 10 games...");
          const games = await safeFetch(
            `https://api.balldontlie.io/v1/stats?player_ids[]=${selectedPlayer}&per_page=10`,
            "Recent Games"
          );
          if (games.data?.length) {
            const avg = (key: string) =>
              (
                games.data.reduce((a: number, g: any) => a + (g[key] || 0), 0) /
                games.data.length
              ).toFixed(1);
            stats = {
              pts: avg("pts"),
              reb: avg("reb"),
              ast: avg("ast"),
              stl: avg("stl"),
              blk: avg("blk"),
              source: "recent_10_games",
            };
          }
        } else {
          stats.source = "season_averages";
        }

        if (!stats) {
          console.warn("⚠️ No stats found for player:", selectedPlayer);
          setError("No stats found for this player (new season or no data yet).");
        }

        setPlayerStats(stats);
      } catch (err: any) {
        console.error("❌ Error in stats fetch pipeline:", err.message);
        setError("Unable to load player stats. Check logs for details.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerStats();
  }, [selectedPlayer]);

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#0B132B",
        color: "#F5C518",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <h1 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "20px" }}>
        🏀 NBA Dashboard
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "#E63946",
            padding: "10px 20px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "10px" }}>Team:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{
              backgroundColor: "#1C2541",
              color: "white",
              borderRadius: "8px",
              padding: "8px",
              border: "none",
            }}
          >
            <option value="">-- Choose a team --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.full_name}
              </option>
            ))}
          </select>
        </div>

        {players.length > 0 && (
          <div>
            <label style={{ marginRight: "10px" }}>Player:</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              style={{
                backgroundColor: "#1C2541",
                color: "white",
                borderRadius: "8px",
                padding: "8px",
                border: "none",
              }}
            >
              <option value="">-- Choose a player --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        {loading && <p>Loading player stats...</p>}
        {!loading && selectedPlayer && !playerStats && (
          <p>No data found for this player.</p>
        )}
        {playerStats && <ProjectionCard data={playerStats} />}
      </div>
    </div>
  );
}
