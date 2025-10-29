import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PlayerPage() {
  const router = useRouter();
  const { playerId } = router.query;
  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!playerId) return;
    async function fetchData() {
      const res = await fetch(`/api/player/${playerId}`);
      const data = await res.json();
      setPlayer(data.player);
      setStats(data.seasonAverages);
    }
    fetchData();
  }, [playerId]);

  if (!player) return <p style={{ color: "#ddd" }}>Loading player data...</p>;

  return (
    <div style={{ color: "#f5f5f5", background: "#111", minHeight: "100vh", padding: "2rem" }}>
      <h1>{player.first_name} {player.last_name}</h1>
      <p>Team: {player.team?.full_name}</p>
      <p>Position: {player.position}</p>
      {stats && (
        <div>
          <h3>Season Averages</h3>
          <p>Points: {stats.pts}</p>
          <p>Rebounds: {stats.reb}</p>
          <p>Assists: {stats.ast}</p>
        </div>
      )}
    </div>
  );
}
