import { useEffect, useState } from "react";
import axios from "axios";
import ProjectionCard from "../components/ProjectionCard";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerData, setPlayerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const apiKey = process.env.NEXT_PUBLIC_BALLDONTLIE_KEY || "";

  // 🏀 Fetch NBA teams (with fallback + retry)
  const fetchTeams = async (attempt = 1) => {
    try {
      console.log(`Fetching NBA teams (attempt ${attempt})...`);
      const headers = apiKey ? { Authorization: apiKey } : {};
      const res = await axios.get("https://api.balldontlie.io/v1/teams", { headers });
      const data = res.data?.data || [];

      if (!data.length && attempt < 3) {
        console.warn("No teams found, retrying...");
        await new Promise((r) => setTimeout(r, 1500));
        return fetchTeams(attempt + 1);
      }

      const validTeams = data.filter((t: any) =>
        [
          "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
          "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
          "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
        ].includes(t.abbreviation)
      );
      setTeams(validTeams);
      console.log(`Loaded ${validTeams.length} NBA teams.`);
    } catch (err: any) {
      console.error("Error fetching teams:", err.message);
      setError("Failed to load NBA teams. Check your API key or rate limits.");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // 🧍 Fetch players for selected team
  const fetchPlayers = async (teamId: string) => {
    setPlayers([]);
    try {
      console.log(`Fetching players for team ID: ${teamId}`);
      const headers = apiKey ? { Authorization: apiKey } : {};
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers,
      });
      setPlayers(res.data?.data || []);
      console.log(`Loaded ${res.data?.data?.length} players.`);
    } catch (err: any) {
      console.error("Error fetching players:", err.message);
      setPlayers([]);
    }
  };

  // 📊 Fetch player stats (multi-source fallback)
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    console.log(`Fetching stats for player ID: ${playerId}`);

    try {
      const headers = apiKey ? { Authorization: apiKey } : {};

      // Try current season
      let res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
        params: { player_ids: [playerId] },
        headers,
      });

      if (!res.data.data.length) {
        console.log("No current season stats, checking previous season...");
        const prevSeason = new Date().getFullYear() - 1;
        res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
          params: { player_ids: [playerId], season: prevSeason },
          headers,
        });
      }

      if (!res.data.data.length) {
        console.log("No averages found, checking latest game...");
        const gRes = await axios.get("https://api.balldontlie.io/v1/stats", {
          params: { player_ids: [playerId], per_page: 1 },
          headers,
        });
        if (gRes.data.data.length) {
          const g = gRes.data.data[0];
          res.data.data = [
            {
              pts: g.pts,
              reb: g.reb,
              ast: g.ast,
              stl: g.stl,
              blk: g.blk,
              fg_pct: g.fg_pct,
              date: g.game.date,
            },
          ];
        }
      }

      if (res.data.data.length) {
        setPlayerData(res.data.data[0]);
        console.log("Player stats found:", res.data.data[0]);
      } else {
        setError("No stats found for this player.");
      }
    } catch (err: any) {
      console.error("Error fetching player stats:", err.message);
      setError("Failed to fetch player stats. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0A1128",
        color: "#F5C518",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: "20px" }}>
        🏀 NBA Dashboard
      </h1>

      {/* Team Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <label>Team:</label>
        <select
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            fetchPlayers(e.target.value);
          }}
          value={selectedTeam}
          style={{
            padding: "10px",
            backgroundColor: "#141A33",
            color: "#F5C518",
            border: "1px solid #F5C518",
            borderRadius: "8px",
            marginLeft: "10px",
          }}
        >
          <option value="">-- Choose a team --</option>
          {teams.length > 0 ? (
            teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.full_name}
              </option>
            ))
          ) : (
            <option>Loading teams...</option>
          )}
        </select>
      </div>

      {/* Player Dropdown */}
      {selectedTeam && (
        <div style={{ marginBottom: "20px" }}>
          <label>Player:</label>
          <select
            onChange={(e) => {
              setSelectedPlayer(e.target.value);
              fetchPlayerStats(e.target.value);
            }}
            value={selectedPlayer}
            style={{
              padding: "10px",
              backgroundColor: "#141A33",
              color: "#F5C518",
              border: "1px solid #F5C518",
              borderRadius: "8px",
              marginLeft: "10px",
            }}
          >
            <option value="">Select Player</option>
            {players.length > 0 ? (
              players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))
            ) : (
              <option>Loading players...</option>
            )}
          </select>
        </div>
      )}

      {loading && <p>Loading player stats...</p>}
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {playerData && (
        <div style={{ marginTop: "30px" }}>
          <ProjectionCard data={playerData} />
        </div>
      )}
    </div>
  );
}
