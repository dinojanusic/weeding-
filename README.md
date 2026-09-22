# Dino & Karla — 19. 06. 2027. · Bajkovita šuma

Statična web-stranica za vjenčanje, na hrvatskom jeziku. Bez build alata i bez ovisnosti —
otvorite `index.html` i sve radi.

## Kako izgleda

1. **Ovitak (intro)** — na tamnoj šumskoj pozadini s krijesnicama pojavi se kuverta zapečaćena
   **voštanim pečatom s monogramom D · K**. Klikom (ili tipkom Enter/razmaknica) pečat zadrhti i
   pukne na dvije polovice, preklop kuverte se otvori i iz nje **izroni pozivnica** s imenima,
   datumom i lokacijom. Otvorena kuverta zatim ostaje na ekranu oko **6 sekundi** da se
   pozivnica u miru pročita; tko želi ranije dalje, klikne *Uđi na stranicu* (ili pritisne
   Enter/Esc). Nakon toga se scena prelije u glavnu stranicu.
2. **Hero** — parallax šuma u četiri sloja, izmaglica, zvijezde, krijesnice na canvasu i imena
   koja se animiraju slovo po slovo.
3. **Odbrojavanje** do 19. 06. 2027. u 16:00 (uživo, sa smjenom znamenki).
4. **Raspored dana** — šest kartica s vremenima, od dolaska gostiju do torte i vatrometa.
5. **Citat** mladenaca.
6. **Lokacija** — ilustracija šumske čistine, ključni podaci, poveznica na karte i gumb
   *Dodaj u kalendar* koji generira `.ics` datoteku.

Sve se animacije gase kad korisnik u sustavu ima uključeno *prefers-reduced-motion*.

## Struktura

```
index.html              — cijeli sadržaj stranice
assets/css/style.css    — dizajn, animacije, responzivnost
assets/js/main.js       — ovitak, krijesnice, odbrojavanje, latice, kalendar
```

## Pokretanje

```bash
# bilo koji statični poslužitelj, npr.
npx http-server -p 8080 .
# pa otvorite http://localhost:8080
```

Radi i dvoklikom na `index.html` (jedino se fontovi tada učitavaju s interneta).

## Što prilagoditi prije objave

| Što | Gdje |
| --- | --- |
| Točna adresa lokacije za karte | `index.html`, poveznica *Otvori u kartama* |
| Koliko otvorena kuverta stoji na ekranu | `assets/js/main.js`, `HOLD_MS` (i `OPEN_MS` = trajanje same animacije) |
| Datum/vrijeme odbrojavanja | `assets/js/main.js`, `var target = new Date('2027-06-19T16:00:00+02:00')` |
| Podaci u `.ics` datoteci | `assets/js/main.js`, odjeljak *Dodaj u kalendar* (vrijeme je u UTC-u) |
| Tekstovi rasporeda i podaci o lokaciji | `index.html` |
| Boje (šumska zelena, zlatna, vosak) | `assets/css/style.css`, `:root` varijable |

## Objava

Radi na svakom statičnom hostingu — GitHub Pages, Netlify, Vercel, Cloudflare Pages.
Za GitHub Pages: *Settings → Pages → Deploy from a branch* i odaberite granu s ovim datotekama.
