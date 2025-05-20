// Données règles pour chaque carte (valeur + règle)
const cardRules = {
  "A": "Cul sec ! 🥂",
  "2": "Tu dois boire 2 gorgées.",
  "3": "Tu dois boire 3 gorgées.",
  "4": "Le dernier qui dit « For to the floor » avec le doigt vers le bas boit une gorgée.",
  "5": "Le dernier qui dit « Five to the sky » avec le doigt vers le haut boit une gorgée.",
  "6": "Règle « Dans ma valise ». ",
  "7": "Maître de la question : les joueurs répondant à une question boivent, si quelqu'un répond « Ta gueule! », c'est le maître qui boit.",
  "8": "Tu distribues 8 gorgées à répartir.",
  "9": "J'ai déjà ou j'ai jamais.",
  "10": "Maître du Freez : quand tu arrêtes de bouger, le dernier qui bouge boit.",
  "J": "Un thème ! Le joueur qui bloque ou répète boit.",
  "Q": "Tout le monde boit.",
  "K": "Tu inventes une règle.",
};

// Correspondance symbole -> nom dossier pour les images
const suitMap = {
  "♠": "pique",
  "♥": "coeur",
  "♦": "carreau",
  "♣": "trefle"
};

const suits = ["♠", "♥", "♦", "♣"];
const deckValues = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let players = [];
let currentPlayerIndex = 0;
let deck = [];
let drawnCards = [];

const playerNameInput = document.getElementById("playerNameInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playersList = document.getElementById("playersList");
const gameArea = document.getElementById("gameArea");
const circleDeck = document.getElementById("circleDeck");
const currentPlayerDisplay = document.getElementById("currentPlayer");
const drawCardBtn = document.getElementById("drawCardBtn");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");
const stopGameBtn = document.getElementById("stopGameBtn");
const rulePopup = document.getElementById("rulePopup");
const popupPlayerName = document.getElementById("popupPlayerName");
const popupRuleText = document.getElementById("popupRuleText");
const closePopupBtn = document.getElementById("closePopupBtn");

// Image dos carte
const cardBackImage = "assets/cartes/back_card.png";

// Ajout joueur
addPlayerBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if(name && !players.includes(name)) {
    players.push(name);
    updatePlayersList();
    playerNameInput.value = "";
    startGameBtn.disabled = players.length < 2;
  }
});

// Supprimer joueur dans la liste
playersList.addEventListener("click", (e) => {
  if(e.target.tagName === "BUTTON") {
    const name = e.target.dataset.name;
    players = players.filter(p => p !== name);
    updatePlayersList();
    startGameBtn.disabled = players.length < 2;
  }
});

function updatePlayersList() {
  playersList.innerHTML = players.map(name =>
    `<li>${name} <button data-name="${name}">x</button></li>`
  ).join("");
}

// Démarrer partie
startGameBtn.addEventListener("click", () => {
  startGameBtn.disabled = true;
  addPlayerBtn.disabled = true;
  playerNameInput.disabled = true;
  setupDeck();
  currentPlayerIndex = 0;
  showCurrentPlayer();
  renderDeck();
  gameArea.style.display = "block";
  drawCardBtn.disabled = false;
  nextPlayerBtn.style.display = "none";
});

// Créer deck 52 cartes
function setupDeck() {
  deck = [];
  drawnCards = [];
  for(let suit of suits) {
    for(let val of deckValues) {
      deck.push({suit, val});
    }
  }
  shuffle(deck);
}

// Shuffle deck
function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Affiche joueur courant
function showCurrentPlayer() {
  currentPlayerDisplay.textContent = `Joueur actuel : ${players[currentPlayerIndex]}`;
}

// Affiche le deck en cercle avec dos des cartes
function renderDeck() {
  circleDeck.innerHTML = "";
  const cardsLeft = deck.length;
  const radius = 150;

  for(let i = 0; i < cardsLeft; i++) {
    const angle = (i / cardsLeft) * 360;
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);

    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;

    // Image dos carte
    const img = document.createElement("img");
    img.src = cardBackImage;
    img.alt = "Dos carte";
    img.className = "card-image";

    cardDiv.appendChild(img);
    circleDeck.appendChild(cardDiv);
  }
}

// Tirer une carte
drawCardBtn.addEventListener("click", () => {
  if(deck.length === 0) {
    alert("Plus de cartes ! Le jeu est terminé.");
    return;
  }
  const card = deck.pop();
  drawnCards.push(card);
  renderDeck(); // Met à jour le cercle avec les dos

  // Affiche la carte tirée visible
  showDrawnCard(card);

  // Affiche popup règle
  popupPlayerName.textContent = `${players[currentPlayerIndex]} a tiré : ${card.val} de ${suitMap[card.suit]}`;
  popupRuleText.textContent = cardRules[card.val] || "Carte inconnue.";
  rulePopup.style.display = "flex";

  drawCardBtn.disabled = true;
  nextPlayerBtn.style.display = "inline-block";
});

// Fonction pour afficher la carte tirée visible
function showDrawnCard(card) {
  let drawnCardContainer = document.getElementById("drawnCardContainer");
  if(!drawnCardContainer) {
    drawnCardContainer = document.createElement("div");
    drawnCardContainer.id = "drawnCardContainer";
    drawnCardContainer.style.margin = "20px auto";
    drawnCardContainer.style.width = "120px";
    drawnCardContainer.style.height = "180px";
    drawnCardContainer.style.textAlign = "center";
    gameArea.insertBefore(drawnCardContainer, currentPlayerDisplay.nextSibling);
  }
  
  drawnCardContainer.innerHTML = "";

  const img = document.createElement("img");
  img.alt = `${card.val} de ${suitMap[card.suit]}`;
  img.className = "card-image";
  // Format nom fichier : A_pique.png (majuscule carte avec underscore)
  const fileName = `${card.val}_${suitMap[card.suit]}.png`; 
  img.src = `assets/cartes/${fileName}`;

  drawnCardContainer.appendChild(img);
}

// Fermer popup règle
closePopupBtn.addEventListener("  ", () => {
  rulePopup.style.display = "none";
});

// Joueur suivant
nextPlayerBtn.addEventListener("click", () => {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  showCurrentPlayer();
  drawCardBtn.disabled = false;
  nextPlayerBtn.style.display = "none";

  if(deck.length === 0) {
    alert("Plus de cartes ! Le jeu est terminé.");
    drawCardBtn.disabled = true;
    nextPlayerBtn.style.display = "none";
  }
});

// Arrêt du jeu
stopGameBtn.addEventListener("click", () => {
  window.location.href = "play.html";
});
