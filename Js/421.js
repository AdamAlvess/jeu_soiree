// --- Variables globales ---
const players = [];
let gameStarted = false;
let currentPlayerIndex = 0;
let rollCount = 0;
let maxRolls = 3;
let maxRollsForAll = 3;
let diceValues = [0, 0, 0];
let selectedDice = [false, false, false];
let gorgées = {};
let culSec = {};
let joueurSorti = new Set();
let roundResults = [];
let savedPlayers = [];
let savedPerdant = null;
let maxRollsForAllSet = false; // variable globale à ajouter en haut avec les autres

// Références DOM fixes
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const startGameBtn = document.getElementById('startGameBtn');
const playersList = document.getElementById('playersList');
const gameArea = document.getElementById('gameArea');
const addPlayerSection = document.getElementById('addPlayerSection');

// Références DOM dynamiques
let currentPlayerDisplay, diceEls, rollBtn, validateBtn, gameInfo, gorgeCountSpan, culSecCountSpan;

// Fonctions
function addPlayer() {
  let name = playerNameInput.value.trim();
  if (!name) return alert("Entrez un nom valide.");
  if (players.includes(name)) return alert("Nom déjà ajouté.");
  players.push(name);
  gorgées[name] = 0;
  culSec[name] = 0;
  playerNameInput.value = '';
  renderPlayers();
  startGameBtn.disabled = players.length < 2;
}

function renderPlayers() {
  playersList.innerHTML = '';
  players.forEach((p, i) => {
    if (joueurSorti.has(p)) return;
    const li = document.createElement('li');
    li.textContent = p;
    const btn = document.createElement('button');
    btn.textContent = 'x';
    btn.onclick = () => {
      if (gameStarted) return alert("Le jeu a commencé.");
      players.splice(i, 1);
      delete gorgées[p];
      delete culSec[p];
      renderPlayers();
      startGameBtn.disabled = players.length < 2;
    };
    li.appendChild(btn);
    playersList.appendChild(li);
  });
}

function renderGameUIFromTemplate() {
  const template = document.getElementById('gameTemplate');
  const clone = template.content.cloneNode(true);
  gameArea.innerHTML = '';
  gameArea.appendChild(clone);

  // Re-référencement des éléments dynamiques
  currentPlayerDisplay = document.getElementById('currentPlayer');
  diceEls = document.querySelectorAll('.die');
  rollBtn = document.getElementById('rollBtn');
  validateBtn = document.getElementById('validateBtn');
  gameInfo = document.getElementById('gameInfo');
  gorgeCountSpan = document.getElementById('gorgeCount');
  culSecCountSpan = document.getElementById('culSecCount');

  // Réattacher les événements
  rollBtn.addEventListener('click', rollDice);
  validateBtn.addEventListener('click', validerTour);

  diceEls.forEach(die => {
    die.addEventListener('click', () => {
      if (rollCount === 0 || rollCount >= maxRolls) return;
      let idx = parseInt(die.dataset.index);
      selectedDice[idx] = !selectedDice[idx];
      die.classList.toggle('selected');
    });
  });
}

function startGame() {
  if (players.length < 2) return alert("Il faut au moins 2 joueurs.");
  gameStarted = true;
  currentPlayerIndex = 0;
  maxRollsForAll = 3;
  joueurSorti.clear();
  roundResults = [];

  gameArea.style.display = 'block';
  addPlayerSection.style.display = 'none';
  playersList.style.display = 'none';

  renderGameUIFromTemplate();
  updateUIForNewTurn();
}

function updateUIForNewTurn() {
  const currentPlayer = players[currentPlayerIndex];
  currentPlayerDisplay.textContent = `Tour de : ${currentPlayer}`;
  rollCount = 0;
  maxRolls = maxRollsForAll;
  gameInfo.textContent = `Lancer ${rollCount} / ${maxRolls}`;
  diceValues = [0, 0, 0];
  selectedDice = [false, false, false];
  diceEls.forEach(die => {
    die.textContent = '-';
    die.classList.remove('selected');
  });
  rollBtn.disabled = false;
  validateBtn.style.display = 'none';
  updateCounters();
}

function updateCounters() {
  gorgeCountSpan.textContent = Object.values(gorgées).reduce((a, b) => a + b, 0);
  culSecCountSpan.textContent = Object.values(culSec).reduce((a, b) => a + b, 0);
}

function rollDice() {
  if (rollCount >= maxRolls) return;
  for (let i = 0; i < 3; i++) {
    if (!selectedDice[i]) {
      diceValues[i] = Math.floor(Math.random() * 6) + 1;
      diceEls[i].textContent = diceValues[i];
    }
  }
  rollCount++;
  gameInfo.textContent = `Lancer ${rollCount} / ${maxRolls}`;
  if (rollCount >= 1) validateBtn.style.display = 'inline-block';
  if (rollCount === maxRolls) rollBtn.disabled = true;
}

function evalCombo(d) {
  d = [...d].sort((a, b) => b - a);
  const count = {};
  d.forEach(n => count[n] = (count[n] || 0) + 1);

  if (d.includes(4) && d.includes(2) && d.includes(1)) return { name: "421", gorgées: 0, culSec: 1, sorti: false, text: "Cul sec !" };
  if (count[1] === 2 && Object.keys(count).length === 2) return { name: "Fiches", gorgées: d.find(v => v !== 1), culSec: 0, sorti: false, text: "Distribue des gorgées" };
  if (Object.values(count).includes(3)) return { name: "Brelan", gorgées: d[0], culSec: 0, sorti: false, text: "Distribue des gorgées" };
  if ((d[0] === d[1] + 1) && (d[1] === d[2] + 1)) return { name: "Tierce", gorgées: 2, culSec: 0, sorti: false, text: "Distribue 2 gorgées" };
  if (count[2] === 2 && count[1] === 1) return { name: "Nénette", gorgées: 0, culSec: 0, sorti: true, text: "Nénette - Sortie !" };
  return { name: "Rien", gorgées: 0, culSec: 0, sorti: false, text: "Rien" };
}



function validerTour() {
  rollBtn.disabled = true;
  validateBtn.style.display = 'none';

  const currentPlayer = players[currentPlayerIndex];
  const combo = evalCombo(diceValues);
  roundResults.push({ player: currentPlayer, combo, dices: [...diceValues] });

  // Ne fixer la limite que si ce n'est pas encore fait ET si on est au premier joueur du tour
  if (!maxRollsForAllSet) {
    maxRollsForAll = rollCount;
    maxRollsForAllSet = true;
  }
  // Pour les autres joueurs, on ne modifie pas maxRollsForAll

  if (combo.name === "Fiches" || combo.name === "Brelan" || combo.name === "Tierce") {
    gorgées[currentPlayer] += combo.gorgées;
  }
  if (combo.name === "421") {
    culSec[currentPlayer] += 1;
  }
  if (combo.name === "Nénette") {
    joueurSorti.add(currentPlayer);
    alert(`${currentPlayer} est sorti !`);
  }

  updateCounters();

  const joueursRestants = players.filter(p => !joueurSorti.has(p));
  if (roundResults.length === joueursRestants.length) {
    const joueursAvecRien = roundResults.filter(r => r.combo.name === "Rien");

    if (joueursAvecRien.length > 0) {
      let perdant = null;
      let plusPetiteValeur = null;

      joueursAvecRien.forEach(r => {
        const sorted = [...r.dices].sort((a, b) => b - a).join('');
        if (!plusPetiteValeur || sorted < plusPetiteValeur) {
          plusPetiteValeur = sorted;
          perdant = r.player;
        }
      });

      afficherFinTourPerdant(perdant);
      return;
    }

    roundResults = [];
    // Reset maxRollsForAll à 3 au début d'un nouveau tour complet
    maxRollsForAll = 3;
    maxRollsForAllSet = false; // réinitialisation de la variable pour le nouveau tour
  }

  nextPlayer();
  updateUIForNewTurn();
}



function nextPlayer() {
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } while (joueurSorti.has(players[currentPlayerIndex]));
}

function afficherFinTourPerdant(perdant) {
  savedPlayers = [...players];
  savedPerdant = perdant;

  gameArea.innerHTML = `
    <h2>${perdant} a perdu ce tour !</h2>
    <button class="btn" onclick="rejouerMemeJoueurs()">Rejouer</button>
    <button class="btn" onclick="location.reload()">Changer les joueurs</button>
    <a href="/play"><button class="btn" >Menu des jeux</button></a>
  `;
}

function rejouerMemeJoueurs() {
  gameStarted = true;
  players.length = 0;
  gorgées = {};
  culSec = {};
  joueurSorti = new Set();
  roundResults = [];

  savedPlayers.forEach(p => {
    players.push(p);
    gorgées[p] = 0;
    culSec[p] = 0;
  });

  currentPlayerIndex = players.indexOf(savedPerdant);
  maxRollsForAll = 3;

  gameArea.style.display = 'block';
  renderGameUIFromTemplate();
  updateUIForNewTurn();
}

// Événements initiaux
addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keypress', e => { if (e.key === 'Enter') addPlayer(); });
startGameBtn.addEventListener('click', startGame);

// Afficher les joueurs initiaux
renderPlayers();
