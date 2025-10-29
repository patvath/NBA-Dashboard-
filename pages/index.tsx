import React, { useEffect, useState } from "react";

export default function Home() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const res = await fetch("/data/teams.json");
      const data = await res.json();
      setTeams(data);
    }
    fetchTeams();
  }, []);

  return (
    <div style={{ color: "#f5f5f5", background: "#111", minHeight: "100vh", padding: "2rem" }}>
      <h1>🏀 NBA Dashboard</h1>
      <h3>Select a Team</h3>
      <ul>
        {teams.map((team: any) => (
          <li key={team.id}>
            {team.full_name} ({team.abbreviation})
          </li>
        ))}
      </ul>
    </div>
  );
}
