import React, { useState } from "react";
import ForceGraph from "./components/ForceGraph.js";
import Select from 'react-select'
import data from "./assets/data.json";
import "./App.css";

function App() {
  const [selected, setSelected] = useState([]);

  const selectOptions = () => {
    return data.nodes.map((node) => ({ label: node.name, value: node.id }));
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Bible Graph</div>
        <Select
          isMulti
          options={selectOptions()}
          value={selected}
          onChange={setSelected}
          className="multi-select"
          classNamePrefix="select"
        />
      </header>
      <section className="Main">
        <ForceGraph
          linksData={data.links}
          nodesData={data.nodes}
          selected={selected}
        />
      </section>
    </div>
  );
}

export default App;
