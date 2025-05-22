const playerInput = document.getElementById("playerNameInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playersList = document.getElementById("playersList");
const gameArea = document.getElementById("gameArea");
const pyramidZone = document.getElementById("pyramid");
const nextBtn = document.getElementById("nextCardBtn");
const liarBtn = document.getElementById("accuseBtn");
const infoZone = document.getElementById("infoZone");
const endButtons = document.getElementById("endButtons");
const accusationArea = document.getElementById("accusationArea");
const accusationForm = document.getElementById("accusationForm");
const validateAccuseBtn = document.getElementById("validateAccuse");
const playerCardsArea = document.getElementById("playerCardsArea");
const transitionScreen = document.getElementById("transitionScreen");
const transitionMessage = document.getElementById("playerNameDisplay");
const countdownEl = document.getElementById("countdown");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");

let players = [];
let deck = [];
let pyramid = [];
let currentCardIndex = 0;
let distributedCards = {};
let distributionIndex = 0;


// Ajouter un joueur
addPlayerBtn.addEventListener("click", () => {
  const name = playerInput.value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    const li = document.createElement("li");
    li.textContent = name;
    playersList.appendChild(li);
    playerInput.value = "";
    if (players.length >= 2) startGameBtn.disabled = false;
  }
});

// Démarrer le jeu
startGameBtn.addEventListener("click", prepareGame);

// Afficher la prochaine carte de la pyramide
nextBtn.addEventListener("click", showNextCard);

// Bouton Menteur
liarBtn.addEventListener("click", () => {
  showAccusationForm();
});


// Valider accusation
validateAccuseBtn.addEventListener("click", handleAccusation);

// Relancer une partie
document.getElementById("restartBtn").addEventListener("click", () => location.reload());

// Bouton joueur suivant (distribution des cartes)
// *** Important : écouter une seule fois ici ***
nextPlayerBtn.addEventListener("click", () => {
  playerCardsArea.innerHTML = "";
  distributionIndex++;
  if (distributionIndex >= players.length) {
    // Toutes les cartes distribuées, commencer la pyramide
    transitionScreen.style.display = "none";
    pyramid = deck.splice(0, 36);
    drawPyramid();
    playerCardsArea.innerHTML = "<p>Distribution terminée. Le jeu commence !</p>";
    nextPlayerBtn.style.display = "none";
  } else {
    showNextTransition();
  }
});

// Création du paquet de cartes
function createDeck(count = 1) {
  const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "valet", "reine", "roi", "as"];
  const suits = ["coeur", "carreau", "pique", "trefle"];
  let fullDeck = [];
  for (let n = 0; n < count; n++) {
    for (const value of values) {
      for (const suit of suits) {
        fullDeck.push(`${value}_${suit}`);
      }
    }
  }
  return shuffle(fullDeck);
}

// Préparation du jeu : distribution des cartes + mise en place
function prepareGame() {
  playersList.innerHTML = "";
  pyramidZone.innerHTML = "";
  infoZone.textContent = "";
  playerCardsArea.innerHTML = "";
  endButtons.style.display = "none";
  accusationArea.style.display = "none";
  gameArea.style.display = "block";
  nextPlayerBtn.style.display = "none";
  currentCardIndex = 0;
  distributionIndex = 0;

  const neededCards = players.length * 4 + 36;
  const nbDecks = Math.ceil(neededCards / 52);
  deck = createDeck(nbDecks);
  distributedCards = {};

  // Distribuer 4 cartes à chaque joueur dès maintenant
  players.forEach(p => {
    distributedCards[p] = deck.splice(0, 4);
  });

  showNextTransition();
}

// Transition pour chaque joueur avant qu’il voie ses cartes
function showNextTransition() {
  if (distributionIndex >= players.length) {
    return; // distribution terminée, gérer via nextPlayerBtn
  }

  const player = players[distributionIndex];
  transitionScreen.style.display = "flex";
  transitionMessage.textContent = player;
  countdownEl.textContent = "3";

  let count = 3;
  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count === 0) {
      clearInterval(interval);
      transitionScreen.style.display = "none";
      showPlayerCards();
    }
  }, 1000);
}

// Affiche les 4 cartes du joueur actuel
function showPlayerCards() {
  const player = players[distributionIndex];
  const cards = distributedCards[player];

  playerCardsArea.innerHTML = `<h3>${player}, mémorise tes cartes :</h3>`;
  const row = document.createElement("div");
  row.className = "reveal-cards";

  cards.forEach(card => {
    const img = document.createElement("img");
    img.src = `assets/cartes/${card}.png`;
    row.appendChild(img);
  });

  playerCardsArea.appendChild(row);

  nextPlayerBtn.textContent = distributionIndex === players.length - 1 ? "Terminer la distribution" : "Passer au joueur suivant";
  nextPlayerBtn.style.display = "inline-block";
}

// Dessine la pyramide avec cartes faces cachées
function drawPyramid() {
  let index = 0;
  pyramidZone.innerHTML = ""; // Nettoyer la zone

  for (let row = 8; row >= 1; row--) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "pyramid-row";
    for (let i = 0; i < row; i++) {
      const img = document.createElement("img");
      img.src = "assets/cartes/back_card.png";
      img.classList.add("card");
      img.dataset.index = index++;
      rowDiv.appendChild(img);
    }
    pyramidZone.appendChild(rowDiv);
  }
}

function showPopup(player, message) {
  document.getElementById("popupPlayerName").textContent = player;
  document.getElementById("popupRuleText").textContent = message;
  document.getElementById("rulePopup").style.display = "flex";
}

document.getElementById("closePopupBtn").addEventListener("click", () => {
  document.getElementById("rulePopup").style.display = "none";
});


// Affiche la carte suivante de la pyramide
function showNextCard() {
  if (currentCardIndex >= pyramid.length) return;

  const cardValue = pyramid[currentCardIndex].split("_")[0];
  const cardEl = document.querySelector(`[data-index='${currentCardIndex}']`);
  if (cardEl) {
    cardEl.src = `assets/cartes/${pyramid[currentCardIndex]}.png`;
    infoZone.textContent = `Carte: ${cardValue} (étage ${getPyramidLevel(currentCardIndex)})`;
  }

  currentCardIndex++;
  if (currentCardIndex >= pyramid.length) {
    nextBtn.disabled = true;
    liarBtn.disabled = true;
    endButtons.style.display = "flex";
  }
}

// Récupère le niveau (étage) dans la pyramide à partir de l’index carte
function getPyramidLevel(index) {
  const levels = [8, 7, 6, 5, 4, 3, 2, 1]; // Étages de haut en bas
  let total = 0;

  for (let level = 1; level <= levels.length; level++) {
    total += levels[level - 1];
    if (index < total) return level; // Level 1 = haut, Level 8 = bas
  }

  return 8; // Par défaut
}


// Affiche le formulaire d’accusation
function showAccusationForm() {
  accusationForm.innerHTML = "";
  players.forEach(player => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = player;
    label.appendChild(checkbox);
    label.append(` ${player}`);
    accusationForm.appendChild(label);
  });
  accusationArea.style.display = "block";
}

// Gère la validation de l’accusation
function handleAccusation() {
  const selected = Array.from(accusationForm.querySelectorAll("input:checked")).map(cb => cb.value);
  if (selected.length === 0) return;

  const cardValue = pyramid[currentCardIndex - 1].split("_")[0];
  const level = getPyramidLevel(currentCardIndex - 1); // C’est bien le niveau pyramide, 1 à 8

  selected.forEach(name => {
    const hasCard = distributedCards[name].some(card => card.startsWith(cardValue));
    if (!hasCard) {
      if (level === 8) {
        showPopup(name, `a menti ! Il boit un CUL SEC.`);
      } else {
        showPopup(name, `a menti ! Il boit ${2 * level} gorgées.`);
      }
    } else {
      revealCards(name, cardValue, level);
    }
  });

  accusationArea.style.display = "none";
}

function revealCards(player, cardValue, level) {
  const cards = distributedCards[player];
  const container = document.createElement("div");
  container.className = "reveal-cards";
  container.innerHTML = `<h3>${player}, clique sur une carte pour la retourner :</h3>`;

  let revealed = false;

  cards.forEach(card => {
    const img = document.createElement("img");
    img.src = "assets/cartes/back_card.png";
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      if (revealed) return;

      img.src = `assets/cartes/${card}.png`;
      revealed = true;

      if (card.startsWith(cardValue)) {
        const message = level === 8
          ? `disait la vérité ! L'accusateur boit un CUL SEC.`
          : `disait la vérité ! L'accusateur boit ${2 * level} gorgées.`;
        showPopup(player, message);
      } else {
        const message = level === 8
          ? "a menti ! Il boit un CUL SEC."
          : `a menti ! Il boit ${2 * level} gorgées.`;
        showPopup(player, message);
      }

      setTimeout(() => {
        container.remove();
      }, 500);
    });

    container.appendChild(img);
  });

  playerCardsArea.appendChild(container);
}



// Mélange un tableau (Fisher-Yates)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
