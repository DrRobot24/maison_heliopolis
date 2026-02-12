# 🌹 La Maison de Tante Rose

Landing page / guida digitale per gli ospiti della casa vacanze **La Maison de Tante Rose** a Siracusa, Sicilia.

## 🌐 Lingue

Italiano 🇮🇹 · English 🇬🇧 · Français 🇫🇷 · Español 🇪🇸

La lingua viene rilevata automaticamente dal browser. L'ospite può cambiarla in qualsiasi momento.

## 🔒 Accesso con PIN

La pagina è protetta da un codice di accesso. Per cambiare il PIN, modifica la **riga 2** di `translations.js`:

```js
const ACCESS_PIN = '2026';  // ← cambia qui
```

Il QR code **non cambia mai** — solo il PIN. Comunicalo a voce o su un cartellino in casa.

## 📋 Sezioni della pagina

| Sezione | Contenuto |
|---------|-----------|
| **Check-in** | Istruzioni ingresso Chambre Rosa / Chambre Verte (card, telefono) |
| **Check-out** | Orario e procedura di uscita |
| **Regole** | WiFi, silenzio, rifiuti, animali, no fumo |
| **Esplora Siracusa** | Mappa Google + luoghi da visitare |
| **Dove mangiare** | Ristoranti per categoria (tradizionale, pesce, pizza, colazione, fine dining) |
| **Contatti utili** | Host, emergenze 112, taxi, ospedale |

## 🚀 Deploy

Sito 100% statico (HTML + CSS + JS). Opzioni:

1. **GitHub Pages**: Settings → Pages → Deploy from branch `main` / `/ (root)`
2. **Netlify / Vercel**: Collega la repo, deploy automatico
3. **Qualsiasi hosting**: Carica i 4 file via FTP

## 📁 File

```
index.html        → Shell HTML
style.css          → Design system (palette beige/crema, font serif)
translations.js    → Testi in 4 lingue + PIN
script.js          → Rendering, lingua, animazioni
```

## ✏️ Personalizzazione rapida

- **Cambiare PIN** → riga 2 di `translations.js`
- **Aggiungere un ristorante** → sezione `eat.categories` in `translations.js`
- **Cambiare colori** → variabili CSS in cima a `style.css`
- **Modificare contatti** → sezione `contacts.items` in `translations.js`
