import debounce from "lodash/debounce";
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

export interface NodeStyle {
  bgColor?: string;
  textColor?: string;
}

export interface LinkStyle {
  width?: number;
  color?: string;
}

export default class GraphComponent {
  static #instances: Map<HTMLElement, GraphComponent> = new Map();

  // @ts-expect-error chill man!
  #forceGraph: ForceGraphInstance;

  cursor: NodeCursor | null = null;
  readonly #nodeStyles = new Map<number, NodeStyle>();
  readonly #linkStyles = new Map<string, LinkStyle>();

  constructor(arg: GraphComponent_Argument) {
    const { element } = arg;

    if (GraphComponent.#instances.has(element))
      return GraphComponent.#instances.get(element)!;

    let forceGraph = ForceGraphCustom()(element)
      .autoPauseRedraw(false)
      .width(element.clientWidth)
      .height(element.clientHeight)
      .nodeCanvasObject(this.#nodeRenderer as any)
      .linkWidth(
        ((link: LinkInterface) =>
          this.#linkStyles.get(link.id)?.width || 1) as any
      )
      .linkColor(
        ((link: LinkInterface) =>
          this.#linkStyles.get(link.id)?.color || "") as any
      );

    const { link } = arg;
    if ("arrowLength" in link)
      forceGraph = forceGraph.linkDirectionalArrowLength(link.arrowLength!);

    this.#forceGraph = forceGraph;

    const resizeGraph = debounce(() => {
      this.#forceGraph = this.#forceGraph
        .width(element.clientWidth)
        .height(element.clientHeight);
    }, 500);

    window.addEventListener("resize", () => {
      resizeGraph();
    });
  }

  #nodeRenderer = (
    node: NodeObject & PlaneTrieNodeObject_Interface,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const fontSize = 12 / globalScale;
    const isRootNode = Trie.isRootNode(node);
    const coordinate: CoordinateInterface = { x: node.x!, y: node.y! };

    const {
      bgColor = "black",
      textColor = node.isEndOfWord ? "white" : "black",
    } = this.#nodeStyles.get(node.id) || {};

    {
      let strokeWidth =
        fontSize /
        /* keeps the stroke width almost same in all zoom levels */ 12.3;
      let radius = (fontSize * /* arbitrary offset */ 1.2) / 2;

      // make the root node a little larger
      if (isRootNode) radius *= 1.5;

      const drawCircleArg: drawCircle_Argument = {
        ctx,
        radius,
        strokeWidth,
        center: coordinate,
      };

      if (node.isEndOfWord) drawCircleArg.fillColor = bgColor;
      else drawCircleArg.strokeColor = bgColor;

      drawCircle(drawCircleArg);

      // drawing the cursor
      if (this.cursor && node.id === this.cursor.nodeId) {
        drawCircleArg.radius *= 2;
        drawCircleArg.strokeWidth! *= 1.5;
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
      color: textColor,
      baseline: "middle",
      font: `${fontSize}px Monospace`,
      text: isRootNode ? "*" : node.char,
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

  get nodeStyles() {
    return this.#nodeStyles;
  }

  get linkStyles() {
    return this.#linkStyles;
  }
}
