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

  // Fetch all teams
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
      } catch (err: any) {
        setError("Failed to load teams. Check API key.");
        console.error(err);
      }
    };

    fetchTeams();
  }, [apiKey]);

  // Fetch players for selected team
  const fetchPlayers = async (teamId: string) => {
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });
      setPlayers(res.data.data);
    } catch (err) {
      console.error(err);
      setPlayers([]);
    }
  };

  // Fetch player stats (with fallback to last season)
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    setError("");
    setPlayerData(null);

    try {
      let res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
        params: { player_ids: [playerId] },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });

      if (!res.data.data.length) {
        console.log("No data for current season, fetching previous season...");
        const lastSeason = new Date().getFullYear() - 1;
        res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
          params: { player_ids: [playerId], season: lastSeason },
          headers: apiKey ? { Authorization: apiKey } : undefined,
        });
      }

      if (res.data.data.length > 0) {
        setPlayerData(res.data.data[0]);
      } else {
        setError("No stats found for this player.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching player stats.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#0A1128",
      color: "#F5C518",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Inter, sans-serif",
    }}>
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
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.full_name}
            </option>
          ))}
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
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.first_name} {player.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading / Error / Data */}
      {loading && <p>Loading player stats...</p>}
      {error
