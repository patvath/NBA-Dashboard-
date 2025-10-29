import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function TeamPage() {
  const router = useRouter();
  const { teamId } = router.query;
  const [players, setPlayers] = useState<any[]>([]);
  const [teamName, setTeamName] = useState<string>("");

  useEffect(() => {
    if (!teamId) return;
    async function fetchPlayers() {
      const res = await fetch(`/api/team/${teamId}`);
      const data = await res.json();
      setPlayers(data);
      if (data.length > 0) setTeamName(data[0].team.full_name);
    }
    fetchPlayers();
  }, [teamId]);

  return (
    <div style={{ color: "#f5f5f5", background: "#111", minHeight: "100vh", padding: "2rem" }}>
      <Link href="/" style={{ color: "#00b4d8" }}>
        ← Back to Teams
      </Link>
      <h1>{teamName || "Loading..."}</h1>
      <h3>Players</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            <Link
              href={`/player/${player.id}`}
              style={{
                color: "#00b4d8",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              {player.first_name} {player.last_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
