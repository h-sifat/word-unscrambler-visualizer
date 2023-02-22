import { Trie } from "./scripts/trie";
import GraphComponent from "./scripts/graph";
import { searchTrie } from "./scripts/search";

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
  "bottle",
  "book",
  "boy",
  "body",
  "box",
  "boxer",
];

async function main() {
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

  function getBgColor(match = false) {
    return match ? "green" : "red";
  }

  const results = await searchTrie({
    trie,
    string: "cartgobadtkoysnna",
    highlightLink({ link, match }) {
      const linkId = Trie.makeLinkId(link);
      graphComponent.linkStyles.set(linkId, {
        width: 1,
        color: getBgColor(match),
      });
    },
    highlightNode({ id, match }) {
      graphComponent.nodeStyles.set(id, { bgColor: getBgColor(match) });
      graphComponent.cursor = { nodeId: id, color: "black", dashed: true };
    },
    highlightCursor({ id, match }) {
      graphComponent.cursor = {
        nodeId: id,
        color: getBgColor(match),
        dashed: false,
      };
    },
    iterationIntervalMs: 500,
  });
  console.log(results);
}

main();

export {};
