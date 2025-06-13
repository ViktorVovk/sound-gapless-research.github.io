let audioSourceURL = "./output.webm";
const button = document.getElementById("playButton");
const fileInput = document.getElementById("loadFileInput");

fileInput.addEventListener("change", () => {
  const file = event.target.files[0];
  if (!file) return;

  audioSourceURL = URL.createObjectURL(file);
});

let audioA = null;

class SoundPlayer {
  #audioContext;
  #buffer = null;
  #loadPromise;
  #source = null;
  #startTime = 0;
  #pauseOffset = 0;
  #isLoop = false;

  state = "stopped"; // "playing" | "paused" | "stopped"
  destroyed = false;

  constructor(url) {
    this.#audioContext = new AudioContext();
    this.#loadPromise = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => this.#audioContext.decodeAudioData(data))
      .then((decoded) => {
        this.#buffer = decoded;
      })
      .catch((err) => console.error("Error of loading audio:", err));
  }

  async #createSource(loop) {
    await this.#loadPromise;
    const src = this.#audioContext.createBufferSource();
    src.buffer = this.#buffer;
    src.loop = loop;
    src.connect(this.#audioContext.destination);
    if (!loop) {
      src.onended = () => {
        this.state = "stopped";
      };
    }
    return src;
  }

  async play(loop = false) {
    await this.#loadPromise;
    if (!this.#buffer) {
      console.warn("Audio Buffer is not loaded");
      return;
    }

    if (this.state === "playing" && this.#isLoop === loop) return;

    if (this.#source) {
      try {
        this.#source.stop();
      } catch {}
    }

    this.#isLoop = loop;

    if (this.#audioContext.state === "suspended") {
      await this.#audioContext.resume();
    }

    this.#pauseOffset = 0;
    this.#source = await this.#createSource(loop);
    this.#startTime = this.#audioContext.currentTime;
    this.#source.start(0, this.#pauseOffset);

    this.state = "playing";
  }

  playOnce() {
    return this.play(false);
  }
  playLoop() {
    return this.play(true);
  }

  pause() {
    if (this.state !== "playing" || !this.#source) return;
    this.#source.stop();
    this.#pauseOffset = this.#audioContext.currentTime - this.#startTime;
    this.state = "paused";
  }

  async resume() {
    if (this.state !== "paused") return;

    if (this.#audioContext.state === "suspended") {
      await this.#audioContext.resume();
    }

    this.#source = await this.#createSource(this.#isLoop);
    this.#startTime = this.#audioContext.currentTime - this.#pauseOffset;
    this.#source.start(0, this.#pauseOffset);

    this.state = "playing";
  }
}

button.addEventListener("click", async function () {
  if (!audioA || audioA.destroyed) {
    audioA = new SoundPlayer(audioSourceURL);
  }
  if (audioA.state === "paused" || audioA.state === "stopped") {
    await audioA.playLoop();
    this.innerText = "Pause";
  } else if (audioA.state === "playing") {
    audioA.pause();
    this.innerText = "Play";
  }
});
