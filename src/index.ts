// ------------ Importing Force Graph ------------------
// Importing the default bundle doesn't work for some reason!

// @ts-expect-error No typedef for the browser version
import __ForceGraph from "force-graph/dist/force-graph.min.js";

import type ForceGraphInterface from "force-graph";
const ForceGraph: typeof ForceGraphInterface = __ForceGraph as any;
// ------------ End Importing Force Graph ------------------

const graphElement = document.getElementById("graph")!;

const Graph = ForceGraph()(graphElement)
  .linkDirectionalParticles(2)
  .linkWidth(3)
  .linkColor(() => "green")
  .graphData({
    nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
    links: [
      { source: 1, target: 3 },
      { source: 2, target: 3 },
    ],
  });

export {};
