import { ForceGraphCustom } from "./scripts/graph";
import { Trie } from "./scripts/trie";

const graphElement = document.getElementById("graph")!;

const trie = new Trie();
trie.insertWords(["cat", "cart", "cart"]);

const Graph = ForceGraphCustom()(graphElement).graphData({
  nodes: Object.values(trie.allNodes).map((node) => ({ ...node })),
  links: Object.values(trie.allLinks),
});

export {};
