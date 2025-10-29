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

  // Fetch only active NBA teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("https://api.balldontlie.io/v1/teams", {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_BALLDONTLIE_KEY || "",
          },
        });
        const validTeams = res.data.data.filter((t: any) =>
          [
            "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
            "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
            "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
          ].includes(t.abbreviation)
        );
        setTeams(validTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  // Fetch players for selected team
  const fetchPlayers = async (teamId: string) => {
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers: {
          Authorization: process.env.NEXT_PUBLIC_BALLDONTLIE_KEY || "",
        },
      });

      // Filter out retired players or missing team associations
      const activePlayers = res.data.data.filter(
        (p: any) => p.team && p.team.id === parseInt(teamId)
      );

      setPlayers(activePlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Fetch selected player’s live data
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    try {
      const res = await axios.get("https://api.balldontlie.io/v1/stats", {
        params: { player_ids: [playerId], per_page: 1 },
        headers: {
          Authorization: process.env.NEXT_PUBLIC_BALLDONTLIE_KEY || "",
        },
      });

      if (res.data.data && res.data.data.length > 0) {
        const playerStats = res.data.data[0];
        setPlayerData(playerStats);
      } else {
        setPlayerData(null);
      }
    } catch (error) {
      console.error("Error fetching player stats:", error);
    }
    setLoading(false);
  };

  // Handle team selection
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    setPlayers([]);
    setSelectedPlayer("");
    setPlayerData(null);
    if (teamId) fetchPlayers(teamId);
  };

  // Handle player selection
  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    setSelectedPlayer(playerId);
    if (playerId) fetchPlayerStats(playerId);
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
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        🏀 NBA Dashboard
      </h1>

      <p style={{ marginBottom: "20px", color: "#CCCCCC" }}>
        Select a team, then a player to view live stats.
      </p>

      {/* Team Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="team-select" style={{ marginRight: "10px" }}>
          Team:
        </label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={handleTeamChange}
          style={{
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#141A33",
            color: "#F5C518",
            border: "1px solid #F5C518",
          }}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Player Selector */}
      {selectedTeam && (
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="player-select" style={{ marginRight: "10px" }}>
            Player:
          </label>
          <select
            id="player-select"
            value={selectedPlayer}
            onChange={handlePlayerChange}
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "#141A33",
              color: "#F5C518",
              border: "1px solid #F5C518",
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

      {/* Loading State */}
      {loading && <p>Loading player stats...</p>}

      {/* Player Data Card */}
      {!loading && playerData && <ProjectionCard data={playerData} />}
    </div>
  );
}
