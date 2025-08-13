import Tabs from "@/components/Tabs";

export default function ClientShell({ children }) {
  const TABS = [
    { label: "Connectors", href: "/connectors" },
    { label: "Workflows", href: "/workflows" },
  ];

  return (
    <div>
      <Tabs TABS={TABS} />
      {children}
    </div>
  );
}
