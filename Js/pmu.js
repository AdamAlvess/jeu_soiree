const suits = ['trefle', 'carreau', 'coeur', 'pique'];
const values = ['roi', 'reine', 'valet', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const slotsCount = 7;
const spotsCount = 5;

const horsesContainer = document.getElementById('horses');
const cardRow = document.getElementById('cardRow');
const startBtn = document.getElementById('startBtn');

let horses = [];
let deck = [];
let spots = [];
let spotRevealed = Array(spotsCount).fill(false);
let currentCardIndex = 0;
let raceInterval = null;

let deckElement;      // pile dos
let lastCardElement;  // carte retournée visible (dernière tirée)

// Création et ajout overlay victoire
const overlay = document.createElement('div');
overlay.id = 'winnerOverlay';
overlay.style.display = 'none';
overlay.innerHTML = `
  <div class="overlay-content">
    <h2 id="winnerMessage"></h2>
    <button id="replayBtn">Rejouer</button>
    <button id="menuBtn">Menu des jeux</button>
  </div>
`;
document.body.appendChild(overlay);

// Shuffle
function shuffle(array) {
  for(let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createDeck() {
  let d = [];
  for (const suit of suits) {
    for (const val of values) {
      d.push({suit, value: val});
    }
  }
  return shuffle(d);
}

function setupRace() {
  horsesContainer.innerHTML = '';
  cardRow.innerHTML = '';
  currentCardIndex = 0;
  spotRevealed = Array(spotsCount).fill(false);
  overlay.style.display = 'none'; // cacher overlay si visible

  horses = suits.map((suit, i) => {
    const el = document.createElement('div');
    el.className = 'horse';
    el.style.backgroundImage = `url('assets/cartes/as_${suit}.png')`;
    el.style.top = `${i * 40}px`; // augmenter espacement vertical
    el.style.left = `0px`;
    horsesContainer.appendChild(el);
    return { suit, position: 0, element: el };
  });

  deck = createDeck();
  spots = deck.splice(0, spotsCount);

  // Pile dos
  deckElement = document.createElement('div');
  deckElement.className = 'card face-down';
  deckElement.style.marginRight = '20px';
  cardRow.appendChild(deckElement);

  // Dernière carte tirée (visible)
  lastCardElement = document.createElement('div');
  lastCardElement.className = 'card';
  lastCardElement.style.marginRight = '20px';
  lastCardElement.style.backgroundImage = 'none';
  cardRow.appendChild(lastCardElement);

  // Spots face cachée
  for(let i=0; i < spotsCount; i++) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card face-down';
    cardRow.appendChild(cardEl);
  }

  updateAllHorses();
}

function updateHorse(horse) {
  const trackWidth = horsesContainer.clientWidth || 800;
  const step = trackWidth / (slotsCount - 1);
  horse.element.style.left = `${horse.position * step}px`;
}
function updateAllHorses() {
  horses.forEach(updateHorse);
}

function canRevealSpot(spotIndex) {
  const pos = spotIndex + 1;
  return horses.every(h => h.position >= pos);
}

function revealSpot(index) {
  if (spotRevealed[index]) return;
  const cardEl = cardRow.children[index + 2]; // +2 car pile dos + lastCard visible
  const spot = spots[index];
  cardEl.classList.remove('face-down');
  cardEl.style.backgroundImage = `url('assets/cartes/${spot.value}_${spot.suit}.png')`;
  spotRevealed[index] = true;

  // Recule l'AS correspondant d'1 case
  const horse = horses.find(h => h.suit === spot.suit);
  if (horse && horse.position > 0) {
    horse.position--;
    updateHorse(horse);
  }
}

function playStep() {
  if (currentCardIndex >= deck.length) {
    clearInterval(raceInterval);
    startBtn.disabled = false;
    // Ne plus utiliser alert, afficher overlay victoire plus bas
    return;
  }

  const card = deck[currentCardIndex];

  // Afficher la carte tirée dans lastCardElement
  lastCardElement.style.backgroundImage = `url('assets/cartes/${card.value}_${card.suit}.png')`;
  lastCardElement.classList.remove('face-down');

  // Avancer cheval correspondant
  const horse = horses.find(h => h.suit === card.suit);
  if (horse && horse.position < slotsCount - 1) {
    horse.position++;
    updateHorse(horse);

    if (horse.position >= slotsCount - 1) {
      clearInterval(raceInterval);
      // Faire avancer la carte gagnante puis afficher overlay
      animateWinningHorse(horse);
      return;
    }
  }

  // Révéler spots si possible
  for (let i = 0; i < spotsCount; i++) {
    if (!spotRevealed[i] && canRevealSpot(i)) {
      revealSpot(i);
    }
  }

  currentCardIndex++;
}

function animateWinningHorse(horse) {
  const trackWidth = horsesContainer.clientWidth || 800;
  const step = trackWidth / (slotsCount - 1);
  // Avance d’une case finale en animation
  const finalPos = Math.min(horse.position + 1, slotsCount - 1);
  let startLeft = horse.position * step;
  let endLeft = finalPos * step;
  
  horse.position = finalPos;
  horse.element.style.transition = 'left 1s ease';
  horse.element.style.left = `${endLeft}px`;

  // Après animation, afficher overlay
  setTimeout(() => {
    showWinnerOverlay(horse.suit);
  }, 1100);
}

function showWinnerOverlay(suit) {
  const winnerMessage = document.getElementById('winnerMessage');
  winnerMessage.textContent = `L'as de ${suit.toUpperCase()} a gagné ! 🏆`;
  overlay.style.display = 'flex';
  startBtn.disabled = false;
}

startBtn.addEventListener('click', () => {
  setupRace();
  startBtn.disabled = true;
  raceInterval = setInterval(playStep, 1000);
});

// Boutons overlay
document.body.addEventListener('click', (e) => {
  if (e.target.id === 'replayBtn') {
    window.location.href = 'pmu.html';
  }
  if (e.target.id === 'menuBtn') {
    window.location.href = 'play.html';
  }
});

setupRace();
