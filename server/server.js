import 'dotenv/config';
import express from 'express';
import path from 'path';
import { Liquid } from 'liquidjs';
import { fileURLToPath } from 'url';
import sirv from 'sirv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Liquid view engine instellen
const engine = new Liquid({ extname: '.liquid' });
app.engine('liquid', engine.express()); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'liquid');

// API key
const apiKey = process.env.API_KEY;
const apiUrl = `https://www.worldcoinindex.com/apiservice/json?key=${apiKey}`;

// Statische bestanden serveren (build folder van Vite)
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
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

  res.render('index', { coinArray });
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
        res.write(`data: ${JSON.stringify(simplified)}\n\n`);
        previousData = simplified;
      }

    } catch (err) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Fout bij ophalen van data' })}\n\n`);
    }
  };

  sendUpdate();
  const interval = setInterval(sendUpdate, 60000);

  req.on('close', () => clearInterval(interval));
});

app.get('/:coinName', async (req, res) => {
  const { coinName } = req.params;
  const crypto = await fetch(apiUrl);
  const cryptoData = await crypto.json();

  const coin = cryptoData.Markets.find(c => c.Name.toLowerCase() === coinName.toLowerCase());

  if (!coin) {
    return res.status(404).send('Coin not found');
  }

  res.render('details', { coin });
});

// fallback naar frontend (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start de server
app.listen(PORT, () => {
  console.log(`✅ Server draait op http://localhost:${PORT}`);
});
