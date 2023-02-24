import timerManager from "./util/timer-manager";
import { updateStatus_Arg } from "./components/status";
import { LinkInterface, Trie, TrieNodeInterface } from "./trie";

export interface CharSet {
  [char: string]: number;
}

export function stringToCharSet(string: string): CharSet {
  const charSet: CharSet = {};
  for (const char of string)
    if (char in charSet) charSet[char]++;
    else charSet[char] = 1;

  return charSet;
}

export type HighlightLink = (arg: {
  match: boolean;
  link: Pick<LinkInterface, "source" | "target">;
}) => void;

export type HighlightNode = (arg: { id: number; match: boolean }) => void;

export interface CommonFunctionsArgs {
  highlightLink: HighlightLink;
  highlightNode: HighlightNode;
  highlightCursor: HighlightNode;
  shouldStopSearching(): boolean;
  onWordMatch(word: string): void;
  updateStatus(arg: updateStatus_Arg): void;
}

export async function searchTrie(
  arg: {
    trie: Trie;
    string: string;
    iterationIntervalMs: number;
  } & CommonFunctionsArgs
): Promise<string[]> {
  const { trie, string: query, ...rest } = arg;
  const suggestions = new Set<string>();

  await findSuggestions({
    ...rest,
    suggestions,
    node: trie.root,
    parentNode: null,
    charSet: stringToCharSet(query),
  });

  arg.updateStatus({
    node: trie.root,
    availableChars: {},
    children: Object.keys(trie.root.children),
  });

  return [...suggestions];
}

async function findSuggestions(
  arg: {
    charSet: CharSet;
    node: TrieNodeInterface;
    suggestions: Set<string>;
    iterationIntervalMs: number;
    parentNode: TrieNodeInterface | null;
  } & CommonFunctionsArgs
) {
  const {
    node,
    charSet,
    parentNode,
    suggestions,
    updateStatus,
    highlightLink,
    highlightNode,
    highlightCursor,
    iterationIntervalMs,
    shouldStopSearching,
  } = arg;

  if (shouldStopSearching()) return;

  if (parentNode)
    highlightLink({
      match: true,
      link: { source: parentNode.id, target: node.id },
    });

  const childrenNodeChars = Object.keys(node.children);

  highlightNode({ id: node.id, match: true });

  if (node.isEndOfWord) {
    const word = await concatenateCharsByTraversingUpward({
      node,
      highlightCursor,
      iterationIntervalMs,
      shouldStopSearching,
      updateStatus: arg.updateStatus,
    });

    arg.onWordMatch(word);
    suggestions.add(word);
  }

  let charMatchCount = 0;
  await forEach({
    iterationIntervalMs,
    array: Object.keys(node.children),
    async callback(char) {
      if (shouldStopSearching()) return;

      updateStatus({
        node,
        availableChars: charSet,
        children: childrenNodeChars,
        currentlyMatchingChildChar: char,
      });

      if (!charSet[char]) return;

      charMatchCount++;

      const charSetForSubNodes = { ...charSet };
      charSetForSubNodes[char]--;

      await findSuggestions({
        ...arg,
        suggestions,
        parentNode: node,
        node: node.getChild(char)!,
        charSet: charSetForSubNodes,
      });

      highlightNode({ id: node.id, match: true });
    },
  });

  if (!charMatchCount && !node.isEndOfWord) {
    highlightNode({ id: node.id, match: false });

    if (parentNode)
      highlightLink({
        match: false,
        link: { source: parentNode.id, target: node.id },
      });
  }
}

function concatenateCharsByTraversingUpward(
  arg: {
    node: TrieNodeInterface | null;
    iterationIntervalMs: number;
    highlightCursor: HighlightNode;
  } & Pick<CommonFunctionsArgs, "updateStatus" | "shouldStopSearching">
): Promise<string> {
  return new Promise<string>((resolve) => {
    const {
      iterationIntervalMs,
      highlightCursor,
      updateStatus,
      shouldStopSearching,
    } = arg;
    const { node: startNode } = arg;

    let currentNode = startNode;

    const charArray = new Array(currentNode?.level || 0).fill("");
    let charIndex = charArray.length - 1;

    const intervalId = timerManager.setInterval(() => {
      if (shouldStopSearching()) return;
      if (!currentNode) {
        clearInterval(intervalId);
        resolve(charArray.join(""));

        if (startNode) {
          highlightCursor({ id: startNode!.id, match: true });
          updateStatus({
            node: startNode!,
            currentWord: charArray,
            children: Object.keys(startNode.children),
          });
        }
        return;
      }

      highlightCursor({ id: currentNode.id, match: true });
      updateStatus({
        node: currentNode,
        currentWord: charArray,
        children: Object.keys(currentNode.children),
      });

      charArray[charIndex--] = currentNode.char;
      currentNode = currentNode.parent;
    }, iterationIntervalMs);
  });
}

export function forEach<T>(arg: {
  array: T[];
  iterationIntervalMs: number;
  callback: (element: T, index: number, array: T[]) => void | Promise<void>;
}) {
  const { array, iterationIntervalMs, callback } = arg;
  return new Promise<void>((resolve) => {
    let index = 0;

    let timeoutId: any;

    const timeoutCallback = async () => {
      if (index < array.length) {
        await callback(array[index], index, array);
        index++;

        timeoutId = timerManager.setTimeout(
          timeoutCallback,
          iterationIntervalMs
        );
      } else {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    timerManager.setTimeout(timeoutCallback, iterationIntervalMs);
  });
}
