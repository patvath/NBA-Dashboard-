import type { AppProps } from "next/app";
import Sidebar from "../components/Sidebar";
import "../styles/theme.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-60 bg-[#0A0F24] min-h-screen text-white p-6">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
