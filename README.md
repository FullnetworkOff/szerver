# Játék Galéria

Saját weboldal, ahol regisztrálhatsz/bejelentkezhetsz, és feltöltheted a saját HTML játékaidat egy böngészhető, kategóriák szerint szűrhető galériába.

## Mit tud

- **Regisztráció / bejelentkezés** – jelszavak bcrypt-tel hash-elve, JWT alapú munkamenet (httpOnly cookie)
- **Játék feltöltés** – bejelentkezett felhasználók tölthetnek fel `.html` fájlokat, címmel, leírással, kategóriával
- **Galéria** – minden játék kártyaformátumban, kategória szerint szűrhető
- **Törlés** – csak a saját feltöltésű játékaidat törölheted
- **Adatbázis** – SQLite fájl (`db/gamehub.db`), nem kell külön adatbázis-szervert telepíteni

## Telepítés (helyi gépen)

Szükséged lesz [Node.js](https://nodejs.org)-ra (18-as vagy újabb verzió).

```bash
cd game-hub
npm install
npm start
```

Ezután nyisd meg: **http://localhost:3000**

## Éles / online használat

Ha szeretnéd, hogy bárki elérje az interneten (ne csak a saját géped), fel kell tenned egy hosting szolgáltatóra, mert ez egy igazi Node.js szerver, saját fájlrendszerrel és adatbázissal. Néhány egyszerű, ingyenes/olcsó opció:

- **Render.com** – "Web Service", GitHub repóból automatikusan deployol
- **Railway.app** – hasonlóan egyszerű, git alapú deploy
- **Egy VPS** (pl. Hetzner, DigitalOcean) – teljes kontroll, `pm2`-vel tartva életben a szervert

Fontos production előtt:
1. Állíts be egy erős, egyedi `JWT_SECRET` értéket környezeti változóként (`.env` fájlban, lásd `.env.example`)
2. HTTPS mögött kapcsold be a `secure: true` cookie opciót a `routes/auth.js`-ben
3. A `db/gamehub.db` és az `uploads/` mappa tartalmát mentsd rendszeresen (backup)
4. Az ingyenes hosting szolgáltatóknál a fájlrendszer néha nem perzisztens újraindításkor (pl. Render ingyenes csomag) – ha ez gond, használj csatolt lemezt (persistent disk) vagy külső tárhelyet a feltöltött fájlokhoz

## Mappaszerkezet

```
game-hub/
  server.js           # fő szerver
  db/database.js       # SQLite táblák
  middleware/auth.js    # JWT ellenőrzés
  routes/auth.js        # regisztráció / login / logout
  routes/games.js       # feltöltés / listázás / lejátszás / törlés
  public/                # frontend (HTML/CSS/JS)
  uploads/                # ide kerülnek a feltöltött .html játékok
```

## Testreszabás

- **Kategóriák**: `public/index.html` és `public/upload.html` `<select>` / `filters` részét bővítsd
- **Design**: `public/style.css`
- **Fájlméret-limit**: `routes/games.js`-ben a `limits: { fileSize: ... }` (jelenleg 10 MB)
