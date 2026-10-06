# Classroom Seat Reservation System — Backend

RESTful API backend -palvelu luokkahuoneiden istumapaikkojan varausjärjestelmälle. Toteutettu Node.js-, Express- ja MySQL-teknologioilla.

---

## Teknologiat

* **Runtime:** Node.js
* **Framework:** Express.js
* **Tietokanta:** MySQL (`mysql2`-pool)
* **Sessiohallinta:** `express-session`, `express-mysql-session` (Sessioiden tallennus tietokantaan)
* **Tietoturva & Konfiguraatio:** `dotenv`, `cors` (Cross-Origin Resource Sharing credentials-tuella)
* **Dokumentaatio:** Swagger UI (`swagger-ui-express`, `yamljs`, OpenAPI 3.0)
* **Kehitystyökalut:** `nodemon`

---

## Projektirakenne

```text
classroom-reservation-backend/
├── public/                # Staattiset julkiset tiedostot (HTML, CSS jne.)
│   ├── index.html
│   └── style.css
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
