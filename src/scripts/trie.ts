export interface TrieNode_Argument {
  id: number;
  char: string;
  level: number;
  isEndOfWord: boolean;
  parent?: TrieNode | null;
}

export type PlaneTrieNodeObject_Interface = Pick<
  TrieNode,
  "id" | "char" | "isEndOfWord" | "level"
>;

export type TrieNodeInterface = InstanceType<typeof TrieNode>;

class TrieNode {
  readonly id: number;
  readonly char: string;
  readonly level: number;
  readonly isEndOfWord: boolean;
  readonly parent: TrieNode | null;
  readonly children: { [char: string]: TrieNode | undefined };

  constructor({
    id,
    char,
    level,
    parent = null,
    isEndOfWord = false,
  }: TrieNode_Argument) {
    this.id = id;
    this.char = char;
    this.children = {};
    this.level = level;
    this.parent = parent;
    this.isEndOfWord = isEndOfWord;
  }

  hasChild(char: string) {
    return char in this.children;
  }

  addChild({
    id,
    char,
    isEndOfWord,
  }: Pick<TrieNode, "char" | "id" | "isEndOfWord">) {
    return (this.children[char] = new TrieNode({
      id,
      char,
      isEndOfWord,
      parent: this,
      level: this.level + 1,
    }));
  }

  getChild(char: string) {
    return this.children[char];
  }

  toPlainObject(): PlaneTrieNodeObject_Interface {
    return {
      id: this.id,
      char: this.char,
      level: this.level,
      isEndOfWord: this.isEndOfWord,
    };
  }
}

export type LinkInterface = {
  id: string;
  source: number;
  target: number;
};

export class Trie {
  static readonly ROOT_NODE_ID = 0;
  static readonly ROOT_NODE_CHAR = "";

  currentNodeId = Trie.ROOT_NODE_ID + 1;

  readonly root: TrieNode = new TrieNode({
    level: 0,
    isEndOfWord: false,
    id: Trie.ROOT_NODE_ID,
    char: Trie.ROOT_NODE_CHAR,
  });
  readonly allNodes: {
    [id: number | string]: PlaneTrieNodeObject_Interface;
  } = {
    [this.root.id]: Object.freeze(this.root.toPlainObject()),
  };
  readonly allLinks: { [id: number | string]: LinkInterface } = {};

  insert(word: string) {
    let currentNode: TrieNode = this.root;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      if (currentNode.hasChild(char)) {
        currentNode = currentNode.getChild(char)!;
      } else {
        const newNode = currentNode.addChild({
          char,
          id: ++this.currentNodeId,
          isEndOfWord: i === word.length - 1,
        });

        const link: Partial<LinkInterface> = {
          target: newNode.id,
          source: currentNode.id,
        };

        link.id = Trie.makeLinkId(link as LinkInterface);

        this.allNodes[newNode.id] = newNode.toPlainObject();
        this.allLinks[link.id] = link as LinkInterface;

        currentNode = newNode;
      }
    }
  }

  insertWords(words: string[]) {
    for (let word of words) this.insert(word);
  }

  static makeLinkId(link: Omit<LinkInterface, "id">) {
    return `${link.source}:${link.target}`;
  }

  static isRootNode(node: PlaneTrieNodeObject_Interface) {
    return node.id === Trie.ROOT_NODE_ID && node.char === Trie.ROOT_NODE_CHAR;
  }
}
