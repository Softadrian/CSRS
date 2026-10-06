# Classroom Seat Reservation System — Backend & Frontend

Tämä on täysiverinen luokkahuoneiden istumapaikkojen varausjärjestelmä. Sovellus koostuje Express-pohjaisesta REST API -taustajärjestelmästä (backend) ja interaktiivisesta Single Page Application (SPA) -käyttöliittymästä (frontend).

## Teknologiat

### Taustajärjestelmä (Backend)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Tietokanta:** MySQL (`mysql2`-pool)
* **Sessiohallinta:** `express-session`, `express-mysql-session` (Sessioiden tallennus tietokantaan)
* **Tietoturva & Konfiguraatio:** `dotenv`, `cors` (Cross-Origin Resource Sharing credentials-tuella)
* **Dokumentaatio:** Swagger UI (`swagger-ui-express`, `yamljs`, OpenAPI 3.0)
* **Kehitystyökalut:** `nodemon`

### Käyttöliittymä (Frontend)
* **Rakenne & Muotoilu:** HTML5, CSS3 (Flexbox, CSS Grid -paikkaruudukko)
* **Skriptaus:** Vanilla JavaScript (Fetch API, Asynchronous UI updates, SPA-logiikka)

---

## Frontend & Käyttöliittymä

Käyttöliittymä (`public/index.html` & `public/style.css`) on toteutettu ilman raskaita kehysrakenteita ja se tarjoaa selkeän korttipohjaisen (Card layout) ja responsiivisen visuaalisen ilmeen.

### Ominaisuudet
* **Käyttäjähallinta (Auth):**
  * Rekisteröityminen opiskelijaksi ja kirjautuminen sisään.
  * Automaattinen istunnon tarkistus (`checkAuth`) sivun latautuessa.
* **Interaktiivinen paikkavaraus:**
  * Luokkahuoneen ja päivämäärän valinta.
  * **Interaktiivinen paikkaruudukko (CSS Grid):** Näyttää paikat reaaliajassa värikoodeilla:
    * **Vapaa paikka (`.seat`):** Vihreä background.
    * **Valittu paikka (`.seat.selected`):** Oranssi korostus.
    * **Varattu paikka (`.seat.reserved`):** Punainen/harmaa, estetty valinta (`cursor: not-allowed`).
  * Estetyt osiot (`.disabled-section`): Varauslomake pysyy lukittuna (`opacity: 0.5`, `pointer-events: none`), kunnes käyttäjä on kirjautunut sisään.
* **Roolipohjainen käyttöliittymä (RBAC):**
  * **Opiskelija:** Näkee omat varauksensa taulukossa ja voi perua niitä.
  * **Ylläpitäjä (Admin / Ylläpitäjä):** Näkee dynamisen hallintaosoin uuden luokkahuoneen lisäämiselle sekä kaikkien käyttäjien varaukset poisto-oikeuksin.

---

## Projektirakenne

classroom-reservation-backend/
├── public/                # Julkiset staattiset tiedostot (frontend)
│   ├── index.html         # SPA-käyttöliittymän HTML-rakenne
│   └── style.css          # Sovelluksen tyylit ja visuaalinen ilme
├── src/
│   ├── config/            # Tietokantayhteyden asetukset (db.js)
│   ├── controllers/       # Reittien liiketoimintalogiikka
│   ├── middlewares/       # Autentikointi- ja oikeustarkistukset
│   └── routes/            # API-reitit (admin, auth, classroom, reservation)
├── .env                   # Ympäristömuuttujat (ei versionhallintaan)
├── .gitignore
├── package.json
├── server.js              # Sovelluksen päätiedosto ja käynnistys
└── swagger.yaml           # API-dokumentaatio (OpenAPI 3.0)