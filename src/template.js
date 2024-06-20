import fs from "fs";

const template = () => {
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
      setInterval(updateClock, 1000);
      setInterval(updateHighscores, 5000);
      frameUpdate();
    }

    // Data
    const games = ${JSON.stringify(fs.readdirSync("public/").reduce((acc, element) => {
      const game = fs.readdirSync("public/" + element).find((e) => e.match(/info.json/i));
      if (game) {
        acc[element] = JSON.parse(fs.readFileSync("public/" + element + "/" + game));
      } else {
        acc[element] = undefined;
      }
      return acc;
    }, {}))};
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
      currentGameHighscore = (currentGameHighscore + 1) % gameNames.length;
      const game = games[gameNames[currentGameHighscore]];
      const hscount = highscoreElements.length;

      highscoreTitle.textContent = "Highscores sur " + game.name + ":";
      game.highscores.forEach((highscore, index) => {
        if (index < hscount) {
          highscoreElements[index].querySelector('.hs-name').textContent = (index + 1) + ". " + highscore.name;
          highscoreElements[index].querySelector('.hs-score').textContent = highscore.score;
        }
      });
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

      // Update info
      const game = games[gameNames[selectedGame]];
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
  </style>
</head>

<body class="bg-zinc-900 text-zinc-100 mx-4 vh-100 vw-100 truncate">
  <div
    style="background: linear-gradient(0deg, rgba(24,24,27,1) 0%, rgba(24,24,27,0) 20%, rgba(24,24,27,0) 80%, rgba(24,24,27,1) 100%), url(http://127.0.0.1:3000/MMIFight/thumbnail.png);height:680px">
    <div class="flex justify-around p-5 mt-5">
      <div id="clock" class="text-4xl text-center lg:text-left font-bold"></div>
    </div>
    <section id="games" class="flex mx-auto py-10 relative overflow-x-scroll h-full">
    ${fs.readdirSync("public/").map((element, index, array) => {
      return `
        <div link="${element}" class="grid place-content-center min-w-96 h-96 bg-white shadow-xl mx-5 hover:scale-110 transition-all">
          <a href="/${element}" class="max-w-96 w-96 h-96 shadow-xl text-slate-700 text-center text-5xl font-bold bg-slate-600">
            <img 
              class="w-full h-full object-cover"
              src="/${element}/${fs.readdirSync("public/" + element).find((e) => e.match(/thumbnail/i))}" alt="${element}"
            >
          </a>
        </div>
      `}).join('')}
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
          Crossy est un jeu de plateforme en 2D où vous incarnez un canard qui doit traverser la route rejoindre son
          étang. Il est plutôt loin cet étang, non ?
        </div>
        <div class="w-48"></div>
        <div class="w-48">
          <div class="text-xl"><span class="font-bold">Créateur : </span><span id="game-creator">John Doe</span></div>
          <div class="text-xl"><span class="font-bold">Année : </span><span id="game-year">2024</span></div>
          <div class="text-xl"><span class="font-bold">Type : </span><span id="game-type">Arcade</span></div>
          <div class="text-xl"><span class="font-bold">Joueurs : </span><span id="game-players">1</span></div>
        </div>
      </div>
    </div>

    <div id="game-highscores" class="h-full" style="width:32rem">
      <div>
        <div id="game-highscore-title" class="text-lg">Highscores sur Crossy:</div>
        <div class="flex mt-2">
          <div class="mx-3" style="width:250px">
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-xl">1. John Doe</div>
              <div class="hs-score font-bold text-lg">12500</div>
            </div>
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-xl">2. _____</div>
              <div class="hs-score font-bold text-lg">0</div>
            </div>
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-xl">3. _____</div>
              <div class="hs-score font-bold text-lg">0</div>
            </div>
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-xl">4. _____</div>
              <div class="hs-score font-bold text-lg">0</div>
            </div>
            <div class="highscore flex justify-between" style="margin-bottom:0.2rem">
              <div class="hs-name text-xl">5. _____</div>
              <div class="hs-score font-bold text-lg">0</div>
            </div>
          </div>
          <div class="mx-3" style="width:185px">
            <div class="highscore flex justify-between">
              <div class="hs-name">6. _____</div>
              <div class="hs-score font-bold">0</div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name">7. _____</div>
              <div class="hs-score font-bold">0</div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name">8. _____</div>
              <div class="hs-score font-bold">0</div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name">9. _____</div>
              <div class="hs-score font-bold">0</div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name">10. _____</div>
              <div class="hs-score font-bold">0</div>
            </div>
            <div class="highscore flex justify-between">
              <div class="hs-name">11. _____</div>
              <div class="hs-score font-bold">0</div>
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
      const highscoreElements = document.getElementsByClassName('highscore');
      const highscoreTitle = document.getElementById('game-highscore-title');
      const clock = document.getElementById('clock');
      const gamesSection = document.getElementById('games');
      const gameElements = gamesSection.children;
  </script>
</body>
</html>
  `);
}

export default template;
