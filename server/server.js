// Laad omgevingsvariabelen uit het .env-bestand (zoals de API-sleutel)
import 'dotenv/config';

// Importeer benodigde modules
import express from 'express'; // Voor het verwerken van requests
import { App } from '@tinyhttp/app'; // tinyhttp is een lichte Express-alternatief
import { logger } from '@tinyhttp/logger'; // Logging middleware
import { Liquid } from 'liquidjs'; // Template engine voor .liquid-bestanden
import sirv from 'sirv'; // Voor het serveren van statische bestanden
import { LocalStorage } from 'node-localstorage'; // Simuleert localStorage in Node.js

// Maak een map aan waarin gegevens (zoals doelen) worden opgeslagen
const localStorage = new LocalStorage('./localdata');

// Stel de Liquid-template engine in
const engine = new Liquid({
  extname: '.liquid', // Extensie van de templates
});

// Maak een nieuwe tinyhttp-app
const app = new App();

// Haal API-key uit de omgevingsvariabelen en stel URL in
const apiKey = process.env.API_KEY;
const apiUrl = `https://www.worldcoinindex.com/apiservice/json?key=${apiKey}`;

// Specificeer welke coins we willen tonen in de app
const coinsToShow = ['cardano', 'bitcoin', 'ethereum', 'tether', 'ripple', 'binancecoin', 'solana', 'chainlink', 'dogecoin', 'vechain'];

// Zorg ervoor dat CSS en JS in /server/public beschikbaar zijn in de browser
app.use(express.static('server/public'));

// Herbruikbare functie om alleen de relevante coins op te halen van de API
const getSelectedCoins = async () => {
  const crypto = await fetch(apiUrl); // Haal data op van de API
  const cryptoData = await crypto.json(); // Parse JSON
  return cryptoData.Markets.filter((coin) =>
    coinsToShow.includes(coin.Name.toLowerCase())
  );
};

// Route voor de homepage ('/')
app.get('/', async (req, res) => {
  const selectedCoins = await getSelectedCoins(); // Haal relevante coins op

  // Zet de data om in een handig formaat voor de template
  const coinArray = selectedCoins.map(coin => ({
    name: coin.Name.toLowerCase(),
    coin: coin
  }));

  // Lees opgeslagen doelen uit 'localStorage'
  const goals = JSON.parse(localStorage.getItem('goals') || '{}');

  // Render de index.liquid-template met de coins en doelen
  return res.send(renderTemplate('server/views/index.liquid', { coinArray, goals }));
});

// Route voor Server-Sent Events (real-time updates)
app.get('/events', (req, res) => {
  // Stel headers in zodat de verbinding open blijft
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let previousData = null; // Houd bij wat de vorige data was (om duplicaten te vermijden)

  // Functie die elke minuut nieuwe data ophaalt en verstuurt
  const sendUpdate = async () => {
    try {
      const selectedCoins = await getSelectedCoins();

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
        // Alleen versturen als er verandering is
        console.log(`[${new Date().toISOString()}] Prijzen verstuurd:`, simplified);
        res.write(`data: ${JSON.stringify(simplified)}\n\n`);
        previousData = simplified;
      } else {
        console.log(`[${new Date().toISOString()}] Geen prijswijziging`);
      }

    } catch (err) {
      // Foutafhandeling bij API-problemen
      console.error('Fout bij ophalen van crypto-data:', err);
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Fout bij ophalen van data' })}\n\n`);
    }
  };

  sendUpdate(); // Eerste keer meteen versturen
  const interval = setInterval(sendUpdate, 60000); // Elke 60 sec

  // Sluit de verbinding netjes als de client de pagina sluit
  req.on('close', () => {
    clearInterval(interval);
    console.log('SSE verbinding gesloten');
  });
});

// Route voor details van één specifieke coin
app.get('/:coinName', async (req, res) => {
  const { coinName } = req.params;
  const selectedCoins = await getSelectedCoins();

  // Zoek de coin die overeenkomt met de parameter in de URL
  const coin = selectedCoins.find(c => c.Name.toLowerCase() === coinName.toLowerCase());

  if (!coin) {
    return res.status(404).send('Coin not found');
  }

  // Render een detailpagina met info over die coin
  return res.send(renderTemplate('server/views/details.liquid', { coin }));
});

// Route om een doelprijs op te slaan via een POST-request
app.post('/set-goal', express.json(), (req, res) => {
  const { coinName, goalPrice } = req.body;

  if (!coinName || !goalPrice) {
    return res.status(400).send({ error: 'coinName en goalPrice zijn vereist.' });
  }

  // Haal bestaande doelen op uit localStorage
  const existing = JSON.parse(localStorage.getItem('goals') || '{}');

  // Sla nieuwe doelprijs op
  existing[coinName.toLowerCase()] = goalPrice;
  localStorage.setItem('goals', JSON.stringify(existing));

  res.send({ message: `Doelprijs voor ${coinName} opgeslagen.` });
});

// Hulpmethode om Liquid-templates te renderen
const renderTemplate = (template, data) => {
  const templateData = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    ...data
  };

  return engine.renderFileSync(template, templateData);
};

// Start de server en log in de terminal dat hij draait
app
  .use(logger()) // Logging middleware (laat o.a. HTTP-status zien in terminal)
  .use('/', sirv(process.env.NODE_ENV === 'development' ? 'client' : 'dist')) // Serveer frontend-bestanden
  .listen(3000, () => console.log('Server available on http://localhost:3000'));
