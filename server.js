import express from 'express';
import compression from 'compression';
import cors from 'cors';
import template from './src/template.js';
import config from './config.js';

// compress all responses
const app = express();
app.use(compression())
app.use(express.json());
app.use(cors());

/*
app.use(config.staticUrl, serveIndex('public', {
  icons: true,
  view: 'details',
  template: template
}));
*/
app.get ('/', (req, res) => {
  res.send(template());
});
app.use(express.static('public'))
app.use(express.static('assets'))
app.listen(config.port);
console.log(`👾 Arcade listening on port ${config.port}.`);