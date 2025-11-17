document.addEventListener("DOMContentLoaded", () => {
  // --- STATE MANAGEMENT ---
  let rotation = 0;
  let sections = [];
  let truthList = [];
  let dareList = [];
  let currentWinner = "";

  // --- INJECT CSS ---
  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
      @keyframes gradientAnimation { 0% {background-position: 0% 50%;} 50% {background-position: 100% 50%;} 100% {background-position: 0% 50%;} }
      body { margin: 0; font-family: "Poppins", sans-serif; background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); background-size: 400% 400%; animation: gradientAnimation 15s ease infinite; color: white; text-align: center; overflow-x: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; }
      h1 { text-shadow: 0 0 10px #00000050; }
      .tab-content { margin: 20px auto; width: 80%; max-width: 600px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 20px; border-radius: 20px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.2); }
      textarea { background: rgba(255, 255, 255, 0.8); color: black; border: 1px solid #ddd; width: 90%; border-radius: 10px; font-size: 16px; padding: 10px; margin-bottom: 10px; }
      .main-btn { background: #00eaff; border: none; color: #000; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; margin: 5px; box-shadow: 0 0 15px #00eaff; }
      .main-btn:hover { transform: scale(1.05); }
      #wheel { width: 350px; height: 350px; border-radius: 50%; margin: 15px auto; border: 10px solid #00eaff; transition: transform 6s cubic-bezier(0.25, 1, 0.4, 1); box-shadow: 0 0 30px #00eaff; }
      .wheel-label { position: absolute; top: 50%; left: 50%; transform-origin: center center; color: black; font-weight: bold; text-shadow: 0 0 2px white, 0 0 2px white; }
      #wheel-area { position: relative; }
      .pointer { width: 0; height: 0; margin: auto; border-left: 25px solid transparent; border-right: 25px solid transparent; border-top: 35px solid white; position: absolute; top: -35px; left: 50%; transform: translateX(-50%); z-index: 10; }
      #spin-trigger { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90px; height: 90px; background: white; color: #e73c7e; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 24px; cursor: pointer; z-index: 5; border: 5px solid #00eaff; }
      #result-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 100; }
      #modal-content { background: rgba(0, 0, 0, 0.7); padding: 30px; border-radius: 20px; border: 2px solid #00eaff; box-shadow: 0 0 30px #00eaff; width: 90%; max-width: 500px; }
      #modal-winner { font-size: 2em; color: #00eaff; }
      #modal-challenge-type { font-size: 1.5em; margin-top: 10px; }
      #modal-challenge-text { font-size: 1.2em; margin-top: 20px; min-height: 50px; }
      @media (max-width: 768px) { h1 { font-size: 1.8em; } }
      @media (max-width: 480px) {
        h1 { font-size: 1.5em; padding-left: 10px; padding-right: 10px; }
        .tab-content { width: 95%; margin-top: 15px; margin-bottom: 15px; padding: 15px; }
        #wheel { width: 300px; height: 300px; }
        .wheel-label { font-size: 0.9em; }
        #modal-winner { font-size: 1.5em; }
        #modal-challenge-type { font-size: 1.2em; }
        #modal-challenge-text { font-size: 1em; }
      }
  `;
  document.head.appendChild(styleElement);

  // --- CREATE DYNAMIC HTML ---
  document.body.innerHTML = `
    <h1>Truth or Dare</h1>
    <button id="music-toggle-btn" class="main-btn" style="position: absolute; top: 20px; left: 20px">🎵</button>
    <button id="fullscreen-btn" class="main-btn" style="position: absolute; top: 20px; right: 20px">📱</button>

    <div id="setup-container" class="tab-content">
      <h2>Siapkan Permainan</h2>
      <h3>Nama Pemain (pisahkan dengan koma)</h3>
      <textarea id="names" rows="3"></textarea>
      <h3>Custom TRUTH</h3>
      <textarea id="truthInput" rows="4" placeholder="Pisahkan dengan baris baru (1 truth per baris)"></textarea>
      <h3>Custom DARE</h3>
      <textarea id="dareInput" rows="4" placeholder="Pisahkan dengan baris baru (1 dare per baris)"></textarea>
      <br />
      <button id="start-game-btn" class="main-btn">🎨 START GAME</button>
    </div>

    <div id="wheel-container" class="tab-content" style="display: none">
      <div id="wheel-area">
        <div class="pointer"></div>
        <div id="spin-trigger">SPIN</div>
        <div id="wheel"></div>
      </div>
      <button id="go-back-btn" class="main-btn" style="margin-top: 20px">Ubah Tantangan</button>
    </div>

    <audio id="spinSound" src="must121hosler-1-65800.mp3"></audio>
    <audio id="clickSound" src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3235f.mp3"></audio>
    <audio id="background-music" loop src="https://cdn.pixabay.com/download/audio/2022/08/03/audio_5832321a98.mp3"></audio>

    <div id="result-modal">
      <div id="modal-content">
        <h2 id="modal-winner"></h2>
        <div id="modal-choice-container">
          <h3>Pilih:</h3>
          <button id="truth-btn" class="main-btn">TRUTH</button>
          <button id="dare-btn" class="main-btn">DARE</button>
        </div>
        <div id="modal-challenge-container" style="display: none">
          <h3 id="modal-challenge-type"></h3>
          <p id="modal-challenge-text"></p>
        </div>
        <br />
        <button id="next-round-btn" class="main-btn" style="display: none">NEXT ROUND</button>
      </div>
    </div>
  `;

  // --- GAME LOGIC FUNCTIONS ---

  function startGame() {
    sections = document
      .getElementById("names")
      .value.split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    truthList = document
      .getElementById("truthInput")
      .value.split("\n")
      .filter(Boolean);
    dareList = document
      .getElementById("dareInput")
      .value.split("\n")
      .filter(Boolean);

    if (sections.length < 2) {
      alert("Minimal 2 nama!");
      return;
    }
    if (truthList.length === 0 || dareList.length === 0) {
      alert("Minimal isi Truth dan Dare!");
      return;
    }

    document.getElementById("setup-container").style.display = "none";
    document.getElementById("wheel-container").style.display = "block";

    const step = 360 / sections.length;
    let gradient = "conic-gradient(";
    for (let i = 0; i < sections.length; i++) {
      const color = `hsl(${(i * 60) % 360}, 90%, 60%)`;
      gradient += `${color} ${i * step}deg ${(i + 1) * step}deg,`;
    }
    gradient = gradient.slice(0, -1) + ")"; // Remove last comma

    const wheel = document.getElementById("wheel");
    wheel.innerHTML = ""; // Clear previous names

    for (let i = 0; i < sections.length; i++) {
      const label = document.createElement("div");
      label.className = "wheel-label";
      label.textContent = sections[i];
      const angle = i * step + step / 2;
      const radius = (wheel.offsetWidth / 2) * 0.7;
      label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`;
      wheel.appendChild(label);
    }

    wheel.style.background = gradient;

    const bgMusic = document.getElementById("background-music");
    if (bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.3;
      bgMusic
        .play()
        .then(() => {
          document.getElementById("music-toggle-btn").textContent = "🔇";
        })
        .catch((error) => console.log("Autoplay prevented.", error));
    }
  }

  function spinWheel() {
    if (sections.length < 2) {
      alert("Generate wheel dulu!");
      return;
    }

    const sound = document.getElementById("spinSound");
    if (sound) {
      sound.loop = true;
      sound.play();
    }

    const wheel = document.getElementById("wheel");
    document.getElementById("spin-trigger").style.display = "none";

    const randomSpin = 3600 + Math.random() * 2000;
    rotation += randomSpin;
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }

      const currentRotation = rotation % 360;
      const step = 360 / sections.length;
      const winnerIndex =
        sections.length - 1 - Math.floor(currentRotation / step);
      currentWinner = sections[winnerIndex];

      showResultModal(currentWinner);
    }, 6000);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function goBackToSetup() {
    document.getElementById("wheel-container").style.display = "none";
    document.getElementById("setup-container").style.display = "block";
  }

  function getChallenge(type) {
    const promptList = type === "TRUTH" ? truthList : dareList;
    const prompt =
      promptList.length > 0
        ? promptList[Math.floor(Math.random() * promptList.length)]
        : "Tidak ada tantangan/pertanyaan yang tersedia.";
    const emoji = type === "TRUTH" ? "😈" : "💀";

    document.getElementById(
      "modal-challenge-type"
    ).textContent = `${emoji} ${type}`;
    document.getElementById("modal-challenge-text").textContent = prompt;

    document.getElementById("modal-choice-container").style.display = "none";
    document.getElementById("modal-challenge-container").style.display =
      "block";
    document.getElementById("next-round-btn").style.display = "inline-block";
  }

  function showResultModal(winner) {
    document.getElementById("modal-winner").textContent = winner;
    document.getElementById("result-modal").style.display = "flex";
  }

  function closeModal() {
    document.getElementById("result-modal").style.display = "none";
    document.getElementById("spin-trigger").style.display = "flex";

    document.getElementById("modal-choice-container").style.display = "block";
    document.getElementById("modal-challenge-container").style.display = "none";
    document.getElementById("next-round-btn").style.display = "none";
  }

  function toggleMusic() {
    const bgMusic = document.getElementById("background-music");
    const musicBtn = document.getElementById("music-toggle-btn");
    if (bgMusic.paused) {
      bgMusic.volume = 0.3;
      bgMusic.play();
      musicBtn.textContent = "🔇";
    } else {
      bgMusic.pause();
      musicBtn.textContent = "🎵";
    }
  }

  // --- EVENT LISTENERS ---
  document
    .getElementById("start-game-btn")
    .addEventListener("click", startGame);
  document.getElementById("spin-trigger").addEventListener("click", spinWheel);
  document
    .getElementById("go-back-btn")
    .addEventListener("click", goBackToSetup);
  document
    .getElementById("fullscreen-btn")
    .addEventListener("click", toggleFullscreen);
  document
    .getElementById("music-toggle-btn")
    .addEventListener("click", toggleMusic);

  // Modal buttons
  document
    .getElementById("truth-btn")
    .addEventListener("click", () => getChallenge("TRUTH"));
  document
    .getElementById("dare-btn")
    .addEventListener("click", () => getChallenge("DARE"));
  document
    .getElementById("next-round-btn")
    .addEventListener("click", closeModal);

  // General click sound for all main buttons
  document.body.addEventListener("click", (event) => {
    if (event.target.matches(".main-btn")) {
      const clickSound = document.getElementById("clickSound");
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play();
      }
    }
  });
});
