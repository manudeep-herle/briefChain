import { useDrop } from 'react-dnd';
import { Button } from "./Button";

// Individual connector on the canvas
function CanvasConnector({ connector, index, onRemove }) {
  return (
    <div 
      className="ui-card p-4 shadow-sm w-64"
      style={{
        position: 'absolute',
        left: connector.position.x,
        top: connector.position.y,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">{connector.name}</div>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => onRemove(connector.canvasId)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
        >
          ×
        </Button>
      </div>
      
      <div className="text-xs text-gray-600 mb-3">
        {connector.description}
      </div>
      
      <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
        Step {index + 1}: {connector.type}
      </div>
      
      {/* Connection point for next step */}
      {index > 0 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white" style={{backgroundColor: '#3b82f6'}}></div>
      )}
      
      {/* Connection point for previous step */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full border-2 border-white" style={{backgroundColor: '#3b82f6'}}></div>
    </div>
  );
}

// Main workflow canvas with drop functionality
function WorkflowCanvas({ connectors, onConnectorDrop, onRemoveConnector }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'connector',
    drop: (item) => {
      onConnectorDrop(item.connector);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1 bg-white p-6">
      <div 
        ref={drop}
        className={`h-full border-2 border-dashed border-ui rounded-lg relative ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        }`}
      >
        {connectors.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-xl mb-2">Start Building Your Workflow</div>
              <div className="text-sm">Drag connectors from the left panel to create your workflow</div>
            </div>
          </div>
        ) : (
          <>
            {/* Render connectors */}
            {connectors.map((connector, index) => (
              <CanvasConnector 
                key={connector.canvasId}
                connector={connector}
                index={index}
                onRemove={onRemoveConnector}
              />
            ))}
            
            {/* Render connecting lines between connectors */}
            {connectors.length > 1 && (
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {connectors.slice(1).map((connector, index) => {
                  const prevConnector = connectors[index];
                  const startX = prevConnector.position.x + 128; // Center of previous connector
                  const startY = prevConnector.position.y + 80; // Bottom of previous connector
                  const endX = connector.position.x + 128; // Center of current connector  
                  const endY = connector.position.y - 10; // Top of current connector
                  
                  return (
                    <line
                      key={`line-${index}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                
                {/* Arrow marker definition */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
              </svg>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { WorkflowCanvas };