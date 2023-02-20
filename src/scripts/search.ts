import { Trie, TrieNodeInterface } from "./trie";

interface CharSet {
  [char: string]: number;
}

function stringToCharSet(string: string): CharSet {
  const charSet: CharSet = {};
  for (const char of string)
    if (char in charSet) charSet[char]++;
    else charSet[char] = 1;

  return charSet;
}

function search(arg: { string: string; trie: Trie }): string[] {
  const suggestions = new Set<string>();

  findSuggestions({
    suggestions,
    node: arg.trie.root,
    charSet: stringToCharSet(arg.string),
  });

  return [...suggestions];
}

function findSuggestions(arg: {
  charSet: CharSet;
  node: TrieNodeInterface;
  suggestions: Set<string>;
}) {
  const { node, charSet, suggestions } = arg;

  if (node.isEndOfWord)
    suggestions.add(concatenateCharsByTraversingUpward(node));

  for (const [char, count] of Object.entries(charSet))
    if (count > 0 && node.hasChild(char)) {
      charSet[char]--;
      findSuggestions({
        suggestions,
        charSet: { ...charSet },
        node: node.getChild(char)!,
      });
    }
}

function concatenateCharsByTraversingUpward(
  node: TrieNodeInterface | null
): string {
  const charArray = new Array(node?.level || 0);
  let charIndex = charArray.length - 1;

  while (node) {
    charArray[charIndex--] = node.char;
    node = node.parent;
  }

  return charArray.join("");
}
