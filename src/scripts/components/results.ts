const resultElement = document.getElementById("results") as HTMLDivElement;

export default class Results {
  static #instance: Results | null = null;

  #words: string[] = [];

  constructor() {
    if (Results.#instance) return Results.#instance;
    else Results.#instance = this;
  }

  push(word: string) {
    this.#words.push(word);
    this.#flush();
  }

  setWords(words: string[]) {
    this.#words = words;
    this.#flush();
  }

  clear() {
    this.#words = [];
    this.#flush();
  }

  #flush() {
    resultElement.innerText = this.#words.join(" ");
  }
}
