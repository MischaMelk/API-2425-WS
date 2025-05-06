// Importeer de bijbehorende CSS (voor styling van de pagina)
import './index.css';

// ======================================
// 1. SERVER-SENT EVENTS (live prijsupdates)
// ======================================

// Maak verbinding met de server via SSE (voor realtime data)
const evtSource = new EventSource('/events');

// Object dat valuta's op de juiste manier formatteert
const priceFormatters = {
  eur: new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }),
  usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  btc: { format: (value) => `${value.toFixed(8)} BTC` }, // Speciaal voor BTC
  cny: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
  gbp: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
  rur: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
};

// Wordt uitgevoerd bij elke update van de server
evtSource.onmessage = function (event) {
  const data = JSON.parse(event.data); // Zet JSON-string om naar objecten

  data.forEach(coin => {
    const lower = coin.name; // bv. 'bitcoin'

    // Hulpfunctie om een HTML-element met ID aan te passen
    const update = (id, value) => {
      const el = document.getElementById(`${id}-${lower}`);
      if (el && value !== undefined) el.textContent = value;
    };

    // Update de verschillende valuta's
    update("price-eur", priceFormatters.eur.format(coin.price));
    update("price-usd", priceFormatters.usd.format(coin.price_usd));
    update("price-btc", priceFormatters.btc.format(coin.price_btc));
    update("price-cny", priceFormatters.cny.format(coin.price_cny));
    update("price-gbp", priceFormatters.gbp.format(coin.price_gbp));
    update("price-rur", priceFormatters.rur.format(coin.price_rur));
    update("price", `€ ${coin.price}`); // Voor indexpagina
  });
};

// Als de verbinding faalt, toon een foutmelding
evtSource.onerror = function (error) {
  console.error('SSE fout:', error);
};

// ======================================
// 2. DOELPRIJZEN TONEN (na het laden)
// ======================================

// Zodra de pagina is geladen...
window.addEventListener("DOMContentLoaded", () => {
  const goals = JSON.parse(sessionStorage.getItem("goals") || "{}"); // Ophalen doelen uit sessie

  // Loop door opgeslagen doelen en toon deze
  Object.entries(goals).forEach(([coinName, price]) => {
    const listItem = document.querySelector(`#goal-${coinName}`);
    if (listItem) {
      listItem.textContent = `€ ${price}`;

      // Controleer of het doel bereikt is, geef dan een kleur
      const priceElement = document.getElementById(`price-${coinName}`);
      if (priceElement) {
        const current = parseFloat(priceElement.textContent.replace("€", "").replace(",", "."));
        const goal = parseFloat(price);
        if (current < goal) listItem.style.color = "green"; // Huidige prijs is lager dan doel
        else listItem.style.color = "red"; // Huidige prijs is hoger
      }
    }
  });
});

// ======================================
// 3. DOELPRIJS OPSLAAN (detailpagina)
// ======================================

// Als de pagina is geladen...
document.addEventListener("DOMContentLoaded", () => {
  // Zoek alle knoppen die beginnen met "save-goal-"
  document.querySelectorAll("button[id^='save-goal-']").forEach((saveButton) => {
    // Voeg click-event toe aan elke knop
    saveButton.addEventListener("click", async function (e) {
      e.preventDefault();

      // Haal coinnaam uit ID van de knop, bv. "save-goal-btc" => "btc"
      const coinName = saveButton.id.split("-")[2];
      const input = document.getElementById(`doelprijs-${coinName}`);
      const doelprijs = input?.value;

      if (!doelprijs) return alert("Voer een doelprijs in voordat je opslaat.");

      try {
        // Verstuur doelprijs naar de server via POST-request
        const response = await fetch("/set-goal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coinName, goalPrice: doelprijs })
        });

        const result = await response.json();
        alert(result.message); // Toon serverrespons
      } catch (error) {
        alert("Er ging iets mis bij het opslaan van de doelprijs.");
      }
    });
  });
});
