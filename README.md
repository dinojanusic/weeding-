# Karla & Dino — 18. 06. 2027.

Statična web-stranica za vjenčanje, na hrvatskom jeziku. Bez build alata i bez ovisnosti —
otvorite `index.html` i sve radi.

## Kako izgleda

1. **Ovitak (intro)** — na kremastoj pozadini s grančicama šlajera stoji kuverta zapečaćena
   **voštanim pečatom s monogramom K · D**. Klikom (ili tipkom Enter/razmaknica) pečat pukne na
   dvije polovice, preklop se otvori i iz kuverte izroni pozivnica. Otvorena kuverta ostaje na
   ekranu oko **6 sekundi**; tko želi ranije dalje, klikne *Uđi na stranicu* (ili Enter/Esc).
2. **Hero** — fotografija para uz imena, datum `18. 06. 2027. | PETAK` i pozivni tekst.
3. **Naš dan** — vodoravna vremenska crta sa šest trenutaka dana i ručno crtanim ikonama
   (čaše, auto, kapela, večera). Na užim ekranima prelazi u 3, 2 pa 1 stupac.
4. **Lokacije** — dvije kartice: Kapela Gospe Snježne (Kuršanec) i Bajkovita šuma (kolaž od
   tri fotografije), svaka s poveznicom na karte.
5. **RSVP** — rok za potvrdu i gumb koji otvara obrazac; nakon slanja pokazuje se voštani pečat
   kao potvrda, uz latice koje padaju.
6. **Podnožje** s imenima i datumom.

Uz rubove stranice cijelo vrijeme stoje grančice šlajera, a u pozadini polako padaju latice.
Sve se animacije gase kad korisnik ima uključeno *prefers-reduced-motion*.

## Struktura

```
index.html                   — cijeli sadržaj stranice
assets/css/style.css         — dizajn, animacije, responzivnost
assets/js/main.js            — ovitak, otkrivanje pri skrolanju, izbornik, RSVP, latice
assets/img/*.jpg             — fotografije
assets/img/cvijece-*.svg     — grančice šlajera (generirane)
tools/generiraj-cvijece.py   — generator tih grančica
```

## ⚠️ Fotografije treba zamijeniti

Fotografije u `assets/img/` izrezane su **iz slike dizajna koju ste poslali**, pa su niske
rezolucije (otprilike 900 px široke) i služe samo kao privremeni ispun. Zamijenite ih
originalima pod istim imenima i ništa drugo ne treba mijenjati:

| Datoteka | Gdje se vidi | Preporučena veličina |
| --- | --- | --- |
| `par.jpg` | hero | ≥ 1400 × 1600 px (uspravna) |
| `kapela.jpg` | kartica kapele | ≥ 1600 × 1040 px |
| `suma-sumrak.jpg` | veliki kadar u kolažu | ≥ 1600 × 530 px |
| `suma-stol.jpg` | lijevi mali kadar | ≥ 700 × 500 px |
| `suma-objekt.jpg` | desni mali kadar | ≥ 1000 × 500 px |

## Što još prilagoditi prije objave

| Što | Gdje |
| --- | --- |
| **E-mail za RSVP** (sada `karla.dino.vjencanje@example.com`) | `assets/js/main.js`, potraga za `mailto:` |
| Točne adrese za karte | `index.html`, poveznice *Otvori u kartama* |
| Koliko otvorena kuverta stoji na ekranu | `assets/js/main.js`, `HOLD_MS` (i `OPEN_MS` = trajanje animacije) |
| Tekstovi (pozivni tekst, raspored, opisi lokacija) | `index.html` |
| Boje (kremasta, kadulja, zlatna) | `assets/css/style.css`, `:root` varijable |

### Pravi RSVP (umjesto e-maila)

Obrazac otvara e-mail klijent s ispunjenom porukom. Ako želite da odgovori stižu u tablicu,
zamijenite `window.location.href = mailto;` pozivom na servis, npr.:

```js
fetch('https://formspree.io/f/VAS_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: new FormData(form)
});
```

### Grančice šlajera

Generirane su skriptom i mogu se ponovno iscrtati s drugim izgledom:

```bash
python3 tools/generiraj-cvijece.py   # pokrenuti iz korijena projekta
```

Mijenjanjem sjemena (`side_piece(11)`, `corner_piece(23)`…) dobiva se drukčiji raspored grančica.

## Pokretanje i objava

```bash
npx http-server -p 8080 .
# pa otvorite http://localhost:8080
```

Radi na svakom statičnom hostingu — GitHub Pages, Netlify, Vercel, Cloudflare Pages.
