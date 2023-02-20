// ------------ Importing Force Graph ------------------
// Importing the default bundle doesn't work for some reason!

// @ts-expect-error No typedef for the browser version
import __ForceGraph from "force-graph/dist/force-graph.min.js";

import type ForceGraphInterface from "force-graph";
export const ForceGraphCustom: typeof ForceGraphInterface = __ForceGraph as any;
// ------------ End Importing Force Graph ------------------

import dagre from "dagre";
import accessorFn from "accessor-fn";

import type { GraphData } from "force-graph";

export interface getLayout_Argument {
  graphData: GraphData;
  dagreGraphConfig: any;
}

/*
 * @CREDIT This function is copied from one of the examples of the
 * "force-graph" repository.
 * */
export function getLayout(arg: getLayout_Argument) {
  const { nodes, links } = arg.graphData;
  const { nodeWidth = 0, nodeHeight = 0, ...graphCfg } = arg.dagreGraphConfig;

  const getNodeWidth = accessorFn(nodeWidth);
  const getNodeHeight = accessorFn(nodeHeight);

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    ...graphCfg,
  });

  nodes.forEach((node) =>
    g.setNode(
      String(node.id),
      Object.assign({}, node, {
        width: getNodeWidth(node),
        height: getNodeHeight(node),
      })
    )
  );

  links.forEach((link) =>
    g.setEdge(
      String(link.source)!,
      String(link.target),
      Object.assign({}, link)
    )
  );

  dagre.layout(g);

  return {
    nodes: g.nodes().map((n) => {
      const node = g.node(n);
      // @ts-ignore
      delete node.width;
      // @ts-ignore
      delete node.height;
      return node;
    }),
    links: g.edges().map((e) => g.edge(e)),
  };
}
