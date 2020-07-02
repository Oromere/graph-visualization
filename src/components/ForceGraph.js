import React, { useState } from "react";
import { runForceGraph } from "./forceGraphGenerator";
import styles from "./forceGraph.module.css";

export default function ForceGraph({ linksData, nodesData, selected }) {
  const containerRef = React.useRef(null);

  const [onSelectionChange, setHandler] = useState(null);

  React.useEffect(() => {
    let destroyFunction;

    if (containerRef.current) {
      const { destroy, onSelectionChange } = runForceGraph(
        containerRef.current,
        linksData,
        nodesData,
        selected
      );
      destroyFunction = destroy;
      setHandler(onSelectionChange);
    }

    return destroyFunction;
  }, []);

  React.useEffect(() => {
    if (onSelectionChange !== null) {
      const selection = selected || [];
      onSelectionChange(selection);
    }
  }, [selected]);

  return <div ref={containerRef} className={styles.container} />;
}
