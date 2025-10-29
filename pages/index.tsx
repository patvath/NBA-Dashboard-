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

  // Fetch all teams on load
  useEffect(() => {
    async function fetchTeams() {
      try {
        console.log("Fetching NBA teams...");
        const res = await fetch("https://api.balldontlie.io/v1/teams", {
          headers: { Authorization: apiKey },
        });
        if (!res.ok) throw new Error(`Teams request failed: ${res.status}`);
        const json = await res.json();
        setTeams(json.data);
        console.log(`✅ Loaded ${json.data.length} NBA teams.`);
      } catch (e: any) {
        console.error("❌ Error fetching teams:", e.message);
        setError("Unable to fetch teams. Please check API key.");
      }
    }
    fetchTeams();
  }, []);

  // Fetch players when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    async function fetchPlayers() {
      try {
        setPlayers([]);
        setPlayerStats(null);
        setLoading(true);
        const res = await fetch(
          `https://api.balldontlie.io/v1/players?team_ids[]=${selectedTeam}&per_page=100`,
          {
            headers: { Authorization: apiKey },
          }
        );
        const json = await res.json();
        setPlayers(json.data);
      } catch (e: any) {
        console.error("❌ Error fetching players:", e.message);
        setError("Unable to fetch players for this team.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [selectedTeam]);

  // Fetch player stats when a player is selected
  useEffect(() => {
    if (!selectedPlayer) return;

    async function fetchStats() {
      setLoading(true);
      setPlayerStats(null);
      try {
        console.log("Fetching player stats...");

        // Try to get season averages
        const seasonRes = await fetch(
          `https://api.balldontlie.io/v1/season_averages?player_ids[]=${selectedPlayer}`,
          { headers: { Authorization: apiKey } }
        );

        const seasonData = await seasonRes.json();
        let stats = seasonData.data?.[0] || null;

        // If no season averages found, try last 10 games
        if (!stats) {
          console.log("No season averages found, fetching last 10 games...");
          const gamesRes = await fetch(
            `https://api.balldontlie.io/v1/stats?player_ids[]=${selectedPlayer}&per_page=10`,
            { headers: { Authorization: apiKey } }
          );
          const gamesData = await gamesRes.json();
          if (gamesData.data?.length) {
            const avg = (key: string) =>
              (
                gamesData.data.reduce((acc: number, g: any) => acc + g[key], 0) /
                gamesData.data.length
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

        setPlayerStats(stats);
      } catch (e: any) {
        console.error("❌ Error fetching player stats:", e.message);
        setError("Unable to fetch player stats.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
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
