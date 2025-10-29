"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Sidebar() {
  const router = useRouter();

  const links = [
    { name: "🏠 Home", href: "/" },
    { name: "📊 Player Performance", href: "/player-performance" },
    { name: "⭐ Favorites", href: "/favorites" },
  ];

  return (
    <motion.aside
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 h-full w-60 bg-[#0D1228] border-r border-gold-500 p-5 text-gray-200"
    >
      <h1 className="text-2xl font-bold text-gold-400 mb-6">🏀 NBA Dashboard</h1>

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block p-2 rounded-md transition ${
                router.pathname === link.href
                  ? "bg-gold-500 text-black font-semibold"
                  : "hover:bg-gold-400/20"
              }`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
