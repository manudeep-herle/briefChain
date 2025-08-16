import Tabs from "@/components/Tabs";

export default function ClientShell({ children }) {
  const TABS = [
    { label: "Workflows", href: "/workflows" },
    { label: "Connectors", href: "/connectors" },
  ];

  return (
    <div>
      <Tabs TABS={TABS} />
      {children}
    </div>
  );
}
