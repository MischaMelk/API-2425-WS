## API notities

### Week 1

In week 1 ben ik begonnen met het zoeken naar de juiste API’s. Ik was vooral op zoek naar een API die mijn interesse wekte. Een API die ik graag wilde gebruiken, was in de richting van CryptoCurrency. Alleen kwam ik vaak het probleem tegen dat de gratis API’s allemaal limieten hadden voor het aantal calls per maand. Aangezien ik zelf nog geen ervaring heb met API’s, durf ik niet goed in te schatten hoeveel calls ik per maand nodig zal hebben, dus probeer ik deze limieten een beetje te vermijden.

Uiteindelijk heb ik een goede API gevonden waarbij de gegevens elke 5 minuten worden vernieuwd. De informatie die opgehaald kan worden, is niet heel uitgebreid, maar bevat wel wat bruikbare gegevens:

1. Afkorting Crypto
2. Naam Crypto
3. Waarde Crypto in EUR
4. Waarde Crypto in USD
5. Waarde Crypto in BTC
6. Volume 24h

Met deze informatie kan ik een dashboard maken waarmee je van de top 10 munten een duidelijk overzicht krijgt en kunt zien wanneer de waarde van een munt onder een bepaald bedrag komt.

**Feedback:**

Push notifications API voor meldingen zodra de munt onder het aangegeven bedrag staat.

### Week 2

**ToDo’s:**

In week 2 heb ik de pagina’s voor de munten opgezet. Ik heb ervoor gezorgd dat de 10 munten die voor mij interessant zijn, op de homepage verschijnen. Zodra je op een van de links klikt, ga je naar de desbetreffende pagina. Dit heb ik als volgt gedaan:

De eerste afbeelding toont hoe het homescreen is opgezet. Hier zie je ook hoe ik de munten heb aangeroepen.

<img src="readme-img/Screenshot 2025-04-24 at 21.40.46.png">

Bij deze wordt de pagina aangemaakt per coin. Dit wordt dan gedaan met de naam van de coin in de link te zetten.

<img src="readme-img/Screenshot 2025-04-24 at 21.40.32.png">

Feedback:

Kijk naar server sent events

### Week 3

In week 3 heb ik gewerkt aan de styling van de site en ben ik begonnen met de WebAPI’s. De eerste API die ik heb gebruikt, is Server-Sent-Events. Hiermee zorg ik ervoor dat de prijzen van de munten automatisch worden herladen zodra de API ze vernieuwt, zonder dat ik de hele pagina opnieuw hoef te laden. Dit heeft me veel tijd gekost deze week, maar uiteindelijk heb ik de volgende code ervoor gemaakt.

<img src="readme-img/Screenshot 2025-04-24 at 21.43.21.png">

Ook heb ik de internationalization API gebruikt om de juiste schrijfmethode te hebben voor de coins en dat ziet er dan als volgt uit op de site:

<img src="readme-img/Screenshot 2025-04-24 at 21.44.37.png">

Feedback:
Een reminder als de server refreshed.

Meer kleuren op de homepagina en wat meer hierarchy toevoegen.

Haal de header en footer weg.

### Week 4

In week 4 was het mijn taak om de site live te zetten op een server en de laatste aanpassingen te doen. Ik heb de hiërarchie aangepast en de kleuren veranderd afhankelijk van of het doel wel of niet behaald is.

Het is ook gelukt om de prijzen die je invoert op elke pagina door te voeren naar de homepage, zodat ze daar in het overzicht verschijnen.

<img src="readme-img/Screenshot 2025-04-24 at 22.00.13.png">

Het laatste wat ik wilde doen, is afgerond. Nu moet ik de site alleen nog live zetten op Render. Helaas had ik hier wat problemen mee. Ik heb een tijdje geprobeerd de site live te krijgen, wat uiteindelijk lukte, maar de CSS werd niet meegenomen. Na wat heen en weer overleggen met ChatGPT heb ik helaas de handdoek in de ring gegooid voor de styling van de live site.

https://api-2425-ws-mischam.onrender.com 

Bronnen:
https://chatgpt.com/share/680a9697-4aac-8006-8b84-b102494dd805

https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events

https://www.worldcoinindex.com/apiservice?ref=public_apis&utm_medium=website

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization