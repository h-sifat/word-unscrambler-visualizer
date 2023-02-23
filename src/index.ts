import { Trie } from "./scripts/trie";
import GraphComponent from "./scripts/graph";
import { searchTrie } from "./scripts/search";
import WordsInput from "./scripts/components/words-input";

const wordsInput = new WordsInput();
const graphComponent = new GraphComponent({
  element: document.getElementById("graph")!,
  link: { arrowLength: 6 },
});

let trie = makeTrie(wordsInput.currentWords);

wordsInput.onSubmit = (words) => {
  trie = makeTrie(words);
};

function makeTrie(words: string[]) {
  wordsInput.disable();
  const trie = new Trie();
  trie.insertWords(words);

  graphComponent.setData({
    links: Object.values(trie.allLinks),
    nodes: Object.values(trie.allNodes).map((node) => ({ ...node })),
  });

  wordsInput.enable();
  return trie;
}

async function main() {
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

// main();

export {};
