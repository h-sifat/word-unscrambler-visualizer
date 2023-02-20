import { Trie } from "./scripts/trie";
import GraphComponent from "./scripts/graph";

const graphElement = document.getElementById("graph")!;

const words = [
  "cat",
  "cattle",
  "catling",
  "car",
  "cargo",
  "bat",
  "battle",
  "bad",
  "dog",
  "donna",
  "dogs",
  "donkey",
  "duckling",
  "duck",
  "book",
  "bottle",
  "boy",
  "body",
  "box",
  "boxer",
];

const graphComponent = new GraphComponent({
  element: graphElement,
  link: { arrowLength: 6 },
});

const trie = new Trie();

trie.insertWords(words);

graphComponent.setData({
  links: Object.values(trie.allLinks),
  nodes: Object.values(trie.allNodes).map((node) => ({ ...node })),
});

export {};
