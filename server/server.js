import 'dotenv/config';
import express from 'express';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { Liquid } from 'liquidjs';
import sirv from 'sirv';


const engine = new Liquid({
  extname: '.liquid',
});

const app = new App();
const apiKey = process.env.API_KEY;
const apiUrl = `https://www.worldcoinindex.com/apiservice/json?key=${apiKey}`;


app.get('/', async (req, res) => {
  const crypto = await fetch(apiUrl);
  const cryptoData = await crypto.json();

  const coinsToShow = ['cardano', 'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin', 'solana', 'chainlink', 'dogecoin', 'vechain'];
  const selectedCoins = cryptoData.Markets.filter((coin) =>
    coinsToShow.includes(coin.Name.toLowerCase())
  );

  const coinArray = selectedCoins.map(coin => ({
    name: coin.Name.toLowerCase(),
    coin: coin
  }));

  return res.send(renderTemplate('server/views/index.liquid', { coinArray }));
});


app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let previousData = null;

  const sendUpdate = async () => {
    try {
      const crypto = await fetch(apiUrl);
      const cryptoData = await crypto.json();

      const coinsToShow = ['cardano', 'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin', 'solana', 'chainlink', 'dogecoin', 'vechain'];
      const selectedCoins = cryptoData.Markets.filter((coin) =>
        coinsToShow.includes(coin.Name.toLowerCase())
      );

      const simplified = selectedCoins.map((coin) => ({
        name: coin.Name.toLowerCase(),
        price: coin.Price_eur,
        price_usd: coin.Price_usd,
        price_btc: coin.Price_btc,
        price_cny: coin.Price_cny,
        price_gbp: coin.Price_gbp,
        price_rur: coin.Price_rur,
      }));

      const isDifferent = JSON.stringify(simplified) !== JSON.stringify(previousData);

      if (isDifferent) {
        console.log(`[${new Date().toISOString()}] Prijzen verstuurd:`, simplified);
        res.write(`data: ${JSON.stringify(simplified)}\n\n`);
        previousData = simplified;
      } else {
        console.log(`[${new Date().toISOString()}] Geen prijswijziging`);
      }

    } catch (err) {
      console.error('Fout bij ophalen van crypto-data:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Fout bij ophalen van data' })}\n\n`);
    }
  };

  sendUpdate();
  const interval = setInterval(sendUpdate, 60000); 

  req.on('close', () => {
    clearInterval(interval);
    console.log('SSE verbinding gesloten');
  });
});


app.get('/:coinName', async (req, res) => {
  const { coinName } = req.params;
  const crypto = await fetch(apiUrl);
  const cryptoData = await crypto.json();

  const coin = cryptoData.Markets.find(c => c.Name.toLowerCase() === coinName.toLowerCase());

  if (!coin) {
    return res.status(404).send('Coin not found');
  }

  return res.send(renderTemplate('server/views/details.liquid', { coin }));
});






const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data
  };

  return engine.renderFileSync(template, templateData);
};

app
  .use(logger())
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist'))
  .listen(3000, () => console.log('Server available on http://localhost:3000'));
