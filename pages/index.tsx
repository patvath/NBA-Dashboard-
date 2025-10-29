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

  // Fetch NBA teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log("Fetching NBA teams...");
        const headers = apiKey ? { Authorization: apiKey } : {};
        const res = await axios.get("https://api.balldontlie.io/v1/teams", { headers });
        const validTeams = res.data.data.filter((t: any) =>
          [
            "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
            "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
            "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS",
          ].includes(t.abbreviation)
        );
        setTeams(validTeams);
        console.log(`✅ Loaded ${validTeams.length} NBA teams.`);
      } catch (err: any) {
        console.error("Error fetching teams:", err.message);
        setError("Failed to load NBA teams. Check API key or rate limits.");
      }
    };
    fetchTeams();
  }, [apiKey]);

  // Fetch players for team
  const fetchPlayers = async (teamId: string) => {
    try {
      const headers = apiKey ? { Authorization: apiKey } : {};
      console.log(`Fetching players for team ID: ${teamId}`);
      const res = await axios.get("https://api.balldontlie.io/v1/players", {
        params: { team_ids: [teamId], per_page: 100 },
        headers,
      });
      setPlayers(res.data?.data || []);
    } catch (err: any) {
      console.error("Error fetching players:", err.message);
      setPlayers([]);
    }
  };

  // Fetch player stats (season averages or last 10 games)
  const fetchPlayerStats = async (playerId: string) => {
    setLoading(true);
    setError("");
    setPlayerData(null);

    try {
      const headers = apiKey ? { Authorization: apiKey } : {};
      console.log(`Fetching stats for player ID: ${playerId}`);

      // Try current season averages
      let res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
        params: { player_ids: [playerId] },
        headers,
      });

      let data = res.data.data;

      // Fallback: previous season averages
      if (!data.length) {
        console.log("No current season data, fetching previous season...");
        const prevSeason = new Date().getFullYear() - 1;
        res = await axios.get("https://api.balldontlie.io/v1/season_averages", {
          params: { player_ids: [playerId], season: prevSeason },
          headers,
        });
        data = res.data.data;
      }

      // Fallback: compute recent 10-game averages
      if (!data.length) {
        console.log("No season averages found, computing recent 10-game averages...");
        const gamesRes = await axios.get("https://api.balldontlie.io/v1/stats", {
          params: { player_ids: [playerId], per_page: 10 },
          headers,
        });

        const games = gamesRes.data.data;
        if (games.length) {
          const totals = games.reduce(
            (acc: any, g: any) => {
              acc.pts += g.pts;
              acc.reb += g.reb;
              acc.ast += g.ast;
              acc.stl += g.stl;
              acc.blk += g.blk;
              return acc;
            },
            { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0 }
          );

          const avg = {
            pts: (totals.pts / games.length).toFixed(1),
            reb: (totals.reb / games.length).toFixed(1),
            ast: (totals.ast / games.length).toFixed(1),
            stl: (totals.stl / games.length).toFixed(1),
            blk: (totals.blk / games
