// autoroute.js

const cardValues = ['roi', 'reine', 'valet', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'as'];
const suits = ["pique", "coeur", "carreau", "trefle"];

let deck = [];
let currentPosition = 0;

const road = document.getElementById("road");
const drawCardBtn = document.getElementById("drawCardBtn");
const correctBtn = document.getElementById("correctBtn");
const wrongBtn = document.getElementById("wrongBtn");
const resultButtons = document.getElementById("resultButtons");
const failPopup = document.getElementById("failPopup");
const failText = document.getElementById("failText");
const failOkBtn = document.getElementById("failOkBtn");
const winPopup = document.getElementById("winPopup");
const playerIcon = document.getElementById("playerIcon");
const cardDeck = document.getElementById("cardDeck");


function setupDeck() {
  deck = [];
  for (let suit of suits) {
    for (let val of cardValues) {
      deck.push({ val, suit });
    }
  }
  shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function setupTrack() {
  road.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const cardSlot = document.createElement("div");
    cardSlot.className = "card-slot";
    // Afficher les 5 cartes face visible au départ (tirées du deck)
    const initialCard = deck.pop();
    const fileName = `${initialCard.val.toLowerCase()}_${initialCard.suit}.png`;
    cardSlot.innerHTML = `<img src="assets/cartes/${fileName}" class="card-image">`;
    road.appendChild(cardSlot);
  }
  updatePlayerPosition();
}

function updatePlayerPosition() {
  const slots = document.querySelectorAll(".card-slot");
  const slot = slots[currentPosition];
  if (slot) {
    playerIcon.style.left = `${slot.offsetLeft + slot.offsetWidth / 2 - 10}px`;
  }
}

// Animation flip pour retourner la carte tirée
function showCardAtCurrentPosition() {
  if (deck.length === 0) return;

  const card = deck.pop();
  const slots = document.querySelectorAll(".card-slot");
  const slot = slots[currentPosition];
  const fileName = `${card.val.toLowerCase()}_${card.suit}.png`;

  // Supprime la carte tirée précédente si existante
  const oldDrawn = slot.querySelector(".drawn");
  if (oldDrawn) oldDrawn.remove();

  // Crée un conteneur pour la carte avec effet flip
  const flipContainer = document.createElement("div");
  flipContainer.className = "flip-container drawn";

  // Face dos de carte
  const cardBack = document.createElement("img");
  cardBack.src = "assets/cartes/back_card.png";
  cardBack.className = "card-image card-back";

  // Face visible
  const cardFront = document.createElement("img");
  cardFront.src = `assets/cartes/${fileName}`;
  cardFront.alt = `${card.val} de ${card.suit}`;
  cardFront.className = "card-image card-front";

  flipContainer.appendChild(cardBack);
  flipContainer.appendChild(cardFront);

  slot.appendChild(flipContainer);

  setTimeout(() => {
    flipContainer.classList.add("flipped");
  }, 0);

  drawCardBtn.style.display = "none";
  resultButtons.classList.add("show");
}

drawCardBtn.addEventListener("click", () => {
  if (currentPosition >= 5) return;
  showCardAtCurrentPosition();
});

correctBtn.addEventListener("click", () => {
  currentPosition++;    
  if (currentPosition === 5) {
    winPopup.style.display = "flex";
  } else {
    updatePlayerPosition();
    drawCardBtn.style.display = "inline-block";
    resultButtons.classList.remove("show");

  }
});

wrongBtn.addEventListener("click", () => {
  const gorgées = currentPosition + 1;
  failText.textContent = `Raté ! Bois ${gorgées} gorgée${gorgées > 1 ? 's' : ''} !`;
  failPopup.style.display = "flex";
});

failOkBtn.addEventListener("click", () => {
  failPopup.style.display = "none";
  currentPosition = 0;
  setupDeck();
  setupTrack();
  drawCardBtn.style.display = "inline-block";
  resultButtons.classList.remove("show");

});
// Quand on tire une carte
document.getElementById("drawCardBtn").addEventListener("click", () => {
  // Afficher les boutons "Bonne réponse" et "Mauvaise réponse"
  document.getElementById("resultButtons").classList.add("show");
});
document.getElementById("correctBtn").addEventListener("click", () => {
  // Masquer les boutons
  document.getElementById("resultButtons").classList.remove("show");
});

// Init
setupDeck();
setupTrack();
