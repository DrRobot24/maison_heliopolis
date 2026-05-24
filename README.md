# Heliopolis

Landing page / guida digitale per gli ospiti di **Heliopolis** a Siracusa, Sicilia.

## Dati struttura

- **Nome:** Heliopolis
- **Indirizzo:** Via Bainsizza 94, 96100 Siracusa (SR)
- **Ospiti massimi:** 3
- **Camera 1:** letto matrimoniale + lettino singolo
- **Camera 2:** solo letto matrimoniale
- **WiFi:** Rete `Heliopolis` — Password `heliopolissr`
- **Host WhatsApp:** +39 351 761 1469

## Lingue

Italiano 🇮🇹 · English 🇬🇧 · Français 🇫🇷 · Español 🇪🇸

La lingua viene rilevata automaticamente dal browser.

## Check-in (5 passi)

1. Arrivare al civico Via Bainsizza 94 — inserire PIN portone (comunicato via WhatsApp)
2. Mandare WhatsApp all'host davanti alla porta della camera
3. La camera è contrassegnata dal numero comunicato in precedenza dall'host
4. La porta della camera si aprirà in automatico
5. Inserire la card in camera nella tasca a muro per attivare l'elettricità

## Foto check-in (cartella `public/`)

| File             | Contenuto                       |
| ---------------- | ------------------------------- |
| 01.jpeg, 02.jpeg | PIN porta d'ingresso principale |
| 03.jpeg          | Card energia elettrica          |
| 04.jpeg          | Numero camera                   |
| 05.jpeg          | Porta automatica                |

## Deploy

Sito 100% statico (HTML + CSS + JS). URL Vercel: `[URL_HELIOPOLIS]`

1. **Vercel**: Collega la repo, deploy automatico dal branch `main`
2. **GitHub Pages**: Settings → Pages → Deploy from branch `main` / `/ (root)`

## File principali

```text
index.html        → Shell HTML
style.css         → Design system
translations.js   → Testi in 4 lingue
script.js         → Rendering, lingua, animazioni, check-in
api/chat.js       → Chatbot Ciccio (richiede ANTHROPIC_API_KEY)
vercel.json       → Routing Vercel
```

## Personalizzazione rapida

- **WiFi** → `rules.items[0]` in `translations.js`
- **Aggiungere ristorante** → sezione `eat.categories` in `translations.js`
- **Contatti** → sezione `contacts.items` in `translations.js`
- **Colori** → variabili CSS in cima a `style.css`
