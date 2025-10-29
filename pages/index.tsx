import React, { useEffect, useState } from "react";

// 🎨 NBA Dashboard with Theming and Fixed Player Fetch
export default function Dashboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active NBA teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/data/teams.json");
        const data = await res.json();

        const activeTeams = data.filter((t: any) =>
          [
            "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
            "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
            "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
            "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
            "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans",
            "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers",
            "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs",
            "Toronto Raptors", "Utah Jazz", "Washington Wizards"
          ].includes(t.full_name)
        );
        setTeams(activeTeams);
      } catch (err) {
        console.error("Failed to load teams", err);
      }
    }
    fetchTeams();
  }, []);

  // Fetch players for selected team
  useEffect(() => {
    if (!selectedTeam) return;
    async function fetchPlayers() {
      setLoadingPlayers(true);
      setError(null);
      setPlayers([]);
      try {
        const res = await fetch(`/api/team/${selectedTeam}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setError("No active players found for this team.");
          return;
        }
        const active = data.filter((p: any) => p.position && p.first_name && p.last_name);
        setPlayers(active);
      } catch (err) {
        setError("Failed to load players. Please try again.");
      } finally {
        setLoadingPlayers(false);
      }
    }
    fetchPlayers();
  }, [selectedTeam]);

  // Fetch player stats
  useEffect(() => {
    if (!selectedPlayer) return;
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const res = await fetch(`/api/player/${selectedPlayer}`);
        const data = await res.json
