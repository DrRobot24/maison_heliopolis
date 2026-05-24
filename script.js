/* ============================================
   Heliopolis — App Engine
   ============================================
   
   TWO MODES:
   1) CHECK-IN LINK (sent via social before arrival):
      ?checkin=rosa   → landing page with only Chambre Rosa entry instructions
      ?checkin=verte  → landing page with only Chambre Verte entry instructions
   
   2) MAIN SITE (QR code inside the house):
      no params       → full site: welcome, checkout, rules, explore, eat, contacts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'it';
  let abortCtrl = null;

  // ---- Mode detection from URL ----
  const urlParams = new URLSearchParams(window.location.search);
  const checkinRoom = urlParams.get('checkin'); // 'rosa', 'verte', or null
  const isCheckinMode = checkinRoom !== null;

  // SVG Icons
  const SVG = {
    rose: `<svg class="rose-icon" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="13" rx="6.5" ry="9" transform="rotate(-15 12 13)"/><path d="M13.5 4.5 Q17 1 20 3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M16 5.5 Q19 3 20 7" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`,
    key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    noPets: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- Dog silhouette -->
      <g fill="#8B6F5E">
        <!-- Body -->
        <ellipse cx="30" cy="38" rx="12" ry="8"/>
        <!-- Head -->
        <circle cx="18" cy="30" r="7"/>
        <!-- Ear -->
        <ellipse cx="14" cy="24" rx="3.5" ry="5" transform="rotate(-20 14 24)"/>
        <!-- Snout -->
        <ellipse cx="13" cy="33" rx="4" ry="2.5"/>
        <!-- Tail -->
        <path d="M42 34 Q48 28 46 22" stroke="#8B6F5E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Front legs -->
        <rect x="22" y="43" width="3" height="8" rx="1.5"/>
        <rect x="28" y="43" width="3" height="8" rx="1.5"/>
        <!-- Back legs -->
        <rect x="34" y="43" width="3" height="8" rx="1.5"/>
        <rect x="39" y="43" width="3" height="8" rx="1.5"/>
      </g>
      <!-- Nose -->
      <circle cx="11" cy="32" r="1.5" fill="#333"/>
      <!-- Eye -->
      <circle cx="16" cy="28" r="1.2" fill="#333"/>
      <!-- Prohibition circle -->
      <circle cx="32" cy="32" r="28" fill="none" stroke="#C0392B" stroke-width="4"/>
      <!-- Prohibition line -->
      <line x1="12" y1="12" x2="52" y2="52" stroke="#C0392B" stroke-width="4" stroke-linecap="round"/>
    </svg>`,    emergency: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <!-- Police shield -->
      <path d="M14 6 L24 3 L34 6 L34 22 C34 30 24 36 24 36 C24 36 14 30 14 22 Z" fill="#2C5AA0" stroke="#1A3D6E" stroke-width="1.5"/>
      <path d="M20 14 h8 v4 h4 v8 h-4 v4 h-8 v-4 h-4 v-8 h4 z" fill="#FFFFFF"/>
      <!-- Red cross (ambulance) -->
      <circle cx="36" cy="36" r="10" fill="#E74C3C"/>
      <rect x="33" y="30" width="6" height="12" rx="1" fill="#FFFFFF"/>
      <rect x="30" y="33" width="12" height="6" rx="1" fill="#FFFFFF"/>
    </svg>`,    corner: `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.55">
        <g transform="translate(60,60)">
          <ellipse cx="0" cy="0" rx="22" ry="28" fill="#C8C030" opacity="0.7" transform="rotate(-15)"/>
          <ellipse cx="4" cy="-6" rx="14" ry="18" fill="#D8D050" opacity="0.6" transform="rotate(-15)"/>
          <ellipse cx="0" cy="0" rx="8" ry="10" fill="#E8E870" opacity="0.8" transform="rotate(-15)"/>
          <ellipse cx="0" cy="0" rx="4" ry="5" fill="#F4F4A0" transform="rotate(-15)"/>
        </g>
        <g transform="translate(120,35) scale(0.7)">
          <ellipse cx="0" cy="0" rx="20" ry="26" fill="#C8C030" opacity="0.6" transform="rotate(-20)"/>
          <ellipse cx="3" cy="-5" rx="12" ry="16" fill="#D8D050" opacity="0.5" transform="rotate(-20)"/>
          <ellipse cx="0" cy="0" rx="6" ry="8" fill="#E8E870" opacity="0.8" transform="rotate(-20)"/>
        </g>
        <g transform="translate(30,110) scale(0.5)">
          <ellipse cx="0" cy="0" rx="18" ry="24" fill="#C8C030" opacity="0.5" transform="rotate(-10)"/>
          <ellipse cx="0" cy="0" rx="8" ry="10" fill="#E8E870" opacity="0.7" transform="rotate(-10)"/>
        </g>
        <path d="M60 78 C 55 120, 70 160, 90 200" stroke="#3A7020" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M84 49 C 100 80, 95 120, 90 200" stroke="#3A7020" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M30 116 C 40 140, 60 170, 90 200" stroke="#3A7020" stroke-width="1.5" fill="none" opacity="0.35"/>
        <path d="M52 100 C 30 95, 20 110, 40 115 C 30 105, 38 98, 52 100Z" fill="#3A7020" opacity="0.4"/>
        <path d="M92 90 C 110 80, 120 95, 105 102 C 115 88, 100 85, 92 90Z" fill="#5A9035" opacity="0.35"/>
        <path d="M75 140 C 55 132, 45 145, 62 150 C 50 138, 60 135, 75 140Z" fill="#3A7020" opacity="0.3"/>
        <path d="M95 130 C 115 125, 125 138, 108 143 C 120 128, 105 127, 95 130Z" fill="#5A9035" opacity="0.3"/>
        <circle cx="100" cy="65" r="5" fill="#D8D050" opacity="0.3"/>
        <circle cx="40" cy="80" r="4" fill="#C8C030" opacity="0.25"/>
      </g>
    </svg>`
  };

  // Auto-detect language
  const saved = localStorage.getItem('heliopolis_lang');
  if (saved && ['it', 'en', 'fr', 'es'].includes(saved)) currentLang = saved;
  else {
    const bl = navigator.language.slice(0, 2);
    if (['it', 'en', 'fr', 'es'].includes(bl)) currentLang = bl;
  }
  document.documentElement.lang = currentLang;

  function t(obj) { return obj[currentLang] || obj['en'] || ''; }

  function roomDisplayName(room) {
    return room ? `Camera ${room}` : '';
  }

  // ---- Route to correct mode ----
  if (isCheckinMode) {
    renderCheckinLanding();
  } else {
    renderMainSite();
  }

  // ================================================================
  //  MODE 1: CHECK-IN LANDING PAGE (link sent via social)
  //  Minimal, focused — only entry instructions for the specific room
  // ================================================================
  function renderCheckinLanding() {
    const app = document.getElementById('app');
    document.title = `Check-in — Heliopolis`;

    app.innerHTML = `
    <div class="checkin-landing">
      <div class="checkin-landing__corner checkin-landing__corner--tl">${SVG.corner}</div>
      <div class="checkin-landing__corner checkin-landing__corner--br">${SVG.corner}</div>

      <div class="checkin-landing__card">
        <img src="public/logo_heliopolis.jpeg" alt="Heliopolis" class="checkin-landing__logo">
        <div class="checkin-landing__brand">Heliopolis</div>
        <div class="checkin-landing__room-badge">${roomDisplayName(checkinRoom)}</div>
        <h1 class="checkin-landing__title">${t(T.checkin.title)}</h1>
        <p class="checkin-landing__subtitle">${t(T.checkin.subtitle)}</p>

        <div class="checkin-landing__lang">
          <button class="lang-btn-sm ${currentLang === 'it' ? 'active' : ''}" data-set-lang="it">🇮🇹</button>
          <button class="lang-btn-sm ${currentLang === 'en' ? 'active' : ''}" data-set-lang="en">🇬🇧</button>
          <button class="lang-btn-sm ${currentLang === 'fr' ? 'active' : ''}" data-set-lang="fr">🇫🇷</button>
          <button class="lang-btn-sm ${currentLang === 'es' ? 'active' : ''}" data-set-lang="es">🇪🇸</button>
        </div>

        <div class="checkin-landing__steps">
          ${renderSteps(checkinRoom)}
        </div>

        <div class="checkin-landing__contact">
          <p>${t(T.checkinLanding.needHelp)}</p>
          <a href="tel:+393517611469" class="phone-link">+39 351 761 1469</a>
        </div>
      </div>

      <footer class="checkin-landing__footer checkin-footer-dark">
        <div class="footer-brand">Heliopolis</div>
        <div class="footer-cin">CIN: IT089017C2DKRZXJTO — CIR: 19089017C265790</div>
        <div class="footer-divider"></div>
        <p>${t(T.checkinLanding.footer)}</p>
        <div class="footer-divider"></div>
        <p class="footer-credit">© ${new Date().getFullYear()} All rights reserved — Made with 🖤 by <a href="https://encreade.com" target="_blank" rel="noopener noreferrer">Encreade</a></p>
      </footer>
    </div>`;

    // Language switcher
    document.querySelectorAll('.lang-btn-sm').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.setLang;
        localStorage.setItem('heliopolis_lang', currentLang);
        document.documentElement.lang = currentLang;
        renderCheckinLanding();
      });
    });

    // Falling petals on check-in page
    const landing = document.querySelector('.checkin-landing');
    if (landing) {
      const petals = ['🍋', '🍋', '🍋', '🌿'];
      function spawnPetal() {
        const el = document.createElement('span');
        el.className = 'petal';
        el.textContent = petals[Math.floor(Math.random() * petals.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (4 + Math.random() * 4) + 's';
        el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
        landing.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }
      for (let i = 0; i < 4; i++) setTimeout(spawnPetal, i * 700);
      setInterval(spawnPetal, 2500);
    }
  }

  // ================================================================
  //  MODE 2: MAIN SITE (QR code inside the house)
  //  Full guide: welcome, checkout, rules, explore, restaurants, contacts
  //  NO check-in section (they're already inside!)
  // ================================================================
  function renderMainSite() {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };

    const app = document.getElementById('app');

    app.innerHTML = `
    <!-- Navigation -->
    <nav class="nav" id="navbar">
      <div class="container">
        <a href="#" class="nav-brand" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">Heliopolis</a>
        <button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
        <ul class="nav-links">
          <li class="nav-mobile-brand"><span class="nav-mobile-rose">☀️</span><span>Heliopolis</span></li>
          <li><a href="#checkout">${t(T.nav.checkout)}</a></li>
          <li><a href="#rules">${t(T.nav.rules)}</a></li>
          <li><a href="#explore">${t(T.nav.explore)}</a></li>
          <li><a href="#experiences">${t(T.nav.experiences)}</a></li>
          <li><a href="#eat">${t(T.nav.eat)}</a></li>
          <li><a href="#contacts">${t(T.nav.contacts)}</a></li>
        </ul>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero" id="hero">
      <div class="hero-corner hero-corner--tl">${SVG.corner}</div>
      <div class="hero-corner hero-corner--tr">${SVG.corner}</div>
      <div class="hero-corner hero-corner--bl">${SVG.corner}</div>
      <div class="hero-corner hero-corner--br">${SVG.corner}</div>
      <div class="hero-content">
        <img src="public/logo_heliopolis.jpeg" alt="Heliopolis" class="hero-logo">
        <p class="hero-eyebrow">${t(T.hero.eyebrow)}</p>
        <h1>Heliopolis</h1>
        <p class="hero-tagline">${t(T.hero.tagline)}</p>
        <div class="hero-location">${SVG.pin} ${t(T.hero.location)}</div>
        <div class="hero-cin">CIN: IT089017C2DKRZXJTO — CIR: 19089017C265790</div>
        <p class="section-subtitle" style="margin-bottom:20px">${t(T.hero.selectLang)}</p>
        <div class="lang-selector">
          <button class="lang-btn ${currentLang === 'it' ? 'active' : ''}" data-set-lang="it">🇮🇹 Italiano</button>
          <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-set-lang="en">🇬🇧 English</button>
          <button class="lang-btn ${currentLang === 'fr' ? 'active' : ''}" data-set-lang="fr">🇫🇷 Français</button>
          <button class="lang-btn ${currentLang === 'es' ? 'active' : ''}" data-set-lang="es">🇪🇸 Español</button>
        </div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Welcome -->
    <section class="section section--white">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.welcome.title)}</h2><p class="section-subtitle">${t(T.welcome.subtitle)}</p></div>
        <div class="reveal" style="max-width:750px;margin:0 auto;text-align:center"><p>${t(T.welcome.text)}</p></div>
        <div class="floral-divider">${SVG.rose}</div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Check-out -->
    <section class="section section--cream" id="checkout">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.checkout.title)}</h2><p class="section-subtitle">${t(T.checkout.subtitle)}</p></div>
        <div class="checkout-box reveal">
          <div class="time-badge">🕙 ${T.checkout.time}</div>
          <p>${t(T.checkout.text)}</p>
        </div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Rules -->
    <section class="section section--white" id="rules">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.rules.title)}</h2><p class="section-subtitle">${t(T.rules.subtitle)}</p></div>
        <div class="rules-grid reveal">${T.rules.items.map(r => `
          <div class="rule-item">
            <div class="rule-icon">${r.icon === 'no-pets-svg' ? SVG.noPets : r.icon}</div>
            <div><h4>${t(r.title)}</h4><p>${t(r.desc)}</p></div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Explore -->
    <section class="section section--cream" id="explore">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.explore.title)}</h2><p class="section-subtitle">${t(T.explore.subtitle)}</p></div>
        <div class="reveal">
          <div class="map-wrapper">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6420.5!2d15.2927!3d37.0594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1313e580a0640001%3A0xd3b0efde19254c44!2sOrtigia!5e0!3m2!1sit!2sit!4v1700000000000" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
        <div class="landmarks-grid reveal">${T.explore.landmarks.map(l => `
          <div class="landmark-card">
            <div class="emoji">${l.emoji}</div>
            <h4>${l.name}</h4>
            <p>${t(l.desc)}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Experiences -->
    <section class="section section--white" id="experiences">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.experiences.title)}</h2><p class="section-subtitle">${t(T.experiences.subtitle)}</p></div>
        ${T.experiences.items.map(exp => `
          <div class="experience-card reveal">
            <div class="experience-card__icon">${exp.emoji}</div>
            <div class="experience-card__content">
              <h3>${t(exp.title)}</h3>
              <p class="experience-card__desc">${t(exp.desc)}</p>
              ${exp.photos ? `
              <div class="experience-card__gallery">
                ${exp.photos.map(photo => `<img src="${photo}" alt="" class="experience-card__photo" loading="lazy">`).join('')}
              </div>` : ''}
              <p class="experience-card__details">${t(exp.details)}</p>
              <div class="experience-card__cta">
                <span>📞</span> ${t(exp.cta)}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Where to Eat -->
    <section class="section section--white" id="eat">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.eat.title)}</h2><p class="section-subtitle">${t(T.eat.subtitle)}</p></div>
        ${T.eat.categories.map(cat => `
          <div class="restaurant-category reveal">
            <h3><span class="emoji">${cat.emoji}</span> ${t(cat.name)}</h3>
            <div class="restaurant-list">${cat.restaurants.map(r => `
              <a href="${r.link}" target="_blank" rel="noopener noreferrer" class="restaurant-item">
                <div class="name">${r.name} <span class="restaurant-arrow">→</span></div>
                <div class="desc">${t(r.desc)}</div>
                <div class="meta">📍 ${r.meta}</div>
              </a>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Contacts -->
    <section class="section section--cream" id="contacts">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.contacts.title)}</h2><p class="section-subtitle">${t(T.contacts.subtitle)}</p></div>
        <div class="contacts-grid reveal">${T.contacts.items.map(c => `
          <div class="contact-card">
            <div class="icon">${c.icon === 'emergency-svg' ? SVG.emergency : c.icon}</div>
            <h4>${t(c.title)}</h4>
            <p><a href="${c.link}" class="phone-link">${c.value}</a></p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <div class="section-rose-divider">🍋 🍋 🍋</div>

    <!-- Google Review -->
    <section class="section section--white" id="review">
      <div class="container">
        <div class="review-box reveal">
          <div class="review-stars">⭐⭐⭐⭐⭐</div>
          <h2>${t(T.review.title)}</h2>
          <p class="section-subtitle">${t(T.review.subtitle)}</p>
          <a href="https://g.page/r/CfL1UR7vcyNtEBM/review" target="_blank" rel="noopener noreferrer" class="review-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            ${t(T.review.cta)}
          </a>
          <p class="review-thanks">${t(T.review.thanks)}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-brand">Heliopolis</div>
        <div class="footer-cin">CIN: IT089017C2DKRZXJTO — CIR: 19089017C265790</div>
        <div class="footer-divider"></div>
        <p>${t(T.footer.madeWith)}</p>
        <div class="footer-divider"></div>
        <p class="footer-legal">
          <a href="#" class="footer-legal-link" data-open-modal="privacy">${t(T.cookie.footerPrivacy)}</a> · 
          <a href="#" class="footer-legal-link" data-open-modal="cookie">${t(T.cookie.footerCookie)}</a>
        </p>
        <p class="footer-credit">© ${new Date().getFullYear()} All rights reserved — Made with 🖤 by <a href="https://encreade.com" target="_blank" rel="noopener noreferrer">Encreade</a></p>
      </div>
    </footer>

    <!-- Cookie Banner -->
    <div class="cookie-banner" id="cookieBanner" style="display:none">
      <p>${t(T.cookie.bannerText)}</p>
      <div class="cookie-banner-actions">
        <button class="cookie-btn cookie-btn--accept" id="cookieAccept">${t(T.cookie.accept)}</button>
        <button class="cookie-btn cookie-btn--info" data-open-modal="cookie">${t(T.cookie.moreInfo)}</button>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div class="legal-modal" id="modal-privacy">
      <div class="legal-modal-overlay"></div>
      <div class="legal-modal-content">
        <button class="legal-modal-close">&times;</button>
        <h2>${t(T.cookie.privacyTitle)}</h2>
        <div class="legal-modal-body">
          <p><strong>Titolare del trattamento:</strong> Heliopolis — Via Bainsizza 94, 96100 Siracusa (SR), Italia.</p>
          <p><strong>Dati raccolti:</strong> Il sito non raccoglie dati personali direttamente. Tuttavia, servizi di terze parti incorporati (Google Maps) possono raccogliere dati di navigazione, indirizzo IP e cookie tecnici.</p>
          <p><strong>Finalità:</strong> I dati trattati dai servizi terzi sono utilizzati esclusivamente per il funzionamento della mappa interattiva e per migliorare l'esperienza di navigazione.</p>
          <p><strong>Base giuridica:</strong> Legittimo interesse (Art. 6, par. 1, lett. f GDPR) per i cookie tecnici; consenso (Art. 6, par. 1, lett. a GDPR) per i cookie di terze parti.</p>
          <p><strong>Conservazione:</strong> I cookie di terze parti sono gestiti secondo le policy di Google. Nessun dato personale viene conservato dal titolare.</p>
          <p><strong>Diritti dell'interessato:</strong> Ai sensi degli artt. 15-22 del GDPR, è possibile esercitare i diritti di accesso, rettifica, cancellazione, limitazione e portabilità scrivendo a: info@encreade.com</p>
          <p><strong>Hosting:</strong> Il sito è ospitato su Vercel Inc. (USA), che può raccogliere dati di log (IP, user-agent). Vercel aderisce alle Standard Contractual Clauses per il trasferimento dei dati extra-UE.</p>
        </div>
      </div>
    </div>

    <!-- Cookie Policy Modal -->
    <div class="legal-modal" id="modal-cookie">
      <div class="legal-modal-overlay"></div>
      <div class="legal-modal-content">
        <button class="legal-modal-close">&times;</button>
        <h2>${t(T.cookie.policyTitle)}</h2>
        <div class="legal-modal-body">
          <p><strong>Cosa sono i cookie:</strong> I cookie sono piccoli file di testo memorizzati dal browser per garantire il funzionamento del sito e ricordare le preferenze dell'utente.</p>
          <p><strong>Cookie tecnici (necessari):</strong></p>
          <ul>
            <li><code>heliopolis_lang</code> — Salva la lingua selezionata (localStorage). Durata: persistente.</li>
            <li><code>heliopolis_cookie</code> — Registra il consenso ai cookie. Durata: 365 giorni.</li>
          </ul>
          <p><strong>Cookie di terze parti:</strong></p>
          <ul>
            <li><strong>Google Maps</strong> (iframe embed) — Google può impostare cookie per il funzionamento della mappa. Per maggiori informazioni: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy Google</a></li>
          </ul>
          <p><strong>Come disabilitare i cookie:</strong> È possibile gestire i cookie tramite le impostazioni del proprio browser. La disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento del sito.</p>
          <p><strong>Aggiornamento:</strong> Questa policy può essere aggiornata periodicamente. Ultimo aggiornamento: marzo 2026.</p>
        </div>
      </div>
    </div>

    <!-- Scroll to Top -->
    <button class="scroll-top" aria-label="Scroll to top">${SVG.arrowUp}</button>
    `;

    initMainInteractions(sig);
  }

  // ---- Steps renderer (used by check-in landing) ----
  // Photo mapping: 01+02 = main entrance PIN, 03 = electricity card, 04 = room number, 05 = automatic door
  function renderSteps(room) {
    return [
      { n: 1, title: t(T.checkin.step1title), text: t(T.checkin.step1text), imgs: ['public/01.jpeg', 'public/02.jpeg'] },
      { n: 2, title: t(T.checkin.step2title), text: t(T.checkin.step2text), imgs: [] },
      { n: 3, title: t(T.checkin.step3title), text: t(T.checkin.step3text), imgs: ['public/04.jpeg'] },
      { n: 4, title: t(T.checkin.step4title), text: t(T.checkin.step4text), imgs: ['public/05.jpeg'] },
      { n: 5, title: t(T.checkin.step5title), text: t(T.checkin.step5text), imgs: ['public/03.jpeg'] }
    ].map(s => `
      <div class="step">
        <div class="step-number">${s.n}</div>
        <div class="step-content">
          <h4>${s.title}</h4>
          <p>${s.text}</p>
          ${s.imgs.map(img => `<img src="${img}" alt="Step ${s.n}" class="step-photo">`).join('')}
        </div>
      </div>`).join('');
  }

  // ---- Main site interactions ----
  function initMainInteractions(sig) {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.setLang;
        localStorage.setItem('heliopolis_lang', currentLang);
        document.documentElement.lang = currentLang;
        const scrollY = window.scrollY;
        renderMainSite();
        window.scrollTo(0, scrollY);
      });
    });

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // Staggered reveal for grid children
    document.querySelectorAll('.rules-grid .rule-item, .landmarks-grid .landmark-card, .contacts-grid .contact-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
    });
    const gridObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.rule-item, .landmark-card, .contact-card').forEach(child => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
          gridObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.rules-grid, .landmarks-grid, .contacts-grid').forEach(g => gridObs.observe(g));

    // Falling rose petals in hero
    const hero = document.querySelector('.hero');
    if (hero) {
      const petals = ['🍋', '🍋', '🍋', '🌿'];
      function spawnPetal() {
        const el = document.createElement('span');
        el.className = 'petal';
        el.textContent = petals[Math.floor(Math.random() * petals.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.animationDuration = (4 + Math.random() * 4) + 's';
        el.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
        hero.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }
      // Spawn a few petals periodically
      for (let i = 0; i < 5; i++) setTimeout(spawnPetal, i * 600);
      setInterval(spawnPetal, 2000);
    }

    // Navbar scroll
    const nav = document.getElementById('navbar');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true, ...sig });
    onScroll();

    // Mobile menu
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }));

    // Scroll top
    const stb = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => stb.classList.toggle('visible', window.scrollY > 500), { passive: true, ...sig });
    stb.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Cookie banner
    const cookieBanner = document.getElementById('cookieBanner');
    if (!localStorage.getItem('heliopolis_cookie')) {
      cookieBanner.style.display = '';
    }
    document.getElementById('cookieAccept').addEventListener('click', () => {
      localStorage.setItem('heliopolis_cookie', '1');
      cookieBanner.style.display = 'none';
    });

    // Legal modals
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('modal-' + btn.dataset.openModal);
        if (modal) modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    document.querySelectorAll('.legal-modal-close, .legal-modal-overlay').forEach(el => {
      el.addEventListener('click', () => {
        el.closest('.legal-modal').classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    initChatbot();
  }

  function initChatbot() {
    const CICCIO_SVG = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="7" cy="27" rx="3.5" ry="4.5" fill="#E8A882"/>
      <ellipse cx="43" cy="27" rx="3.5" ry="4.5" fill="#E8A882"/>
      <ellipse cx="25" cy="27" rx="18" ry="19" fill="#F5C5A3"/>
      <path d="M8 20 Q10 9 19 7" stroke="#5C3317" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M42 20 Q40 9 31 7" stroke="#5C3317" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M9 19 Q25 14 41 19" stroke="#5C3317" stroke-width="2.5" fill="none" opacity="0.35"/>
      <path d="M13 20 Q17 17 21 19" stroke="#5C3317" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M29 18 Q33 16 37 19" stroke="#5C3317" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="17" cy="25" rx="3" ry="2.2" fill="#3D2B1F"/>
      <ellipse cx="33" cy="25" rx="3" ry="2.2" fill="#3D2B1F"/>
      <circle cx="18.2" cy="23.8" r="1" fill="white"/>
      <circle cx="34.2" cy="23.8" r="1" fill="white"/>
      <path d="M23 30 Q25 33 27 30" stroke="#C07850" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M15 36 Q25 45 35 36" fill="white" opacity="0.9"/>
      <path d="M15 36 Q25 45 35 36" stroke="#C0604A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M15 36 Q25 39 35 36" stroke="#C0604A" stroke-width="1" fill="none" opacity="0.4"/>
      <ellipse cx="11" cy="31" rx="4" ry="2.5" fill="#F08070" opacity="0.28"/>
      <ellipse cx="39" cy="31" rx="4" ry="2.5" fill="#F08070" opacity="0.28"/>
      <path d="M12 30 Q10 33 12 37" stroke="#D4956A" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
      <path d="M38 30 Q40 33 38 37" stroke="#D4956A" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
      <circle cx="20" cy="39" r="0.7" fill="#C07850" opacity="0.45"/>
      <circle cx="23" cy="41" r="0.7" fill="#C07850" opacity="0.45"/>
      <circle cx="27" cy="41" r="0.7" fill="#C07850" opacity="0.45"/>
      <circle cx="30" cy="39" r="0.7" fill="#C07850" opacity="0.45"/>
      <ellipse cx="25" cy="6" rx="8" ry="5.5" fill="#E8D820" transform="rotate(-15 25 6)"/>
      <ellipse cx="24" cy="5.5" rx="5" ry="3.5" fill="#F4EC50" transform="rotate(-15 25 6)"/>
      <path d="M24 1.5 Q27 0 30 2" stroke="#3A7020" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M29.5 2 Q32 1 32.5 3.5" stroke="#3A7020" stroke-width="0.9" fill="none" stroke-linecap="round"/>
    </svg>`;

    const WELCOME = {
      it: 'Ciao! 😄 Sono Cicciobot, il vostro concierge virtuale. Siracusa la conosco come le mie tasche — chiedetemi quello che volete!',
      en: 'Hey there! 😄 I\'m Cicciobot, your virtual concierge. I know Syracuse like the back of my hand — ask me anything!',
      fr: 'Salut ! 😄 Je suis Cicciobot, votre concierge virtuel. Je connais Syracuse comme ma poche — posez-moi toutes vos questions !',
      es: '¡Hola! 😄 Soy Cicciobot, su concierge virtual. Conozco Siracusa como la palma de mi mano — ¡pregúntenme lo que quieran!'
    };
    // ?',
      //🌹
    const PLACEHOLDER = {
      it: 'Scrivi un messaggio…',
      en: 'Write a message…',
      fr: 'Écrivez un message…',
      es: 'Escribe un mensaje…'
    };
    const ERR_MSG = {
      it: 'Mi dispiace, si è verificato un errore. Riprova tra poco.',
      en: 'Sorry, something went wrong. Please try again.',
      fr: 'Désolée, une erreur s\'est produite. Réessayez.',
      es: 'Lo siento, ha ocurrido un error. Inténtelo de nuevo.'
    };

    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
      <button id="chat-toggle" aria-label="Chat with Cicciobot">${CICCIO_SVG}</button>
      <div id="chat-panel" role="dialog" aria-label="Cicciobot — Concierge">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">${CICCIO_SVG}</div>
            <div>
              <div class="chat-name">Cicciobot</div>
              <div class="chat-status">Concierge &middot; Heliopolis</div>
            </div>
          </div>
          <button id="chat-close" aria-label="Close">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="chat-msg chat-msg--rose">
            <div class="chat-bubble">${WELCOME[currentLang] || WELCOME.en}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input id="chat-input" type="text" placeholder="${PLACEHOLDER[currentLang] || PLACEHOLDER.en}" autocomplete="off" maxlength="500">
          <button id="chat-send" aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    const panel   = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const input   = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('chat-send');
    const msgArea  = document.getElementById('chat-messages');

    let history = [];
    let busy = false;

    document.getElementById('chat-toggle').addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) setTimeout(() => input.focus(), 260);
    });

    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    sendBtn.addEventListener('click', send);

    function addBubble(role, text) {
      const wrap = document.createElement('div');
      wrap.className = `chat-msg chat-msg--${role === 'user' ? 'user' : 'rose'}`;
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      msgArea.appendChild(wrap);
      msgArea.scrollTop = msgArea.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.id = 'chat-typing-indicator';
      div.className = 'chat-msg chat-msg--rose';
      div.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
      msgArea.appendChild(div);
      msgArea.scrollTop = msgArea.scrollHeight;
    }

    function hideTyping() {
      document.getElementById('chat-typing-indicator')?.remove();
    }

    async function send() {
      const text = input.value.trim();
      if (!text || busy) return;

      input.value = '';
      busy = true;
      sendBtn.disabled = true;

      addBubble('user', text);
      history.push({ role: 'user', content: text });
      showTyping();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        hideTyping();

        if (!res.ok) throw new Error('api_error');

        const data = await res.json();
        addBubble('assistant', data.content);
        history.push({ role: 'assistant', content: data.content });

        if (history.length > 20) history = history.slice(-20);

      } catch (_) {
        hideTyping();
        addBubble('assistant', ERR_MSG[currentLang] || ERR_MSG.en);
      }

      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

});

