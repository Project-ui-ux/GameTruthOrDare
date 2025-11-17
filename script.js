let rotation = 0;
let sections = [];
let truthList = [];
let dareList = [];
let currentWinner = "";

function isValidInput(input) {
  return input && input.trim() !== "";
}

/* ------------ START GAME ------------ */
function startGame() {
  let names = document.getElementById("names").value;
  sections = names
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n);

  truthList = document
    .getElementById("truthInput")
    .value.split("\n")
    .filter((t) => t);

  dareList = document
    .getElementById("dareInput")
    .value.split("\n")
    .filter((t) => t);

  if (sections.length < 2) {
    alert("Minimal 2 nama!");
    return;
  }
  if (truthList.length === 0 || dareList.length === 0) {
    alert("Minimal isi Truth dan Dare!");
    return;
  }

  // Pindahkan kontainer ke depan agar dimensinya bisa dibaca
  document.getElementById("setup-container").style.display = "none";
  document.getElementById("wheel-container").style.display = "block";

  let step = 360 / sections.length;
  let gradient = "conic-gradient(";

  for (let i = 0; i < sections.length; i++) {
    let color = `hsl(${(i * 60) % 360}, 90%, 60%)`;
    gradient += `${color} ${i * step}deg ${(i + 1) * step}deg${
      i === sections.length - 1 ? "" : ","
    }`;
  }
  gradient += ")";

  const wheel = document.getElementById("wheel");
  wheel.innerHTML = ""; // Bersihkan nama sebelumnya

  // Tambahkan nama ke roda
  for (let i = 0; i < sections.length; i++) {
    const label = document.createElement("div");
    label.className = "wheel-label";
    label.textContent = sections[i];
    const angle = i * step + step / 2; // Posisi di tengah segmen
    const radius = (wheel.offsetWidth / 2) * 0.7; // Jarak label dari pusat (70% dari radius)
    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`;
    wheel.appendChild(label);
  }

  document.getElementById("wheel").style.background = gradient;

  // Coba putar musik latar saat game dimulai
  const bgMusic = document.getElementById("background-music");
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic
      .play()
      .then(() => {
        document.getElementById("music-toggle-btn").textContent = "🔇";
      })
      .catch((error) => {
        console.log("Autoplay musik latar dicegah oleh browser.", error);
      });
  }
}

/* ------------ SPIN FUNCTION ------------ */
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

  let wheel = document.getElementById("wheel");
  document.getElementById("spin-trigger").style.display = "none"; // Sembunyikan tombol spin

  let randomSpin = 3600 + Math.random() * 2000;
  rotation += randomSpin;

  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    // Hentikan suara putaran roda
    const sound = document.getElementById("spinSound");
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }

    const currentRotation = rotation % 360;
    const step = 360 / sections.length;
    // Logika untuk panah di atas (posisi 0 derajat)
    const winnerIndex =
      sections.length - 1 - Math.floor(currentRotation / step);
    currentWinner = sections[winnerIndex];

    showResultModal(currentWinner);
  }, 6000);
}

/* ------------ FULLSCREEN ------------ */
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

/* ------------ GO BACK TO SETUP ------------ */
function goBackToSetup() {
  // Sembunyikan kontainer roda dan tampilkan kontainer pengaturan
  document.getElementById("wheel-container").style.display = "none";
  document.getElementById("setup-container").style.display = "block";
}

/* ------------ GET CHALLENGE ------------ */
function getChallenge(type) {
  let promptList = type === "TRUTH" ? truthList : dareList;
  let prompt =
    promptList.length > 0
      ? promptList[Math.floor(Math.random() * promptList.length)]
      : "Tidak ada tantangan/pertanyaan yang tersedia.";

  const emoji = type === "TRUTH" ? "😈" : "💀";
  // Update modal content
  document.getElementById(
    "modal-challenge-type"
  ).textContent = `${emoji} ${type}`;
  document.getElementById("modal-challenge-text").textContent = prompt;

  // Show challenge and hide choice
  document.getElementById("modal-choice-container").style.display = "none";
  document.getElementById("modal-challenge-container").style.display = "block";
  document.getElementById("next-round-btn").style.display = "inline-block";
}

/* ------------ MODAL LOGIC ------------ */
function showResultModal(winner) {
  document.getElementById("modal-winner").textContent = winner;
  document.getElementById("result-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("result-modal").style.display = "none";
  document.getElementById("spin-trigger").style.display = "flex"; // Tampilkan kembali tombol spin

  // Reset modal for next round
  document.getElementById("modal-choice-container").style.display = "block";
  document.getElementById("modal-challenge-container").style.display = "none";
  document.getElementById("next-round-btn").style.display = "none";
}

// Initialize the first tab and add event listener for wheel click
document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("background-music");
  const musicBtn = document.getElementById("music-toggle-btn");

  if (musicBtn && bgMusic) {
    musicBtn.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.volume = 0.3;
        bgMusic.play();
        musicBtn.textContent = "🔇"; // Ikon untuk mute
      } else {
        bgMusic.pause();
        musicBtn.textContent = "🎵"; // Ikon untuk unmute
      }
    });
  }

  // Add click sound to all main buttons
  document.body.addEventListener("click", function (event) {
    if (event.target.matches(".main-btn")) {
      const clickSound = document.getElementById("clickSound");
      if (clickSound) {
        clickSound.currentTime = 0; // Reset suara agar bisa diklik berulang kali dengan cepat
        clickSound.play();
      }
    }
  });
});
