const express = require('express');
const app = express();
const port = 3000;

// Servir les fichiers statiques
app.use(express.static('public'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/assets/cartes', express.static(__dirname + '/assets/cartes'));
app.use('/Css', express.static(__dirname + '/Css'));
app.use('/Js', express.static(__dirname + '/Js'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

app.get('/play', (req, res) => {
  res.sendFile(__dirname + '/public/play.html');
});

app.get('/421.html', (req, res) => {
  res.sendFile(__dirname + '/public/421.html');
});


app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
