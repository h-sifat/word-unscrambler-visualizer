type TimerCallback = (...arg: any[]) => any | Promise<any>;

class TimerManager {
  readonly #timers = Object.freeze({
    timeout: new Set<number>(),
    interval: new Set<number>(),
  });

  setTimeout(callback: TimerCallback, time: number): number {
    const id = setTimeout(callback, time);
    this.#timers.timeout.add(id);
    return id;
  }

  clearTimeout(id: number) {
    if (this.#timers.timeout.has(id)) {
      this.#timers.timeout.delete(id);
      clearTimeout(id);
    }
  }

  setInterval(callback: TimerCallback, time: number): number {
    const id = setInterval(callback, time);
    this.#timers.interval.add(id);
    return id;
  }

  clearInterval(id: number) {
    if (this.#timers.interval.has(id)) {
      this.#timers.interval.delete(id);
      clearInterval(id);
    }
  }

  clearAllIntervals() {
    this.#timers.interval.forEach(clearInterval);
  }

  clearAllTimeouts() {
    this.#timers.timeout.forEach(clearInterval);
  }

  clear() {
    this.#timers.timeout.forEach(clearInterval);
    this.#timers.interval.forEach(clearInterval);
  }
}

const timerManager = new TimerManager();
export default timerManager;
