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
  const apiKey = process.env.NEXT_PUBLIC_BALLDONTLIE_KEY;

  // Fetch NBA teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log("Fetching teams with API key:", apiKey ? "✅ Key found" : "❌ Missing key");
        const res = await axios.get("https://api.balldontlie.io/v1/teams", {
          headers: apiKey ? { Authorization: apiKey } : undefined,
        });
        console.log("Teams response:", res.data);

        const validTeams = res.data.data.filter((t: any) =>
          [
            "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
            "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
            "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
          ].includes(t.abbreviation)
        );

        setTeams(validTeams);
      } catch (error: any) {
        console.error("Error fetching teams:", error.response?.data || error.message);
      }
    };

    fetchTeams();
  }, [apiKey]);

  // Fetch players on selected team
  const fetchPlayers = async (teamId: string) => {
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });
      setPlayers(res.data.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Fetch selected player’s data
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
        params: { player_ids: [playerId] },
        headers: apiKey ? { Authorization: apiKey } : undefined,
      });

      if (res.data.data && res.data.data.length > 0) {
        setPlayerData(res.data.data[0]);
      } else {
        setPlayerData(null);
      }
    } catch (error) {
      console.error("Error fetching player stats:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{
      backgroundColor: "#0A1128",
      color: "#F5C518",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Inter, sans-serif",
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        🏀 NBA Dashboard
      </h1>

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

      {loading && <p>Loading player stats...</p>}
      {playerData && <ProjectionCard data={playerData} />}
    </div>
  );
}
