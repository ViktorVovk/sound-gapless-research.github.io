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
  #audiContext = null;
  #audioSource = null;
  mediaElement = null;
  state = "stopped"; /// "playing", "paused", "stopped"
  destroyed = false;
  constructor(url, withCreateMediaElementSource) {
    this.withCreateMediaElementSource = withCreateMediaElementSource;
    const htmlAudio = new Audio(url);
    htmlAudio.preload = "auto";
    this.mediaElement = htmlAudio;

    if (withCreateMediaElementSource) {
      this.#audiContext = new AudioContext();
      this.#audioSource = this.#audiContext.createMediaElementSource(htmlAudio);
      this.#audioSource.connect(this.#audiContext.destination);
    }
  }

  async play() {
    if (this.withCreateMediaElementSource) {
      if (
        this.#audiContext.state === "suspended" ||
        this.#audiContext.state === "interrupted"
      ) {
        this.#audiContext.resume();
      }
    }

    await this.mediaElement.play();
    this.state = "playing";
  }

  playLoop() {
    this.mediaElement.loop = true;
    return this.play();
  }

  pause() {
    this.mediaElement.pause();
    this.state = "paused";

    if (this.withCreateMediaElementSource) {
      this.#audiContext.suspend();
    }
  }

  async destroy() {
    this.pause();
    if (this.withCreateMediaElementSource) {
      this.#audioSource.disconnect();
      await this.#audiContext.close();
    }

    this.mediaElement = null;
    this.#audioSource = null;
    this.#audiContext = null;
    this.destroyed = true;
    this.state = "stopped";
  }
}

button.addEventListener("click", async function () {
  if (!audioA || audioA.destroyed) {
    audioA = new SoundPlayer(audioSourceURL, true);
  }
  if (audioA.state === "paused" || audioA.state === "stopped") {
    await audioA.playLoop();
    this.innerText = "Pause";
  } else if (audioA.state === "playing") {
    audioA.pause();
    this.innerText = "Play";
  }
});
