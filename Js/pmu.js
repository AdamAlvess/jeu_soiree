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

// Crée un élément pour la pile face cachée
let deckElement;

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

  horses = suits.map((suit, i) => {
    const el = document.createElement('div');
    el.className = 'horse';
    el.style.backgroundImage = `url('assets/cartes/as_${suit}.png')`;
    el.style.top = `${i * 22}px`;
    el.style.left = `0px`;
    horsesContainer.appendChild(el);
    return { suit, position: 0, element: el };
  });

  deck = createDeck();

  spots = deck.splice(0, spotsCount);

  // Afficher la pile (face dos) à gauche des spots
  deckElement = document.createElement('div');
  deckElement.className = 'card face-down';
  deckElement.style.marginRight = '20px';
  cardRow.appendChild(deckElement);

  // Afficher les spots alignés à côté de la pile
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
  const cardEl = cardRow.children[index + 1]; // +1 car le 1er enfant est la pile dos
  const spot = spots[index];
  cardEl.classList.remove('face-down');
  cardEl.style.backgroundImage = `url('assets/cartes/${spot.value}_${spot.suit}.png')`;
  spotRevealed[index] = true;

  // Recule l'AS de la couleur révélée d'1 case
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
    alert('Fin du deck, la course est terminée !');
    return;
  }

  const card = deck[currentCardIndex];

  // Avancer l'AS correspondant à la couleur tirée
  const horse = horses.find(h => h.suit === card.suit);
  if (horse && horse.position < slotsCount - 1) {
    horse.position++;
    updateHorse(horse);

    if (horse.position >= slotsCount - 1) {
      clearInterval(raceInterval);
      alert(`Le cheval ${horse.suit.toUpperCase()} a gagné !`);
      startBtn.disabled = false;
      return;
    }
  }

  // Dévoiler les spots si possible
  for (let i = 0; i < spotsCount; i++) {
    if (!spotRevealed[i] && canRevealSpot(i)) {
      revealSpot(i);
    }
  }

  currentCardIndex++;
}

function startRace() {
  setupRace();
  startBtn.disabled = true;
  raceInterval = setInterval(playStep, 1000);
}

startBtn.addEventListener('click', startRace);
setupRace();
