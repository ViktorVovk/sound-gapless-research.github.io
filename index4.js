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
  mediaElement = null;
  state = "stopped"; /// "playing", "paused", "stopped"
  destroyed = false;

  #audios = [];
  #audioSources = [];
  #activeIndex = 0;
  #offset = 0.25;
  #unlocked = false;

  static createHtmlAudio(url) {
    const htmlAudio = new Audio(url);
    htmlAudio.preload = "auto";
    return htmlAudio;
  }

  constructor(url) {
    this.#audiContext = new AudioContext();
    this.#audios = [
      SoundPlayer.createHtmlAudio(url),
      SoundPlayer.createHtmlAudio(url),
    ];

    this.#audios.forEach((audio, index) => {
      this.#audioSources[index] =
        this.#audiContext.createMediaElementSource(audio);
      this.#audioSources[index].connect(this.#audiContext.destination);
    });
  }

  #resumeAudioContext() {
    if (
      this.#audiContext.state === "suspended" ||
      this.#audiContext.state === "interrupted"
    ) {
      this.#audiContext.resume();
    }
  }

  #suspendAudioContext() {
    this.#audiContext.suspend();
  }

  async #unlockAudios() {
    if (this.#unlocked) return;
    for (const audio of this.#audios) {
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }
    this.#unlocked = true;
  }

  async playLoop() {
    this.#resumeAudioContext();
    await this.#unlockAudios();
    const activeAudio = this.#audios[this.#activeIndex];
    const nextAudio = this.#audios[1 - this.#activeIndex];
    activeAudio.muted = false;
    nextAudio.muted = true;
    await activeAudio.play();
    this.state = "playing";
    const duration = activeAudio.duration;
    const timeMs = (duration - this.#offset) * 1000;

    setTimeout(async () => {
      this.#activeIndex = 1 - this.#activeIndex;
      await this.playLoop();
    }, timeMs);
  }

  pause() {
    for (const audio of this.#audios) {
      audio.pause();
    }
    this.state = "paused";
    this.#suspendAudioContext();
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
