import { toggleAttributes } from "../util/html";

// --------- Selecting Elements ----------
const searchForm = document.getElementById("search-form") as HTMLFormElement;

const soundFxBtn = document.getElementById("sound-fx-btn") as HTMLButtonElement;
const searchBtn = document.getElementById("search-btn") as HTMLButtonElement;
const searchQueryInput = document.getElementById(
  "search-input"
) as HTMLInputElement;
const animationSpeedSlider = document.getElementById(
  "speed-slider"
) as HTMLInputElement;

const animationSpeedSliderLabel = document.getElementById(
  "speed-slider-label"
) as HTMLLabelElement;

const elementsToDisable = Object.freeze([
  soundFxBtn,
  searchQueryInput,
  animationSpeedSlider,
]);

// ------------- global constants ---------------
const MAX_SEARCH_QUERY_LENGTH = 25;
const DEFAULT_ANIMATION_SPEED = 300;

animationSpeedSlider.value = DEFAULT_ANIMATION_SPEED.toString();
setAnimationSpeedLabel(DEFAULT_ANIMATION_SPEED);

export interface SearchFormData {
  query: string;
  isSoundOn: boolean;
  animationSpeed: number;
}

export type OnStopSearch = () => void;
export type OnSearch = (arg: SearchFormData) => void;

export default class SearchForm {
  static #instance: SearchForm | null = null;

  #isSoundOn = true;
  #animationSpeed = DEFAULT_ANIMATION_SPEED;
  #query = "";

  #isFormDisabled = false;
  #isSearching = false;

  #onSearch: OnSearch = () => {};
  #onStopSearch: OnStopSearch = () => {};

  constructor() {
    if (SearchForm.#instance) return SearchForm.#instance;
    SearchForm.#instance = this;

    this.#setUpSliderEventHandlers();
    this.#setUpSoundBtnEventHandlers();
    this.#setUpQueryInputEventHandlers();
    this.#setUpSearchButtonEventHandlers();

    searchForm.addEventListener("submit", (e) => e.preventDefault());
  }

  #searchBtnEventHandler = (e: Event, isManualCall = false) => {
    if (!this.#query) return e.preventDefault();

    if (this.#isSearching) {
      this.#isSearching = false;
      this.enableForm();

      searchBtn.classList.remove("btn-danger");
      searchBtn.innerText = "Search";

      if (!isManualCall) this.#onStopSearch();
    } else {
      this.disableForm();
      this.#isSearching = true;

      searchBtn.classList.add("btn-danger");
      searchBtn.innerText = "Stop";

      this.#onSearch(this.formData);
    }
  };

  #setUpSearchButtonEventHandlers() {
    searchBtn.addEventListener("click", this.#searchBtnEventHandler);
  }

  #setUpQueryInputEventHandlers() {
    const inputHandler = (e: Event) => {
      if (this.#isFormDisabled) return e.preventDefault();

      const filteredQuery = filterQueryInput(searchQueryInput.value).substring(
        0,
        MAX_SEARCH_QUERY_LENGTH - 1
      );

      this.#query = filteredQuery;
      searchQueryInput.value = filteredQuery;

      if (filteredQuery.length) searchBtn.removeAttribute("disabled");
      else searchBtn.setAttribute("disabled", "true");
    };

    // set the initial state
    inputHandler({ preventDefault() {} } as any);

    searchQueryInput.addEventListener("input", inputHandler);
  }

  #setUpSoundBtnEventHandlers() {
    soundFxBtn.addEventListener("click", (e) => {
      // I don't know why hitting "enter" from the query input clicks
      // this button. I'm adding the next line just to prevent that.
      if (document.activeElement !== soundFxBtn || this.#isFormDisabled)
        return e.preventDefault();

      this.#isSoundOn = !this.#isSoundOn;

      if (this.#isSoundOn) {
        soundFxBtn.classList.remove("btn-danger");
        soundFxBtn.classList.add("btn-success");
      } else {
        soundFxBtn.classList.add("btn-danger");
        soundFxBtn.classList.remove("btn-success");
      }

      setSoundFxBtnLabel(this.#isSoundOn);
    });
  }

  #setUpSliderEventHandlers() {
    let isSliderClicked = false;
    animationSpeedSlider.addEventListener("mousedown", () => {
      isSliderClicked = true;
    });

    animationSpeedSlider.addEventListener("mouseup", () => {
      isSliderClicked = false;
    });

    const changeHandler = (e: Event) => {
      if (this.#isFormDisabled) return e.preventDefault();

      const speed = Number(animationSpeedSlider.value);
      if (!Number.isInteger(speed) || speed < 10 || speed > 1000) return;

      this.#animationSpeed = speed;
      setAnimationSpeedLabel(speed);
    };

    animationSpeedSlider.addEventListener("change", changeHandler);
    animationSpeedSlider.addEventListener("mousemove", (e) => {
      if (!isSliderClicked) return e.preventDefault();
      changeHandler(e);
    });
  }

  disableForm() {
    if (this.#isSearching || this.#isFormDisabled) return;

    toggleAttributes({ elements: elementsToDisable, attribute: "disabled" });
    this.#isFormDisabled = true;
  }

  enableForm() {
    if (this.#isSearching || !this.#isFormDisabled) return;

    toggleAttributes({ elements: elementsToDisable, attribute: "disabled" });
    this.#isFormDisabled = false;
  }

  set onSearch(onSearch: OnSearch) {
    this.#onSearch = onSearch;
  }

  set onStopSearch(onStopSearch: OnStopSearch) {
    this.#onStopSearch = onStopSearch;
  }

  get isSearching() {
    return this.#isSearching;
  }

  get formData(): SearchFormData {
    return {
      query: this.#query,
      isSoundOn: this.#isSoundOn,
      animationSpeed: this.#animationSpeed,
    };
  }

  stopSearching() {
    if (!this.#isSearching) return;
    this.#searchBtnEventHandler({ preventDefault() {} } as any, true);
  }
}

// Utility Functions
function setSoundFxBtnLabel(isOn: boolean) {
  soundFxBtn.innerText = `Sound-Fx: ${isOn ? "ON" : "OFF"}`;
}

function setAnimationSpeedLabel(value: number) {
  animationSpeedSliderLabel.innerText = `Loop interval: ${value}ms`;
}

function filterQueryInput(query: string) {
  return query
    .trim()
    .replace(/[^a-z]/gi, "")
    .toLowerCase();
}
