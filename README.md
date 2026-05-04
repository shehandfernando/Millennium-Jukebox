# 💽 Millennium Jukebox

![Millennium Jukebox Interface Preview](Img-3.png)

[cite_start]Millennium Jukebox is a fully functional, retrofuturistic web audio player inspired by late '90s and early 2000s software like Winamp[cite: 1, 35]. [cite_start]It fully embraces the "Digital Maximalism" aesthetic, complete with high-gloss plastic, brushed chrome, and pixelated LCD displays[cite: 2, 4]. 

## ✨ Features

* [cite_start]**Local File Playback:** Click the eject/load button to load your own local `.mp3` files directly into the playlist[cite: 88, 90].
* [cite_start]**Internet Radio Dial:** Live internet streaming capabilities that fetch trending tracks by genre via the free, decentralized Audius API[cite: 132, 133].
* [cite_start]**Active Audio Visualizer:** Real-time bouncing green EQ bars powered by the Web Audio API that react to the frequencies of your music[cite: 16, 97].
* [cite_start]**Custom Skinning:** A built-in theme toggle to instantly switch the player's UI between the classic "Liquid Metal" and dark "Neon Cyber" aesthetics[cite: 99, 142].
* [cite_start]**Authentic Controls:** Features a physical-looking track scrubber progress bar, a chunky metallic volume slider, and a digital time counter tracking elapsed and total duration[cite: 18, 98, 149].

## 🛠️ Tech Stack

* [cite_start]**Frontend Framework:** React [cite: 10, 37]
* [cite_start]**Build Tool:** Vite [cite: 64]
* [cite_start]**Audio Engine:** Native HTML5 `<audio>` element API [cite: 7, 48]
* [cite_start]**Styling:** Standard CSS utilizing complex `linear-gradient` and `box-shadow` properties to create fake 3D plastic and metal textures [cite: 49, 50]

## 🚀 Running Locally

1. Clone this repository to your local machine.
2. [cite_start]Navigate into the project folder and run `npm install` to install dependencies[cite: 72].
3. [cite_start]Run `npm run dev` to start the local Vite server[cite: 72].
4. [cite_start]Open the provided local network link (usually `http://localhost:5173/`) in your browser to view the app[cite: 72].

## 🔮 Future Roadmap (Planned Features)

* [cite_start]**Keyboard Shortcuts:** Event listeners to allow hitting the Spacebar to play/pause or using the arrow keys to skip tracks[cite: 125].
* [cite_start]**Time Display Toggle:** Updating the LCD screen so clicking the timer swaps between "Time Elapsed" and "Time Remaining"[cite: 126].
* [cite_start]**Drag-and-Drop Playlist:** Logic to click, hold, and drag tracks to rearrange the playback order on the fly[cite: 127].