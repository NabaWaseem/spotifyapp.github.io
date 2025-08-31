let songs;
let currfolder;
let currentSong = new Audio();

// Format seconds into MM:SS
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Base path for your GitHub Pages
const BASE_PATH = "https://nabawaseem.github.io/spotifyapp.github.io/songs";

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`${BASE_PATH}/${folder}/`); // Correct fetch
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="./images/music.svg">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Naba</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="./images/play.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${BASE_PATH}/${currfolder}/${track}`;

  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "images/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`${BASE_PATH}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Get the metadata of the folder
      let a = await fetch(`${BASE_PATH}/${folder}/info.json`);
      let metadata = await a.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="#000">
              <path d="M5 20V4L19 12L5 20Z" />
            </svg>
          </div>
          <img src="${BASE_PATH}/${folder}/cover.jpg" alt="">
          <h2>${metadata.title}</h2>
          <p>${metadata.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(item.currentTarget.dataset.folder);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("cs");
  playMusic(songs[0], true);

  await displayAlbums();

  // Play/Pause
  const play = document.querySelector("#play");
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./images/play.svg";
    }
  });

  // Song progress
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Sidebar
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous Button
  const previous = document.querySelector("#previous");
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next Button
  const nextButton = document.querySelector("#next");
  nextButton.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src =
        document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
    }
  });

  // Mute/Unmute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
