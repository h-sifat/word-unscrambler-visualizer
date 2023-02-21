import { ForceGraphCustom, getLayout } from "./util/graph";
import { drawCircle, drawCircle_Argument, drawText } from "./util/canvas";

import type { CoordinateInterface } from "./interface";
import type { ForceGraphInstance, NodeObject } from "force-graph";
import { LinkInterface, PlaneTrieNodeObject_Interface, Trie } from "./trie";

export interface GraphComponent_Argument {
  element: HTMLElement;
  link: { arrowLength?: number };
}

export interface NodeCursor {
  color?: string;
  nodeId: number;
  dashed?: boolean;
}

export default class GraphComponent {
  static #instances: Map<HTMLElement, GraphComponent> = new Map();

  // @ts-expect-error chill man!
  #forceGraph: ForceGraphInstance;

  cursor: NodeCursor | null = { nodeId: 3, dashed: true };

  constructor(arg: GraphComponent_Argument) {
    const { element } = arg;

    if (GraphComponent.#instances.has(element))
      return GraphComponent.#instances.get(element)!;

    let forceGraph = ForceGraphCustom()(element)
      .autoPauseRedraw(false)
      .nodeCanvasObject(this.#nodeRenderer as any);

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

    const isRootNode = Trie.isRootNode(node);

    {
      let strokeWidth =
        fontSize /
        /* keeps the stroke width almost same in all zoom levels */ 12.3;
      let radius = (fontSize * /* arbitrary offset */ 1.2) / 2;
      if (isRootNode) radius *= 1.5;

      const drawCircleArg: drawCircle_Argument = {
        ctx,
        radius,
        strokeWidth,
        center: coordinate,
      };

      if (node.isEndOfWord) drawCircleArg.fillColor = "black";
      else drawCircleArg.strokeColor = "black";

      drawCircle(drawCircleArg);

      // drawing the cursor
      if (this.cursor && node.id === this.cursor.nodeId) {
        drawCircleArg.radius *= 1.7;
        drawCircleArg.strokeWidth! *= 4;
        drawCircleArg.fillColor = undefined;
        drawCircleArg.dashedStroke = this.cursor.dashed;
        drawCircleArg.strokeColor = this.cursor.color || "black";

        drawCircle(drawCircleArg);
      }
    }

    drawText({
      ctx,
      coordinate,
      align: "center",
      baseline: "middle",
      font: `${fontSize}px Monospace`,
      text: isRootNode ? "*" : node.char,
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
