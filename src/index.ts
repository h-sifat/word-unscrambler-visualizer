import { Trie } from "./scripts/trie";
import GraphComponent from "./scripts/graph";
import { HighLightFunctions, searchTrie } from "./scripts/search";
import WordsInput from "./scripts/components/words-input";
import SearchForm from "./scripts/components/search-form";
import Status from "./scripts/components/status";
import Results from "./scripts/components/results";

const foundWords = new Results();
const status = new Status();
const wordsInput = new WordsInput();
const searchFrom = new SearchForm();
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

function getBgColor(match = false) {
  return match ? "green" : "red";
}
const graphHighlightFunctions: HighLightFunctions = {
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
  updateStatus: (arg) => status.update(arg),
  onWordMatch: (word) => foundWords.push(word),
};

function clearGraphHighLights(graphComponent: GraphComponent) {
  graphComponent.cursor = null;
  graphComponent.linkStyles.clear();
  graphComponent.nodeStyles.clear();
}

searchFrom.onSearch = async ({ animationSpeed, isSoundOn, query }) => {
  clearGraphHighLights(graphComponent);
  foundWords.clear();

  const results = await searchTrie({
    trie,
    string: query,
    iterationIntervalMs: animationSpeed,
    ...graphHighlightFunctions,
  });

  searchFrom.stopSearching();
};

export {};
