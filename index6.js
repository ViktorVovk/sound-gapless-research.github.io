const audioSourceURL = "./output.webm";

// Create HTMLAudioElement Instances
const tempSet = new Set();
const htmlAudioButtons = [
  document.getElementById("h1"),
  document.getElementById("h10"),
  document.getElementById("h100"),
  document.getElementById("h1000"),
];
const createHTMLAudioInstance = (count = 1) => {
  for (let index = 0; index < count; index++) {
    tempSet.add(new Audio(audioSourceURL));
  }
};
htmlAudioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    createHTMLAudioInstance(Number(button.id.split("h").join("")));
  });
});

// Create HTMLAudioElement with Web Audio API Instances
const htmlAudioButtonsW = [
  document.getElementById("hw1"),
  document.getElementById("hw10"),
  document.getElementById("hw100"),
  document.getElementById("hw1000"),
];

const tempSet1 = new Set();

const createHTMLAudioWInstance = (count = 1) => {
  const audiContext = new AudioContext();
  for (let index = 0; index < count; index++) {
    const htmlAudio = new Audio(audioSourceURL);
    const audioSource = audiContext.createMediaElementSource(htmlAudio);
    audioSource.connect(audiContext.destination);
    tempSet1.add({
      a: new Audio(audioSourceURL),
      s: audioSource,
      c: audiContext,
    });
  }
};

htmlAudioButtonsW.forEach((button) => {
  button.addEventListener("click", () => {
    createHTMLAudioWInstance(Number(button.id.split("hw").join("")));
  });
});

// Create  Web Audio API Instances
const webAudioButton = [
  document.getElementById("w1"),
  document.getElementById("w10"),
  document.getElementById("w100"),
  document.getElementById("w1000"),
];

const tempSet2 = new Set();

const createWebAudioApiInstance = async (count = 1) => {

  const audiContext = new AudioContext();
  for (let index = 0; index < count; index++) {
   

    await fetch(audioSourceURL)
      .then((r) => r.arrayBuffer())
      .then((data) => audiContext.decodeAudioData(data))
      .then((decoded) => {
        tempSet2.add(decoded);
      })
      .catch((err) => console.error(err));
  }
};

webAudioButton.forEach((button) => {
  button.addEventListener("click", async () => {
    await createWebAudioApiInstance(Number(button.id.split("w").join("")));
  });
});


