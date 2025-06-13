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
  constructor(url) {
    const htmlAudio = new Audio(url);
    htmlAudio.preload = "auto";
    this.mediaElement = htmlAudio;
  }

  async play() {
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
  }

  async destroy() {
    this.pause();
    this.mediaElement = null;
    this.destroyed = true;
    this.state = "stopped";
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
