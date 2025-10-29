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

  const apiKey = process.env.NEXT_PUBLIC_BALLDONTLIE_KEY;

  // Fetch NBA teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("https://api.balldontlie.io/v1/teams", {
          headers: apiKey ? { Authorization: apiKey } : undefined,
        });
        const validTeams = res.data.data.filter((t: any) =>
          [
            "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
            "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
            "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
          ].includes(t.abbreviation)
        );
        setTeams(validTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Could not load teams.");
      }
    };
    fetchTeams();
  }, [apiKey]);

  // Fetch players for team
  const fetchPlayers = async (teamId: string) => {
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });
      setPlayers(res.data.data);
    } catch (err) {
      console.error("Error fetching players:", err);
      setPlayers([]);
    }
  };

  // Fetch player stats (multi-source fallback)
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    setError("");
    setPlayerData(null);
    console.log(`Fetching stats for player ID: ${playerId}`);

    try {
      // Try current season averages
      let res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
        params: { player_ids: [playerId] },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });

      // Fallback to previous season if empty
      if (!res.data.data.length) {
        console.log("No current season data found, fetching previous season...");
        const lastSeason = new Date().getFullYear() - 1;
        res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
          params: { player_ids: [playerId], season: lastSeason },
          headers: apiKey ? { Authorization: apiKey } : undefined,
        });
      }

      // Fallback to latest game stats if still empty
      if (!res.data.data.length) {
        console.log("No season averages found. Fetching latest game performance...");
        const gamesRes = await axios.get("https://api.balldontlie.io/v1/stats", {
          params: { player_ids: [playerId], per_page: 1 },
          headers: apiKey ? { Authorization: apiKey } : undefined,
        });

        if (gamesRes.data.data.length) {
          const g = gamesRes.data.data[0];
          res.data.data = [
            {
              pts: g.pts,
              reb: g.reb,
              ast: g.ast,
              blk: g.blk,
              stl: g.stl,
              fg_pct: g.fg_pct,
              game_date: g.game.date,
            },
          ];
        }
      }

      if (res.data.data.length > 0) {
        console.log("Player stats found:", res.data.data[0]);
        setPlayerData(res.data.data[0]);
      } else {
        setError("No stats available for this player.");
      }
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setError("Failed to fetch player stats.");
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

      {/* Team Selection */}
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
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Player Selection */}
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
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.first_name} {player.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Feedback */}
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
