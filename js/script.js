console.log('Lets write js');

let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    // let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    
    // show all the songs in the palylist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const gaana of songs) {
        songUL.innerHTML += `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${gaana.replaceAll("%20", " ")}</div>
            <div>Ayush</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/playsong.svg" alt="">
        </div></li>`;
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
    return songs;
}

const playmusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    // let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        // if (e.href.includes("/songs")) {
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the meta data of the folder
            // let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML += `<div data-fol="${folder}" class="card">
            <div class="play">
                <img src="img/play.png" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>
                ${response.description}
            </p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("fetching songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.fol}`);
            // playing first song of the playlist
            playmusic(songs[0]);
            //we can open hamburger to show playlist
            document.querySelector(".left").style.left = 0;
        })
    })
}

async function main() {
    // get the list of songs
    await getSongs("songs/NonCopyRight");
    playmusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    // Attach an event listener to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/playsong.svg";
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
        document.querySelector(".songtime").innerHTML = `${currentSong.currentTime}/${currentSong.duration}`;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Add an event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        console.log('previous clicked');
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }

    })
    // Add an event listener to next
    next.addEventListener("click", () => {
        console.log('next clicked');
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (index+1>=songs.length) {
            console.log("no more songs");
        } else {
            playmusic(songs[index + 1]);
        }
    })

    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (e.target.value==0) {
            // document.querySelector(".volume img").src=document.querySelector(".volume img").src.replace("img/volume.svg","img/mute.svg");
            document.querySelector(".volume img").src="img/mute.svg";
        } else {
            document.querySelector(".volume img").src="img/volume.svg";
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click",(e)=>{
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        } else {
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })

    // Add event listener for when the current song ends
    currentSong.addEventListener('ended', ()=>{
        play.src = "img/playsong.svg";
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (repeat.src.includes("img/repeatoff.svg")) {
            if (index+1<songs.length) {
                playmusic(songs[index + 1]);
            } else {
                // playmusic(songs[0]);//can play first song of the playlist
                play.src = "img/playsong.svg";
            }
        } else {
            playmusic(songs[index]);
        }
    });

    // Add an event listener to repeat the song
    repeat.addEventListener("click",(e)=>{
        if (e.target.src.includes("img/repeat.svg")) {
            e.target.src=e.target.src.replace("img/repeat.svg","img/repeatoff.svg");
        } else {
            e.target.src=e.target.src.replace("img/repeatoff.svg","img/repeat.svg");
        }
    })

    // Event listener for the spacebar key press
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            // event.preventDefault();  // Prevent the default action of the spacebar (scrolling)
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/playsong.svg";
            }
        }
    });
}

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds)) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    // Return the result as a string
    return `${formattedMinutes}:${formattedSeconds}`;
}
main();