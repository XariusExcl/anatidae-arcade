import express from 'express';
import template from './src/template.js';
import config from './config.js';
import fs from "fs";

const rudeNames = ["ASS","FUC","FUK","FUQ","FCK","COK","DIC","DIK","DIQ","DIX","DCK","PNS","PSY","FAG","FGT","NGR","NIG","CNT","SHT","CUM","CLT","JIZ","JZZ","GAY","GEI","GAI","VAG","VGN","FAP","PRN","JEW","PUS","TIT","KYS","KKK","SEX","SXX","XXX","NUT","LSD","ORL","ANL","PD","SLP","CON","BIT","NTM"];
const transpositions = {"0":"O", "1":"I", "2":"Z", "3":"E", "4":"A", "5":"S", "6":"G", "7":"T"}

const filter = (name) => {
  name.toUpperCase();
  name = name.split('').filter((char) => char !== "_").map((char) => transpositions[char] || char).join('');
  if (rudeNames.includes(name))
    return false
  else return true;
}

const app = express();
app.use(express.json());
app.get ('/', (req, res) => {
  res.send(template());
});
app.use(express.static('public'))
app.use(express.static('assets'))

// Highscores API
app.get('/api/', (req, res) => {
  const game = req.query.game;
  if (!game) {
    res.status(400).json({error:'No game specified.'});
    return;
  } 
  if (!fs.existsSync(`public/${game}`)) {
    res.status(404).json({error:'Game not found.'});
    return;
  }
  if (!fs.existsSync(`public/${game}/info.json`)) {
    res.status(404).json({error:'info.json not found'});
    return;
  }
  fs.readFile(`public/${game}/info.json`, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const dataObj = JSON.parse(data.toString());
      if (dataObj.highscores) {
        res.json({highscores:dataObj.highscores});
      } else {
        res.json({highscores:{}});
      }
    }
  }); 
});

app.post('/api/', (req, res) => {
  const game = req.query.game;
  if (!game) {
    res.status(400).json({error:'No game specified.'});
    return;
  }
  if (!fs.existsSync(`public/${game}`)) {
    res.status(404).json({error:'Game not found.'});
    return;
  }
  if (req.body.name === undefined || req.body.score === undefined) {
    res.status(400).json({error:'Name and score required in body of request.'});
    return;
  }
  if (!fs.existsSync(`public/${game}/info.json`)) {
    res.status(404).json({error:'info.json not found'});
    return;
  }
  fs.readFile(`public/${game}/info.json`, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const dataObj = JSON.parse(data.toString());
      if (!dataObj.highscores) {
        dataObj.highscores = {};
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

      if (!dataObj.highscores[filteredName] || dataObj.highscores[filteredName] < req.body.score) {
        dataObj.highscores[filteredName] = req.body.score;
        // Order highscores by score
        dataObj.highscores = Object.fromEntries(Object.entries(dataObj.highscores).sort((a, b) => b[1] - a[1]));
        fs.writeFile(`public/${game}/info.json`, JSON.stringify(dataObj), (err) => {
          if (err) {
            console.log(err);
          } else {
            res.json({success:true});
          }
        });
      } else {
        res.json({success:false});
      }
    }
  });
});

app.listen(config.port);
console.log(`👾 Arcade listening on port ${config.port}.`);