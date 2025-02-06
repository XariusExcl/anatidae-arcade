import express from 'express';
import template from './src/template.js';
import config from './config.js';
import fs from "fs";

const rudeNames = ["ASS", "FUC", "FUK", "FUQ", "FCK", "COK", "DIC", "DIK", "DIQ", "DIX", "DCK", "PNS", "PSY", "FAG", "FGT", "NGR", "NIG", "CNT", "SHT", "CUM", "CLT", "JIZ", "JZZ", "GAY", "GEI", "GAI", "VAG", "VGN", "FAP", "PRN", "JEW", "PUS", "TIT", "KYS", "KKK", "SEX", "SXX", "XXX", "NUT", "LSD", "ORL", "ANL", "PD", "SLP", "CON", "BIT", "NTM", "FDP", "ZOB", "CUL", "DTC", "BBC"];
const transpositions = { "0": "O", "1": "I", "2": "Z", "3": "E", "4": "A", "5": "S", "6": "G", "7": "T" }

const filter = (name) => {
  name.toUpperCase();
  name = name.split('').filter((char) => char !== "_").map((char) => transpositions[char] || char).join('');
  if (rudeNames.includes(name))
    return false
  else return name;
}

const writeDataFile = (game, dataObj) => {
  fs.writeFileSync(`public/${game}/data.json`, JSON.stringify(dataObj))
  return true;
}

const getGameData = (req, res) => {
  const game = req.query.game;
  if (!game) {
    res.status(400).json({ error: 'No game specified.' });
    return false;
  }
  if (!fs.existsSync(`public/${game}`)) {
    res.status(404).json({ error: 'Game not found. Does the folder exist in public/?' });
    return false;
  }
  if (!fs.existsSync(`public/${game}/data.json`)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(`public/${game}/data.json`, { encoding: 'utf-8' }));
}

// ------ FRONTEND ------
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.send(template());
});
app.use(express.static('public'))
app.use(express.static('assets'))

// ------ API ------
app.get('/api/', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;

  if (dataObj.highscores) {
    res.json({ highscores: dataObj.highscores });
  } else {
    res.json({ highscores: [] });
  }
});

app.get('/api/playcount', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;

  if (dataObj.playcount) {
    res.json({ playcount: dataObj.playcount });
  } else {
    res.json({ playcount: 0 });
  }
});

app.get('/api/extradata', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;

  if (dataObj.extradata) {
    res.json({ extradata: dataObj.extradata });
  } else {
    res.json({ extradata: {} });
  }
});

app.post('/api/', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;
  if (req.body.name === undefined || req.body.score === undefined) {
    res.status(400).json({ error: 'Name and score required in body of request.' });
    return;
  }
  if (!dataObj.highscores) {
    dataObj.highscores = [];
  }
  if (!req.body.name.match(/^[a-zA-Z0-9♥_]{3,}$/)) {
    res.status(400).json({ error: 'Name must be 3 alphanumeric characters (plus ♥_).' });
    return;
  }
  req.body.score = parseInt(req.body.score);
  if (isNaN(req.body.score)) {
    res.status(400).json({ error: 'Score must be a number.' });
    return;
  }
  const filteredName = filter(req.body.name);
  if (!filteredName) {
    res.status(400).json({ error: 'Name is not allowed.' });
    return;
  }

  const existingEntry = dataObj.highscores.find(entry => entry.name == filteredName);
  console.log(existingEntry);

  if (!existingEntry || existingEntry.score < req.body.score) {
    if (!existingEntry) {
      dataObj.highscores.push({ name: filteredName, score: req.body.score, timestamp: Date.now() });
    }
    else {
      existingEntry.score = req.body.score;
      existingEntry.timestamp = Date.now();
    }
    dataObj.highscores = dataObj.highscores.sort((a, b) => b.score - a.score);
    if (!writeDataFile(req.query.game, dataObj)) {
      res.status(500).json({ error: 'Failed to write data file.' });
      return;
    }
    res.json({ success: true });
  }
  else {
    res.json({ success: false });
  }
});

app.post('/api/playcount', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;

  if (!dataObj.playcount) {
    dataObj.playcount = 0;
  }
  dataObj.playcount++;
  if (!writeDataFile(req.query.game, dataObj)) {
    res.status(500).json({ error: 'Failed to write data file.' });
    return;
  }
  res.json({ success: true });
});

app.post('/api/extradata', (req, res) => {
  const dataObj = getGameData(req, res);
  if (!dataObj) return;

  if (!dataObj.extradata) {
    dataObj.extradata = {};
  }
  for (const key in req.body) {
    dataObj.extradata[key] = req.body[key];
  }
  if (!writeDataFile(req.query.game, dataObj)) {
    res.status(500).json({ error: 'Failed to write data file.' });
    return;
  }
  res.json({ success: true });
});

app.listen(config.port);
console.log(`👾 Anatidae-server(v${config.version}) listening on port ${config.port}.`);