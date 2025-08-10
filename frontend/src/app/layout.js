import Tabs from "@/components/Tabs";
import "./globals.css";

export const metadata = {
  title: "BriefChain",
  description: "Chain and run workflows for open-source projects",
};

export default function RootLayout({ children }) {
  const TABS = [
    { label: "Connectors", href: "/connectors" },
    { label: "Workflows", href: "/workflows" },
  ];

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gray-900 text-white p-4"> BriefChain</header>
          <main className="p-6 grow">
            <Tabs TABS={TABS} />
            {children}
          </main>
          <footer className="flex justify-center">
            &copy; 2025 BriefChain
          </footer>
        </div>
      </body>
    </html>
  );
}
