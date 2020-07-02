import * as d3 from "d3";

export function runForceGraph(container, linksData, nodesData) {
  const links = linksData.map((d) => Object.assign({}, d));
  const nodes = nodesData.map((d) => Object.assign({}, d));
  const width = 1800;
  const height = 1200;

  /* HELPER */
  const calcRadius = (id) => {
    // get all links that the given node is part of
    const connections = links.filter(
      (link) => link.target.id === id || link.source.id === id
    );
    if (connections.length > 0) {
      return 10 + connections.length * 2;
    } else {
      return 12;
    }
  };

  /* filters all direct neighbors of given node */
  const getNeighbors = (node) => {
    return links.reduce(
      (neighbors, link) => {
        // check if node is part of link
        if (link.target.id === node.id) {
          neighbors.push(link.source.id);
        } else if (link.source.id === node.id) {
          neighbors.push(link.target.id);
        }
        return neighbors;
      },
      [node.id]
    );
  };

  const getNodeColor = (node, neighbors) => {
    if (neighbors.includes(node.id)) {
      return "#ff6d00";
    }
    return "#fff";
  };

  /* click handler for nodes to highlight direct neighbors */
  const select = (selectedNode) => {
    let neighbors = [];
    if (selectedNode.active) {
      // deselect
      selectedNode.active = false;
    } else {
      neighbors = getNeighbors(selectedNode);
      selectedNode.active = true;
    }
    // set stroke of all nodes
    node.attr("stroke", (node) => getNodeColor(node, neighbors));
  };

  const updateOnSelect = (selectedNodes) => {
    node.attr("fill", d => color(d, selectedNodes))
  }

  /* test if given node is in selectedNodes */
  const isSelected = (nodeId, selectedNodes) => {
    return (selectedNodes.findIndex((node) => node.value === nodeId) !== -1);
  };

  const color = (node, selectedNodes) => {
    if (isSelected(node.id, selectedNodes)) {
      return "#18ffff";
    } else {
      return "grey";
    }
  };

  const drag = (simulation) => {
    const dragStarted = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragEnded = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    return d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  };

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  const zoomWrapper = svg.append("g");
  const zoom = d3.zoom().on("zoom", () => {
    zoomWrapper.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  const link = zoomWrapper
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => d.weight);

  const node = zoomWrapper
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => calcRadius(d.id))
    .attr("fill", "grey")
    .style("cursor", "pointer")
    .on("click", select)
    .call(drag(simulation));

  const label = zoomWrapper
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("cursor", "pointer")
    .text((d) => {
      return d.name;
    })
    .on("click", select)
    .call(drag(simulation));

  simulation.on("tick", () => {
    //update link positions
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    // update node positions
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    // update label positions
    label
      .attr("x", (d) => {
        return d.x;
      })
      .attr("y", (d) => {
        return d.y;
      });
  });

  return {
    destroy: () => {
      simulation.stop();
    },
    nodes: () => {
      return svg.node();
    },
    onSelectionChange: () => {
        return (selectedNodes) => updateOnSelect(selectedNodes)
    }
  };
}
