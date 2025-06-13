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
  mediaElement = null;
  state = "stopped"; /// "playing", "paused", "stopped"
  destroyed = false;
  #activeIndex = 0;
  #sounds = Array(2);
  #offset = 0.25;
  #unlocked = false;
  constructor(url) {
    this.#sounds[0] = SoundPlayer.createInstance(url);
    this.#sounds[1] = SoundPlayer.createInstance(url);
  }

  static createInstance(url) {
    const htmlAudio = new Audio(url);
    htmlAudio.preload = "auto";
    return htmlAudio;
  }

  async unlock() {
    if (this.#unlocked) return;
    for (const sound of this.#sounds) {
      sound.muted = true;
      await sound.play();
      sound.pause();
      sound.currentTime = 0;
      sound.muted = false;
    }
    this.#unlocked = true;
  }

  async playLoop() {
    this.state = "playing";
    await this.unlock();
    const currentSound = this.#sounds[this.#activeIndex];
    await currentSound.play();
    const nextSound = this.#sounds[1 - this.#activeIndex];

    const timer = (currentSound.duration - this.#offset) * 1000;

    setTimeout(async () => {
      this.#activeIndex = 1 - this.#activeIndex;
      currentSound.muted = true;
      nextSound.muted = false;
      this.playLoop();
    }, timer);
  }

  pause() {
    this.#sounds.forEach((s) => s.pause());
    this.state = "paused";
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
