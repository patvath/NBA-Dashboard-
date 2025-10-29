import { useEffect, useState } from "react";
import ProjectionCard from "../components/ProjectionCard";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [projections, setProjections] = useState([]);

  useEffect(() => {
    fetch("/api/projection/top10")
      .then((r) => r.json())
      .then(setProjections)
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a1124] text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#f0c14b] mb-6">
          🏀 Top 10 Projected Players
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projections.map((p) => (
            <ProjectionCard key={p.player.id} data={p} />
          ))}
        </div>
      </main>
    </div>
  );
}
