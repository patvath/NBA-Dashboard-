export default function Sidebar() {
  const items = ["Player Performance", "Projections", "Favorites"];
  return (
    <aside className="w-56 bg-[#0d1530] border-r border-[#f0c14b]/30 p-4">
      <h1 className="text-xl font-bold mb-6 text-[#f0c14b]">NBA Dashboard</h1>
      <nav className="flex flex-col gap-4">
        {items.map((i) => (
          <a
            key={i}
            href={`/${i.toLowerCase().replace(" ", "")}`}
            className="text-sm hover:text-[#f0c14b] transition"
          >
            {i}
          </a>
        ))}
      </nav>
    </aside>
  );
}
