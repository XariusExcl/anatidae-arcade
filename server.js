import express from 'express';
import template from './src/template.js';
import config from './config.js';
import fs from "fs";  

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
  if (!req.body.name || !req.body.score) {
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
      // Set name to uppercase
      req.body.name = req.body.name.toUpperCase();

      if (!dataObj.highscores[req.body.name] || dataObj.highscores[req.body.name] < req.body.score) {
        dataObj.highscores[req.body.name] = req.body.score;
        console.log(dataObj.highscores);
        // Order highscores by score
        dataObj.highscores = Object.fromEntries(Object.entries(dataObj.highscores).sort(([,a],[,b]) => b-a));
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