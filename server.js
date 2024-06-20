import express from 'express';
import template from './src/template.js';
import config from './config.js';

const app = express();
app.use(express.json());
app.get ('/', (req, res) => {
  res.send(template());
});
app.use(express.static('public'))
app.use(express.static('assets'))
app.listen(config.port);
console.log(`👾 Arcade listening on port ${config.port}.`);