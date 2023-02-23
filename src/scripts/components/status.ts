import type { CharSet } from "../search";
import type { PlaneTrieNodeObject_Interface } from "../trie";

const currentNodeElement = document.getElementById(
  "current-node"
) as HTMLDivElement;
const currentWordElement = document.getElementById(
  "current-word"
) as HTMLDivElement;
const availableCharsElement = document.getElementById(
  "available-chars"
) as HTMLSpanElement;

export interface updateStatus_Arg {
  children: Readonly<string[]>;
  currentWord?: Readonly<string[]>;
  availableChars?: Readonly<CharSet>;
  currentlyMatchingChildChar?: string;
  node: Readonly<Omit<PlaneTrieNodeObject_Interface, "id">>;
}

export default class Status {
  static #instance: Status | null = null;
  constructor() {
    if (Status.#instance) return Status.#instance;
    else Status.#instance = this;
  }

  update(arg: updateStatus_Arg) {
    const {
      node,
      children = [],
      availableChars,
      currentlyMatchingChildChar = "",
    } = arg;

    {
      let nodeHtml = `char: ${node.char || "*"}, level: ${node.level}`;

      nodeHtml +=
        ", children: " +
        children
          .map(
            (char) =>
              `<span class="child-node ${
                char === currentlyMatchingChildChar ? "match" : ""
              }">${char}</span>`
          )
          .join("");

      currentNodeElement.innerHTML = nodeHtml;
    }

    if (availableChars) {
      const charsHtml = Object.entries(availableChars)
        .filter(([_, count]) => count)
        .map(([char, count]) => {
          let str = count > 1 ? `${char}:${count}` : char;

          if (char === currentlyMatchingChildChar)
            str = `<span class="match">${str}</span>`;

          return str;
        })
        .join(" ");

      availableCharsElement.innerHTML = charsHtml || "...";
    }

    {
      const { currentWord } = arg;
      const formattedWord = currentWord
        ? currentWord.map((ch) => (ch ? ch : "_")).join("")
        : "...";
      currentWordElement.innerText = formattedWord;
    }
  }
}
