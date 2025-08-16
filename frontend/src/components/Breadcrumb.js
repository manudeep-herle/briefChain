import Link from "next/link";

export function Breadcrumb({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center text-sm text-gray-500 mt-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-500">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to create common breadcrumb patterns
export function createWorkflowBreadcrumbs(workflowName = null) {
  const items = [
    { label: "Home", href: "/" },
    { label: "Workflows", href: "/workflows" },
  ];

  if (workflowName) {
    items.push({ label: workflowName });
  }

  return items;
}

export function createConnectorBreadcrumbs() {
  return [
    { label: "Home", href: "/" },
    { label: "Connectors", href: "/connectors" },
  ];
}
