import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch active NBA teams only
  useEffect(() => {
    async function fetchTeams() {
      const res = await fetch("/data/teams.json");
      const data = await res.json();

      // Filter out defunct/legacy teams (no city or old franchises)
      const activeTeams = data.filter((t: any) =>
        [
          "Atlanta Hawks",
          "Boston Celtics",
          "Brooklyn Nets",
          "Charlotte Hornets",
          "Chicago Bulls",
          "Cleveland Cavaliers",
          "Dallas Mavericks",
          "Denver Nuggets",
          "Detroit Pistons",
          "Golden State Warriors",
          "Houston Rockets",
          "Indiana Pacers",
          "LA Clippers",
          "Los Angeles Lakers",
          "Memphis Grizzlies",
          "Miami Heat",
          "Milwaukee Bucks",
          "Minnesota Timberwolves",
          "New Orleans Pelicans",
          "New York Knicks",
          "Oklahoma City Thunder",
          "Orlando Magic",
          "Philadelphia 76ers",
          "Phoenix Suns",
          "Portland Trail Blazers",
          "Sacramento Kings",
          "San Antonio Spurs",
          "Toronto Raptors",
          "Utah Jazz",
          "Washington Wizards",
        ].includes(t.full_name)
      );
      setTeams(activeTeams);
    }
    fetchTeams();
  }, []);

  // When team selected → fetch active players
  useEffect(() => {
    if (!selectedTeam) return;
    async function fetchPlayers() {
      setLoading(true);
      const res = await fetch(`/api/team/${selectedTeam}`);
      const data = await res.json();

      // Filter out retired players (those with no season averages)
      const currentPlayers: any[] = [];
      for (const player of data) {
        try {
          const avgRes = await fetch(
            `/api/player/${player.id}`
          );
          const avgData = await avgRes.json();
          if (avgData.seasonAverages && avgData.seasonAverages.pts > 0) {
            currentPlayers.push(player);
          }
        } catch {}
      }

      setPlayers(currentPlayers);
      setSelectedPlayer("");
      setPlayerStats(null);
      setLoading(false);
    }
    fetchPlayers();
  }, [selectedTeam]);

  // When player selected → show data
  useEffect(() => {
    if (!selectedPlayer) return;
    async function fetchStats() {
      setLoading(true);
      const res = await fetch(`/api/player/${selectedPlayer}`);
      const data = await res.json();
      setPlayerStats(data);
      setLoading(false);
    }
    fetchStats();
  }, [selectedPlayer]);

  return (
    <div
      style={{
        background: "#111",
        color: "#f5f5f5",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🏀 NBA Dashboard</h1>
      <p>Select a team, then a player to view live stats.</p>

      {/* TEAM DROPDOWN */}
      <label htmlFor="team">Team:</label>
      <br />
      <select
        id="team"
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        style={{
          padding: "0.5rem",
          margin: "0.5rem 0",
          background: "#222",
          color: "#fff",
          border: "1px solid #444",
        }}
      >
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.full_name}
          </option>
        ))}
      </select>

      {/* PLAYER DROPDOWN */}
      {selectedTeam && (
        <>
          <br />
          <label htmlFor="player">Player:</label>
          <br />
          <select
            id="player"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            style={{
              padding: "0.5rem",
              margin: "0.5rem 0",
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          >
            <option value="">Select Player</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* PLAYER OUTPUT */}
      {loading && <p>Loading data...</p>}
      {playerStats && playerStats.player && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>
            {playerStats.player.first_name} {playerStats.player.last_name}
          </h2>
          <p>Team: {playerStats.player.team.full_name}</p>
          <p>Position: {playerStats.player.position}</p>

          <h3>Season Averages:</h3>
          <ul>
            <li>Points: {playerStats.seasonAverages?.pts || 0}</li>
            <li>Rebounds: {playerStats.seasonAverages?.reb || 0}</li>
            <li>Assists: {playerStats.seasonAverages?.ast || 0}</li>
            <li>Steals: {playerStats.seasonAverages?.stl || 0}</li>
            <li>Blocks: {playerStats.seasonAverages?.blk || 0}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
