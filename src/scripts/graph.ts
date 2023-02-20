import { ForceGraphCustom, getLayout } from "./util/graph";
import { drawCircle, drawCircle_Argument, drawText } from "./util/canvas";

import type { CoordinateInterface } from "./interface";
import type { ForceGraphInstance, NodeObject } from "force-graph";
import type { LinkInterface, PlaneTrieNodeObject_Interface } from "./trie";

export interface GraphComponent_Argument {
  element: HTMLElement;
  link: { arrowLength?: number };
}

export default class GraphComponent {
  static #instances: Map<HTMLElement, GraphComponent> = new Map();

  // @ts-expect-error chill man!
  #forceGraph: ForceGraphInstance;

  constructor(arg: GraphComponent_Argument) {
    const { element } = arg;

    if (GraphComponent.#instances.has(element))
      return GraphComponent.#instances.get(element)!;

    let forceGraph = ForceGraphCustom()(element).nodeCanvasObject(
      this.#nodeRenderer as any
    );

    const { link } = arg;
    if ("arrowLength" in link)
      forceGraph = forceGraph.linkDirectionalArrowLength(link.arrowLength!);

    this.#forceGraph = forceGraph;
  }

  #nodeRenderer = (
    node: NodeObject & PlaneTrieNodeObject_Interface,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const fontSize = 12 / globalScale;
    const coordinate: CoordinateInterface = { x: node.x!, y: node.y! };

    {
      const drawCircleArg: drawCircle_Argument = {
        ctx,
        center: coordinate,
        strokeWidth: fontSize / 12.3,
        radius: (fontSize * /* arbitrary offset */ 1.2) / 2,
      };

      if (node.isEndOfWord) drawCircleArg.fillColor = "black";
      else drawCircleArg.strokeColor = "black";

      drawCircle(drawCircleArg);
    }

    drawText({
      ctx,
      coordinate,
      align: "center",
      baseline: "middle",
      text: node.char || "*",
      font: `${fontSize}px Monospace`,
      color: node.isEndOfWord ? "white" : "black",
    });
  };

  setData(graphData: {
    nodes: PlaneTrieNodeObject_Interface[];
    links: LinkInterface[];
  }) {
    const nodeDiameter = this.#forceGraph.nodeRelSize();
    const layoutData = getLayout({
      graphData,
      dagreGraphConfig: {
        nodesep: 0,
        edgesep: 1,

        // root nodes aligned on top
        rankDir: "TB",
        linkSource: "target",
        linkTarget: "source",
        ranker: "longest-path",

        nodeWidth: nodeDiameter,
        nodeHeight: nodeDiameter,
      },
    });

    this.#forceGraph.graphData(layoutData as any);
  }
}
