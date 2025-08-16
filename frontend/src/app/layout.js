import "./globals.css";
import ClientShell from "./clientShell";
export const metadata = {
  title: "BriefChain",
  description: "Chain and run workflows for open-source projects",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header
            className="text-white p-4 font-semibold"
            style={{
              background:
                "linear-gradient(to right, #3b82f6, #6366f1, #8b5cf6)",
            }}
          >
            Conduit
          </header>
          <main className="p-6 grow">
            <ClientShell>{children}</ClientShell>
          </main>
          {/* <footer className="flex justify-center">&copy; 2025 Conduit</footer> */}
        </div>
      </body>
    </html>
  );
}
