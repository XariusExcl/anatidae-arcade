import fs from "fs";

const template = () => {
  const games = fs.readdirSync("public/").reduce((acc, element) => {
    acc[element] = {};
    fs.readdirSync("public/" + element).forEach((file) => {
      if (file.match(/^info\.json/i)) {
        acc[element] = {...JSON.parse(fs.readFileSync("public/" + element + "/" + file)), ...acc[element]};
      }
      if (file.match(/thumbnail/i)) {
        acc[element].thumbnail = file;
      }
      if (file.match(/^.+\.mp4/i)) {
        acc[element].video = file;
      }
    });
    return acc;
  }, {});

  return (`
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="/output.css" rel="stylesheet">
  <script>
    window.onload = () => {
      updateClock();
      updateHighscores();
      updateSelectedGame();
      setInterval(updateClock, 1000);
      frameUpdate();
    }

    // Data
    const games = ${JSON.stringify(games)};
    const gameNames = Object.keys(games);
    let currentGameHighscore = 0;

    // Clock
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      clockElement.textContent = hours + ":" + minutes + ":" + seconds;
    }

    // Highscores
    const updateHighscores = () => {
      highscoreWrapperElement.classList.remove('hs-popin');
      highscoreWrapperElement.classList.add('hs-popout');
      setTimeout(() => {
        let i = 0;
        while (games[gameNames[currentGameHighscore]].highscores === undefined || games[gameNames[currentGameHighscore]].highscores.length === 0 ) { // Skip games without highscores
          currentGameHighscore = (currentGameHighscore + 1) % gameNames.length;
          if (i >= gameNames.length) return;
          i++;
        }
        const game = games[gameNames[currentGameHighscore]];
        const hscount = highscoreElements.length;

        highscoreTitleElement.innerHTML = '<i class="text-3xl font-bold mr-1">' + game.name + "</i> Highscores : ";
        for (let i = 0; i < hscount; i++) {
          if (i < game.highscores.length) {
            highscoreElements[i].querySelector('.hs-name').textContent = game.highscores[i].name ?? '???';
            highscoreElements[i].querySelector('.hs-score').textContent = game.highscores[i].score ?? '???';
          } else {
            highscoreElements[i].querySelector('.hs-name').textContent = ''
            highscoreElements[i].querySelector('.hs-score').textContent = '';
          }
        }
        highscoreWrapperElement.classList.remove('hs-popout');
        highscoreWrapperElement.classList.add('hs-popin');
      }, 500);
    }

    // Attract Mode
    let isAttractMode = false;
    const gamesVithVideo = gameNames.filter((game) => games[game].video !== undefined);
    const showAttractMode = () => {
      if (gamesVithVideo.length === 0) return;
      // Pick a random video from the games array, if it has a video attribute
      const attactModeGame = gamesVithVideo[Math.floor(Math.random() * gamesVithVideo.length)];
      const videoSrc = '/' + attactModeGame + '/' + games[attactModeGame].video;
      // Add it to src of video el
      videoPlayerElement.src = videoSrc;
      // Fill divs with the info
      videoTitleElement.innerText = games[attactModeGame].name ?? attactModeGame;
      videoCatchphraseElement.innerText = games[attactModeGame].catchphrase ?? "Jouez maintenant !";
      // Show div
      videoWrapperElement.classList.remove('fade-out');
      videoWrapperElement.classList.add('fade-in');
      // Set some global flag to hide video when action is performed
      isAttractMode = true;

      // Set timeout to hide
      setTimeout(() => {
        hideAttractMode();
        isAttractMode = false;
      }, 19000);
    }

    const hideAttractMode = () => {
      videoWrapperElement.classList.remove('fade-in');
      videoWrapperElement.classList.add('fade-out');
    }
    
    // Gamepad navigation
    let gamepad = null;
    window.addEventListener("gamepadconnected", function (e) {
      console.log("Manette connectée à l'indice %d : %s. %d boutons, %d axes.",e.gamepad.index,e.gamepad.id,e.gamepad.buttons.length,e.gamepad.axes.length);
      if (gamepad != null)
        return;

      gamepad = e.gamepad;
      pollGamepad();
    });

    const input = {
      up: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.axes[1] == 1 }},
      down: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.axes[1] == -1 }},
      left: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.axes[0] == -1 }},
      right: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.axes[0] == 1 }},
      validate: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.buttons[0].pressed }},
      cancel: { state: false, justPressed: false, justReleased: false, bind: () => { return gamepad.buttons[1].pressed }}
    };
    const pollGamepad = () =>
    {
      if (gamepad == null) return;

      Object.values(input).forEach((value) => {
        const bind = value.bind();
        if (value.state != bind) {
          value.state = value.justPressed = bind;
          value.justReleased = !bind;
        }
        else
          value.justPressed = value.justReleased = false;
      });
    }

    let selectedGame = 0;
    let targetScroll = 0;
    let currentScroll = 0;
    const updateSelectedGame = () => {
      for (let i = 0; i < gameElements.length; i++) {
        gameElements[i].classList.remove('hover');
      }
      gameElements[selectedGame].classList.add('hover');

      const game = games[gameNames[selectedGame]];

      if (game.thumbnail === undefined) {
        gameBackgroundElement.style = \`background-image: linear-gradient(0deg, rgb(24, 24, 27) 0%, rgb(44,44,47) 20%, rgb(44,44,47) 80%, rgb(24, 24, 27) 100%)\`;
      } else {
        gameBackgroundElement.style = \`background-image: linear-gradient(0deg, rgba(24,24,27,1) 0%, rgba(24,24,27,0) 20%, rgba(24,24,27,0) 80%, rgba(24,24,27,1) 100%), url(/\${gameNames[selectedGame]}/\${game.thumbnail})\`
      }

      // Update info
      if (game !== undefined) {
        gameTitleElement.textContent = game.name ?? gameElements[selectedGame].getAttribute('link');
        gameDescriptionElement.textContent = game.description ?? "Ce jeu n'a pas de description.";
        gameCreatorElement.textContent = game.creator ?? "???";
        gameYearElement.textContent = game.year ?? "???";
        gameTypeElement.textContent = game.type ?? "???";
        gamePlayersElement.textContent = game.players ?? "???";
      } else {
        gameTitleElement.textContent = gameElements[selectedGame].getAttribute('link');
        gameDescriptionElement.textContent = "Ce jeu n'a pas de description.";
        gameCreatorElement.textContent = "???";
        gameYearElement.textContent = "???";
        gameTypeElement.textContent = "???";
        gamePlayersElement.textContent = "???";
      }

      // Update highscores
      currentGameHighscore = selectedGame;
      updateHighscores();

      targetScroll = Math.min(Math.max(424 * selectedGame + 212 - 960, 0), gamesSection.scrollWidth - gamesSection.clientWidth);
      smoothGameScroll();
    }

    const smoothGameScroll = () => {
      currentScroll += (targetScroll - currentScroll) * 0.1;
      gamesSection.scrollLeft = currentScroll;
      if (Math.abs(targetScroll - currentScroll) > 2)
        window.requestAnimationFrame(() => smoothGameScroll());
      else {
        gamesSection.scrollLeft = targetScroll;
        currentScroll = targetScroll;
      }
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          input.left.justPressed = input.left.status = true;
          break;
        case 'ArrowRight':
          input.right.justPressed = input.right.status = true;
          break;
        case 'ArrowUp':
          input.up.justPressed = input.up.status = true;
          break;
        case 'ArrowDown':
          input.down.justPressed = input.down.status = true;
          break;
        case 'Enter':
          input.validate.justPressed = input.validate.status = true;
          break;
        case 'Escape':
          input.cancel.justPressed = input.cancel.status = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          input.left.justReleased = input.left.status = false;
          break;
        case 'ArrowRight':
          input.right.justReleased = input.right.status = false;
          break;
        case 'ArrowUp':
          input.up.justReleased = input.up.status = false;
          break;
        case 'ArrowDown':
          input.down.justReleased = input.down.status = false;
          break;
        case 'Enter':
          input.validate.justReleased = input.validate.status = false;
          break;
        case 'Escape':
          input.cancel.justReleased = input.cancel.status = false;
          break;
      }
    });

    const keyboardReset = () => {
      input.up.justPressed = input.up.justReleased = false;
      input.down.justPressed = input.down.justReleased = false;
      input.left.justPressed = input.left.justReleased = false;
      input.right.justPressed = input.right.justReleased = false;
      input.validate.justPressed = input.validate.justReleased = false;
      input.cancel.justPressed = input.cancel.justReleased = false;
    }

    // Update
    let scrollHighscoreTimer = 0;
    let attractModeTimer = 0;
    let lastUpdateTime = Date.now();
    const frameUpdate = () => {
      const deltaTime = Date.now() - lastUpdateTime;
      scrollHighscoreTimer += deltaTime;
      attractModeTimer += deltaTime;

      if (scrollHighscoreTimer > 8000) {
        scrollHighscoreTimer = 0;
        currentGameHighscore = (currentGameHighscore + 1) % gameNames.length;
        updateHighscores();
      }
      
      if (attractModeTimer > 40000) {
        attractModeTimer = 0;
        showAttractMode();
      }

      pollGamepad();
      if (input.left.justPressed) {
        if (selectedGame != 0) {
          scrollHighscoreTimer = 0;
          selectedGame = selectedGame - 1;
          updateSelectedGame();
        };
      }
      if (input.right.justPressed) {
        if (selectedGame != gamesSection.children.length - 1) {
          scrollHighscoreTimer = 0;
          selectedGame = selectedGame + 1;
          updateSelectedGame();
        }
      }
      if (input.validate.justPressed) {
        scrollHighscoreTimer = 0;
        // TODO : fixme
        input.validate.justPressed = false;
        fetch('/api/playcount?game=' + gameNames[selectedGame], {
          method: 'POST'
        }).catch((err) => {
          console.error(err)
        }).finally(() => {
          window.location.href = '/' + gameElements[selectedGame].getAttribute('link');
        });
      }

      if (isAttractMode && (input.up.justPressed || input.down.justPressed || input.left.justPressed || input.right.justPressed || input.validate.justPressed || input.cancel.justPressed)) {
        attractModeTimer = 0;
        hideAttractMode();
      }

      keyboardReset();
      lastUpdateTime = Date.now();
      window.requestAnimationFrame(frameUpdate);
    }
  </script>
</head>

<body class="bg-zinc-900 text-zinc-100 mx-4 vh-100 vw-100 truncate">
  <div id="game-caroussel-background">
    <div class="flex justify-around p-5 mt-5">
      <div id="clock" class="text-4xl text-center lg:text-left font-bold"></div>
    </div>
    <section id="games" class="flex mx-auto py-10 relative overflow-x-scroll h-full">
    ${Object.keys(games).map((element) => {
        return `
          <div link="${element}" class="grid place-content-center min-w-96 h-96 bg-white shadow-xl mx-5 hover:scale-110 transition-all">
            <a href="/${element}" class="max-w-96 w-96 h-96 shadow-xl text-slate-700 text-center text-5xl font-bold bg-slate-600">
              <img 
                class="w-full h-full object-cover"
                src="/${element}/${games[element].thumbnail}" alt="${element}"
              >
              <div class="title text-3xl text-center">${games[element].name ?? element}</div>
            </a>
          </div>`
      }).join('')}
    </section>
  </div>
  <div class="w-full h-px bg-zinc-700 my-10"></div>
  <section id="game-infos" class="flex justify-between">
    <div class="ml-8 w-4/6">
      <div id="game-title" class="text-4xl font-bold"></div>
      <div class="flex">
        <div id="game-description" class="text-lg ml-5 mt-5 pr-5 whitespace-normal" style="width:960px;"></div>
        <div style="width: 420px">
          <div class="text-xl"><span class="font-bold">Créateur(s) : </span><span id="game-creator" class="text-wrap"></span></div>
          <div class="text-xl"><span class="font-bold">Année : </span><span id="game-year"></span></div>
          <div class="text-xl"><span class="font-bold">Type : </span><span id="game-type"></span></div>
          <div class="text-xl"><span class="font-bold">Joueur(s) : </span><span id="game-players"></span></div>
        </div>
      </div>
    </div>

    <div id="game-highscores" class="h-full" style="width:32rem">
      <div>
        <div id="game-highscore-title" class="text-lg"></div>
        <div class="flex mt-2">
          <div class="mx-3" style="width:220px">
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-3xl"></div>
              <div class="hs-score font-bold text-3xl"></div>
            </div>
            <div class="highscore flex justify-between ml-1" style="margin-bottom:0.2rem">
              <div class="hs-name text-2xl"></div>
              <div class="hs-score font-bold text-2xl"></div>
            </div>
            <div class="highscore flex justify-between ml-1" style="margin-bottom:0.2rem">
              <div class="hs-name text-2xl"></div>
              <div class="hs-score font-bold text-2xl"></div>
            </div>
            <div class="highscore flex justify-between ml-1" style="margin-bottom:0.2rem">
              <div class="hs-name text-2xl"></div>
              <div class="hs-score font-bold text-2xl"></div>
            </div>
            <div class="highscore flex justify-between ml-1" style="margin-bottom:0.2rem">
              <div class="hs-name text-2xl"></div>
              <div class="hs-score font-bold text-2xl"></div>
            </div>
          </div>
          <div class="mx-3" style="width:185px">
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name"></div>
              <div class="hs-score font-bold"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <div id="video-wrapper" class="fade-out absolute z-1 w-full h-full top-0 left-0">
    <video id="video-player" height="1080" width="1920" autoplay muted loop src="testgame/sample.mp4" class="absolute z-1 w-full h-full top-0 left-0"></video>
    <div id="video-title" class="absolute z-1 top-10 left-10 text-7xl font-bold bg-gray-950 bg-opacity-80 p-5 rounded-2xl">Wreckless Bar</div>
    <div id="video-catchphrase" class="absolute z-1 top-40 left-24 text-4xl font-bold bg-gray-950 bg-opacity-80 p-5 rounded-2xl">Jouez maintenant !</div>
    <div class="absolute bottom-40 left-40 text-8xl font-bold bg-gray-950 bg-opacity-80 pt-10 pb-14 pl-6 pr-9 rounded-full animate-bounce flex"><img src="joystickUp.png" style="width:96px;height:96px;"/><span>↓</span></div>
  </div>
  <footer class="flex absolute bottom-0 w-full py-3 pl-8 pr-16 text-center border-t border-zinc-700 justify-between">
    <div class="flex text-xl">
      <img src="backward.png" style="max-width:32px;max-height:32px;" />
      <img src="joystickUp.png" style="max-width:32px;max-height:32px;" />
      <img src="forward.png" style="max-width:32px;max-height:32px;" />
      <span style="align-self:center;"> Navigation</span>
    </div>
    <div class="text-sm" style="align-self:center; margin-left:-100px">Anatidae Arcade - IUT de Troyes</div>
    <div class="flex text-xl">
      <span style="align-self:center;"> Valider</span>
      <img src="button1.png" style="max-width:32px;max-height:32px;" />
    </div>
  </footer>
  <script>
      const gameTitleElement = document.getElementById('game-title');
      const gameDescriptionElement = document.getElementById('game-description');
      const gameCreatorElement = document.getElementById('game-creator');
      const gameYearElement = document.getElementById('game-year');
      const gameTypeElement = document.getElementById('game-type');
      const gamePlayersElement = document.getElementById('game-players');
      const highscoreWrapperElement = document.getElementById('game-highscores');
      const highscoreElements = document.getElementsByClassName('highscore');
      const highscoreTitleElement = document.getElementById('game-highscore-title');
      const clockElement = document.getElementById('clock');
      const gamesSection = document.getElementById('games');
      const gameElements = gamesSection.children;
      const gameBackgroundElement = document.getElementById('game-caroussel-background');
      const videoWrapperElement = document.getElementById('video-wrapper');
      const videoPlayerElement = document.getElementById('video-player');
      const videoTitleElement = document.getElementById('video-title');
      const videoCatchphraseElement = document.getElementById('video-catchphrase');
  </script>
</body>
</html>
  `);
}

export default template;