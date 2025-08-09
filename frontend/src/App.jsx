import {useState} from 'react';
import axios from "axios";

const blocks = [
  { id: "github_issues", label: "GitHub Issues" },
  { id: "ai_summarize", label: "AI Summarize" }
];


export default function App(){
 const [workflow, setWorkflow] = useState([]);
  
  const addBlock = (id) => {
    setWorkflow([...workflow, { type: id, params: {} }]);
  };

  const runWorkflow = async () => {
    const res = await axios.post("http://localhost:4000/run", { workflow });
    console.log(res.data);
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div>
        <h3>Blocks</h3>
        {blocks.map(b => (
          <button key={b.id} onClick={() => addBlock(b.id)}>
            {b.label}
          </button>
        ))}
      </div>
      <div>
        <h3>Workflow</h3>
        <ol>
          {workflow.map((step, i) => (
            <li key={i}>{step.type}</li>
          ))}
        </ol>
        <button onClick={runWorkflow}>Run</button>
      </div>
    </div>
  );
}}