import { LinkInterface, Trie, TrieNodeInterface } from "./trie";

interface CharSet {
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

interface HighLightFunctions {
  highlightLink: HighlightLink;
  highlightNode: HighlightNode;
  highlightCursor: HighlightNode;
}

export async function searchTrie(
  arg: {
    trie: Trie;
    string: string;
    iterationIntervalMs: number;
  } & HighLightFunctions
): Promise<string[]> {
  const { highlightLink, highlightNode, iterationIntervalMs, highlightCursor } =
    arg;
  const suggestions = new Set<string>();

  await findSuggestions({
    suggestions,
    highlightLink,
    highlightCursor,
    highlightNode,
    parentNode: null,
    iterationIntervalMs,
    node: arg.trie.root,
    charSet: stringToCharSet(arg.string),
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
  } & HighLightFunctions
) {
  const {
    node,
    charSet,
    parentNode,
    suggestions,
    highlightLink,
    highlightNode,
    highlightCursor,
    iterationIntervalMs,
  } = arg;

  if (parentNode)
    highlightLink({
      match: true,
      link: { source: parentNode.id, target: node.id },
    });

  highlightNode({ id: node.id, match: true });

  if (node.isEndOfWord)
    suggestions.add(
      await concatenateCharsByTraversingUpward({
        node,
        highlightCursor,
        iterationIntervalMs,
      })
    );

  let charMatchCount = 0;
  await forEach({
    iterationIntervalMs,
    array: Object.keys(node.children),
    async callback(char) {
      if (!charSet[char]) return;
      charMatchCount++;

      const charSetForSubNodes = { ...charSet };
      charSetForSubNodes[char]--;

      await findSuggestions({
        suggestions,
        highlightLink,
        highlightNode,
        highlightCursor,
        parentNode: node,
        iterationIntervalMs,
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

function concatenateCharsByTraversingUpward(arg: {
  node: TrieNodeInterface | null;
  iterationIntervalMs: number;
  highlightCursor: HighlightNode;
}): Promise<string> {
  return new Promise<string>((resolve) => {
    const { iterationIntervalMs, highlightCursor } = arg;
    const { node: startNode } = arg;

    let currentNode = startNode;

    const charArray = new Array(currentNode?.level || 0);
    let charIndex = charArray.length - 1;

    const intervalId = setInterval(() => {
      if (!currentNode) {
        clearInterval(intervalId);
        resolve(charArray.join(""));

        if (startNode) highlightCursor({ id: startNode!.id, match: true });
        return;
      }

      highlightCursor({ id: currentNode.id, match: true });

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

        timeoutId = setTimeout(timeoutCallback, iterationIntervalMs);
      } else {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    setTimeout(timeoutCallback, iterationIntervalMs);
  });
}
