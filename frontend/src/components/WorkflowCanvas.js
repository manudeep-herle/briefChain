import { useDrop } from 'react-dnd';
import { Button } from "./Button";
import Xarrow from 'react-xarrows';

// Individual connector on the canvas
function CanvasConnector({ connector, index, onRemove }) {
  const style = connector.position.x === 'center' ? {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: connector.position.y,
  } : {
    position: 'absolute',
    left: connector.position.x,
    top: connector.position.y,
  };

  return (
    <div 
      id={connector.canvasId}
      className="ui-card p-4 shadow-sm w-64"
      style={style}
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
  }), [onConnectorDrop]);

  return (
    <div className="flex-1 bg-white p-6 overflow-auto">
      <div 
        ref={drop}
        className={`min-h-full border-2 border-dashed border-ui rounded-lg relative ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        }`}
        style={{
          minHeight: connectors.length > 0 ? `${Math.max(600, 80 + connectors.length * 200 + 100)}px` : '100%'
        }}
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
            
            {/* Render connecting arrows between connectors using react-xarrows */}
            {connectors.length > 1 && connectors.slice(1).map((connector, index) => (
              <Xarrow
                key={`arrow-${index}`}
                start={connectors[index].canvasId}
                end={connector.canvasId}
                color="#3b82f6"
                strokeWidth={3}
                headSize={8}
                showHead={true}
                path="straight"
                startAnchor="bottom"
                endAnchor="top"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export { WorkflowCanvas };