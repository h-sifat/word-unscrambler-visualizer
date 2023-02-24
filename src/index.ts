import { Trie } from "./scripts/trie";
import GraphComponent from "./scripts/graph";
import Status from "./scripts/components/status";
import Results from "./scripts/components/results";
import timerManager from "./scripts/util/timer-manager";
import SearchForm from "./scripts/components/search-form";
import WordsInput from "./scripts/components/words-input";
import { CommonFunctionsArgs, searchTrie } from "./scripts/search";

let shouldStopSearching = false;

const searchFrom = new SearchForm();
searchFrom.onStopSearch = () => {
  shouldStopSearching = true;
  // clear all javascript setTimeout and setInterval
  timerManager.clear();
};

const status = new Status();
const foundWords = new Results();
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

function getBgColor(match = false) {
  return match ? "green" : "red";
}
const graphHighlightFunctions: CommonFunctionsArgs = {
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
  shouldStopSearching: () => shouldStopSearching,
};

function clearGraphHighLights(graphComponent: GraphComponent) {
  graphComponent.cursor = null;
  graphComponent.linkStyles.clear();
  graphComponent.nodeStyles.clear();
}

searchFrom.onSearch = async ({ animationSpeed, query }) => {
  clearGraphHighLights(graphComponent);
  foundWords.clear();
  wordsInput.disable();
  shouldStopSearching = false;

  await searchTrie({
    trie,
    string: query,
    ...graphHighlightFunctions,
    iterationIntervalMs: animationSpeed,
  });

  searchFrom.stopSearching();
  wordsInput.enable();
};

export {};
