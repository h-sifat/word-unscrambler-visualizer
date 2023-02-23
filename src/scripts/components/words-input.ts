const wordsTextAreaInput = document.getElementById(
  "words-input"
) as HTMLTextAreaElement;

const wordsInputForm = document.getElementById("words-form") as HTMLFormElement;

const submitBtn = document.getElementById(
  "words-input-btn"
) as HTMLButtonElement;

const MAX_ALLOWED_WORD_LENGTH = 25;
function getWordsFromInput(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/gi, "")
    .split(/\s+/g)
    .filter((w) => w.length <= MAX_ALLOWED_WORD_LENGTH);
}

export type OnWordsSubmit = (words: string[]) => void;

export default class WordsInput {
  static #instance: WordsInput | null = null;
  #isDisabled = false;

  #onSubmit: OnWordsSubmit = () => {};

  constructor() {
    if (WordsInput.#instance) return WordsInput.#instance;
    WordsInput.#instance = this;

    wordsInputForm.addEventListener("submit", this.#handleSubmit);
    wordsTextAreaInput.value = "";
  }

  #handleSubmit = (e: any) => {
    if (this.#isDisabled) return;

    e?.preventDefault();
    this.#onSubmit(this.#getCurrentWords());
  };

  #getCurrentWords() {
    const words = getWordsFromInput(wordsTextAreaInput.value);
    wordsTextAreaInput.value = words.join(" ");

    return words;
  }

  disable() {
    if (this.#isDisabled) return;

    wordsTextAreaInput.toggleAttribute("disabled");
    submitBtn.toggleAttribute("disabled");

    this.#isDisabled = true;
  }

  enable() {
    if (!this.#isDisabled) return;

    wordsTextAreaInput.toggleAttribute("disabled");
    submitBtn.toggleAttribute("disabled");

    this.#isDisabled = false;
  }

  isDisabled() {
    return this.#isDisabled;
  }

  set onSubmit(f: OnWordsSubmit) {
    this.#onSubmit = f;
  }

  get currentWords() {
    return this.#getCurrentWords();
  }
}
