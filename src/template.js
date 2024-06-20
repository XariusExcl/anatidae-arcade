import fs from "fs";

const template = () => {
  const games = fs.readdirSync("public/").reduce((acc, element) => {
    acc[element] = {};
    fs.readdirSync("public/" + element).forEach((file) => {
      if (file.match(/info/i)) {
        acc[element] = JSON.parse(fs.readFileSync("public/" + element + "/" + file));
      }
      if (file.match(/thumbnail/i)) {
        acc[element].thumbnail = file;
      }
    });
    return acc;
  }, {});

  return (`
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>
    window.onload = () => {
      updateClock();
      updateHighscores();
      updateSelectedGame();
      setInterval(updateClock, 1000);
      setInterval(updateHighscores, 8000);
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
      clock.textContent = hours + ":" + minutes + ":" + seconds;
    }

    // Highscores
    const updateHighscores = () => {
      highscoreWrapper.classList.remove('hs-popin');
      highscoreWrapper.classList.add('hs-popout');
      setTimeout(() => {
        currentGameHighscore = (currentGameHighscore + 1) % gameNames.length;
        let i = 0;
        while (games[gameNames[currentGameHighscore]].highscores === undefined) { // Skip games without highscores
          currentGameHighscore = (currentGameHighscore + 1) % gameNames.length;
          if (i >= gameNames.length) return;
          i++;
        }
        const game = games[gameNames[currentGameHighscore]];
        const hscount = highscoreElements.length;
  
        highscoreTitle.innerHTML = "Highscores sur <i>" + game.name + "</i> : ";
        game.highscores.forEach((highscore, index) => {
          if (index < hscount) {
            highscoreElements[index].querySelector('.hs-name').textContent = (index + 1) + ". " + highscore.name;
            highscoreElements[index].querySelector('.hs-score').textContent = highscore.score;
          }
        });
        highscoreWrapper.classList.remove('hs-popout');
        highscoreWrapper.classList.add('hs-popin');
      }, 500);
    }
    
    // Gamepad navigation
    let gamepad = null;
    window.addEventListener("gamepadconnected", function (e) {
      console.log(
        "Manette connectée à l'indice %d : %s. %d boutons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
      );

      gamepad = e.gamepad;

      pollGamepad();
    });

    let input = {
      up: { state: false, justPressed: false, justReleased: false},
      down: { state: false, justPressed: false, justReleased: false},
      left: { state: false, justPressed: false, justReleased: false},
      right: { state: false, justPressed: false, justReleased: false},
      validate: { state: false, justPressed: false, justReleased: false},
      cancel: { state: false, justPressed: false, justReleased: false}
    };
    const pollGamepad = () =>
    {
      if (gamepad == null) return;

      // reset all justPressed/justReleased flags
      for (const key in input) {
        input[key].justPressed = false;
        input[key].justReleased = false;
      }
      
      if (input.up.state && !gamepad.buttons[12].pressed)
        input.up.justReleased = true;
      if (input.down.state && !gamepad.buttons[13].pressed)
        input.down.justReleased = true;
      if (input.left.state && !gamepad.buttons[14].pressed)
        input.left.justReleased = true;
      if (input.right.state && !gamepad.buttons[15].pressed)
        input.right.justReleased = true;
      if (input.validate.state && !gamepad.buttons[0].pressed)
        input.validate.justReleased = true;
      if (input.cancel.state && !gamepad.buttons[1].pressed)
        input.cancel.justReleased = true;

      if (gamepad.buttons[12].pressed && !input.up.state)
        input.up.justPressed = true;
      if (gamepad.buttons[13].pressed && !input.down.state)
        input.down.justPressed = true;
      if (gamepad.buttons[14].pressed && !input.left.state)
        input.left.justPressed = true;
      if (gamepad.buttons[15].pressed && !input.right.state)
        input.right.justPressed = true;
      if (gamepad.buttons[0].pressed && !input.validate.state)
        input.validate.justPressed = true;
      if (gamepad.buttons[1].pressed && !input.cancel.state)
        input.cancel.justPressed = true;
      
      gamepad.buttons[12].pressed ? input.up.state = true : input.up.state = false;
      gamepad.buttons[13].pressed ? input.down.state = true : input.down.state = false;
      gamepad.buttons[14].pressed ? input.left.state = true : input.left.state = false;
      gamepad.buttons[15].pressed ? input.right.state = true : input.right.state = false;
      gamepad.buttons[0].pressed ? input.validate.state = true : input.validate.state = false;
      gamepad.buttons[1].pressed ? input.cancel.state = true : input.cancel.state = false;

      window.requestAnimationFrame(pollGamepad);
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

      console.log(gameNames[selectedGame] + game.thumbnail);

      if (game.thumbnail === undefined) {
        gameBackground.style = \`background-image: linear-gradient(0deg, rgb(24, 24, 27) 0%, rgb(44,44,47) 20%, rgb(44,44,47) 80%, rgb(24, 24, 27) 100%)\`;
      } else {
        gameBackground.style = \`background-image: linear-gradient(0deg, rgba(24,24,27,1) 0%, rgba(24,24,27,0) 20%, rgba(24,24,27,0) 80%, rgba(24,24,27,1) 100%), url(/\${gameNames[selectedGame]}/\${game.thumbnail})\`
      }

      // Update info
      if (game !== undefined) {
        gameTitle.textContent = game.name ?? gameElements[selectedGame].getAttribute('link');
        gameDescription.textContent = game.description ?? "Ce jeu n'a pas de description.";
        gameCreator.textContent = game.creator ?? "???";
        gameYear.textContent = game.year ?? "???";
        gameType.textContent = game.type ?? "???";
        gamePlayers.textContent = game.players ?? "???";
      } else {
        gameTitle.textContent = gameElements[selectedGame].getAttribute('link');
        gameDescription.textContent = "Ce jeu n'a pas de description.";
        gameCreator.textContent = "???";
        gameYear.textContent = "???";
        gameType.textContent = "???";
        gamePlayers.textContent = "???";
      }

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

    const frameUpdate = () => {

      // Caroussel
      if (input.left.justPressed) {
        selectedGame = Math.max(0, selectedGame - 1);
        updateSelectedGame();
      }
      if (input.right.justPressed) {
        selectedGame = Math.min(gamesSection.children.length - 1, selectedGame + 1);
        updateSelectedGame();
      }
      if (input.validate.justPressed) {
        window.location.href = '/' + gameElements[selectedGame].getAttribute('link');
      }
      window.requestAnimationFrame(frameUpdate);
    }
  </script>
  <style>
    section::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    section {
      -ms-overflow-style: none;
      /* IE and Edge */
      scrollbar-width: none;
      /* Firefox */
    }

    .hover {
      transform: scale(1.1);
      outline: 4px solid #faf0fc;
    }

    .title {
      display: none;
    }

    .hover .title {
      margin-top: 1rem;
      color: white;
      display: block;
    }

    .hs-popout {
      transition: 0.25s all;
      transform: translateX(10%);
      opacity: 0;
      transition-timing-function: ease-out;
    }
    
    .hs-popin {
      transition: 0.25s all;
      transform: translateX(0);
      opacity: 1;
      transition-timing-function: ease-out;
    }

    #game-caroussel-background {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: 1s all;
      height: 680px;
    }
  </style>
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
              <div class="title text-3xl text-center">${games[element].name}</div>
            </a>
          </div>`
      }).join('')}
    </section>
  </div>
  <div class="w-full h-px bg-zinc-700 my-10"></div>
  <section id="game-infos" class="flex justify-between">
    <div class="ml-8" style="max-width: 960px;">
      <div id="game-title" class="text-4xl font-bold">
        Crossy
      </div>
      <div class="flex">
        <div id="game-description" class="text-lg ml-5 mt-5 text-wrap">
        </div>
        <div class="w-48"></div>
        <div class="w-48">
          <div class="text-xl"><span class="font-bold">Créateur : </span><span id="game-creator"></span></div>
          <div class="text-xl"><span class="font-bold">Année : </span><span id="game-year"></span></div>
          <div class="text-xl"><span class="font-bold">Type : </span><span id="game-type"></span></div>
          <div class="text-xl"><span class="font-bold">Joueurs : </span><span id="game-players"></span></div>
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
  <footer class="flex absolute bottom-0 w-full py-3 pl-8 pr-16 text-center border-t border-zinc-700 justify-between">
    <div class="flex text-xl">
      <img src="backward.png" style="max-width:32px;max-height:32px;" />
      <img src="joystickUp.png" style="max-width:32px;max-height:32px;" />
      <img src="forward.png" style="max-width:32px;max-height:32px;" />
      <span style="align-self:center;"> Navigation</span>
    </div>
    <div class="text-sm" style="align-self:center;">Anatidae Arcade - IUT de Troyes</div>
    <div class="flex text-xl">
      <span style="align-self:center;"> Valider</span>
      <img src="button1.png" style="max-width:32px;max-height:32px;" />
    </div>
  </footer>
  <script>
      const gameTitle = document.getElementById('game-title');
      const gameDescription = document.getElementById('game-description');
      const gameCreator = document.getElementById('game-creator');
      const gameYear = document.getElementById('game-year');
      const gameType = document.getElementById('game-type');
      const gamePlayers = document.getElementById('game-players');
      const highscoreWrapper = document.getElementById('game-highscores');
      const highscoreElements = document.getElementsByClassName('highscore');
      const highscoreTitle = document.getElementById('game-highscore-title');
      const clock = document.getElementById('clock');
      const gamesSection = document.getElementById('games');
      const gameElements = gamesSection.children;
      const gameBackground = document.getElementById('game-caroussel-background');
  </script>
</body>
</html>
  `);
}

export default template;