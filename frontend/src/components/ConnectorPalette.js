import { useDrag } from 'react-dnd';
import { Loader } from "./Loader";

// Individual draggable connector item
function DraggableConnector({ connector }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'connector',
    item: { connector },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getConnectorTypeColor = (type) => {
    const typeColors = {
      github: "bg-gray-100 text-gray-800",
      npm: "bg-red-100 text-red-800",
      openssf: "bg-green-100 text-green-800",
      ai: "bg-purple-100 text-purple-800",
      slack: "bg-blue-100 text-blue-800",
    };
    return typeColors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div 
      ref={drag}
      className={`p-3 bg-white rounded-lg border-ui hover:shadow-sm transition-shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{connector.name}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectorTypeColor(connector.type)}`}>
          {connector.type}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        {connector.description || "No description available"}
      </div>
    </div>
  );
}

// Connector palette component for the left sidebar
function ConnectorPalette({ connectors, loading, error }) {
  return (
    <div className="w-80 bg-gray-50 border-r border-ui p-4">
      <h3 className="text-lg font-semibold mb-4">Available Connectors</h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader variant="dots" text="Loading connectors..." />
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="space-y-2">
          {connectors.map((connector) => (
            <DraggableConnector key={connector.id} connector={connector} />
          ))}
        </div>
      )}
    </div>
  );
}

export { ConnectorPalette };