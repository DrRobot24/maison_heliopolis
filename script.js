/* ============================================
   La Maison de Tante Rose — App Engine
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
  const isCheckinMode = (checkinRoom === 'rosa' || checkinRoom === 'verte');

  // SVG Icons
  const SVG = {
    rose: `<svg class="rose-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.7C7.2 11.3 6 13.5 6 16c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.5-1.2-4.7-3.3-5.8 1.1-.9 1.8-2.2 1.8-3.7C16.5 4 14.5 2 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`,
    key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    corner: `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.55">
        <g transform="translate(60,60)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#C4848A" opacity="0.7"/>
          <ellipse cx="5" cy="-5" rx="16" ry="13" fill="#D4A0A4" opacity="0.6"/>
          <ellipse cx="-3" cy="3" rx="18" ry="14" fill="#C4848A" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#E8B4B8" opacity="0.8"/>
          <ellipse cx="0" cy="0" rx="5" ry="4" fill="#F0D4D8"/>
        </g>
        <g transform="translate(120,35) scale(0.7)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#C4848A" opacity="0.6"/>
          <ellipse cx="4" cy="-4" rx="14" ry="11" fill="#D4A0A4" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="#E8B4B8" opacity="0.8"/>
          <ellipse cx="0" cy="0" rx="4" ry="3" fill="#F0D4D8"/>
        </g>
        <g transform="translate(30,110) scale(0.5)">
          <ellipse cx="0" cy="0" rx="16" ry="12" fill="#C4848A" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="#E8B4B8" opacity="0.7"/>
        </g>
        <path d="M60 78 C 55 120, 70 160, 90 200" stroke="#8B9E7E" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M84 49 C 100 80, 95 120, 90 200" stroke="#8B9E7E" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M30 116 C 40 140, 60 170, 90 200" stroke="#8B9E7E" stroke-width="1.5" fill="none" opacity="0.35"/>
        <path d="M52 100 C 30 95, 20 110, 40 115 C 30 105, 38 98, 52 100Z" fill="#8B9E7E" opacity="0.4"/>
        <path d="M92 90 C 110 80, 120 95, 105 102 C 115 88, 100 85, 92 90Z" fill="#A8B89D" opacity="0.35"/>
        <path d="M75 140 C 55 132, 45 145, 62 150 C 50 138, 60 135, 75 140Z" fill="#8B9E7E" opacity="0.3"/>
        <path d="M95 130 C 115 125, 125 138, 108 143 C 120 128, 105 127, 95 130Z" fill="#A8B89D" opacity="0.3"/>
        <circle cx="100" cy="65" r="5" fill="#E8B4B8" opacity="0.3"/>
        <circle cx="40" cy="80" r="4" fill="#D4A0A4" opacity="0.25"/>
      </g>
    </svg>`
  };

  // Auto-detect language
  const saved = localStorage.getItem('tanterose_lang');
  if (saved && ['it', 'en', 'fr', 'es'].includes(saved)) currentLang = saved;
  else {
    const bl = navigator.language.slice(0, 2);
    if (['it', 'en', 'fr', 'es'].includes(bl)) currentLang = bl;
  }
  document.documentElement.lang = currentLang;

  function t(obj) { return obj[currentLang] || obj['en'] || ''; }

  function roomDisplayName(room) {
    if (room === 'rosa') return '🌹 Chambre Rosa';
    if (room === 'verte') return '🌿 Chambre Verte';
    return '';
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
    document.title = `Check-in — ${roomDisplayName(checkinRoom)} — La Maison de Tante Rose`;

    app.innerHTML = `
    <div class="checkin-landing">
      <div class="checkin-landing__corner checkin-landing__corner--tl">${SVG.corner}</div>
      <div class="checkin-landing__corner checkin-landing__corner--br">${SVG.corner}</div>

      <div class="checkin-landing__card">
        <img src="public/logo.jpeg" alt="La Maison de Tante Rose" class="checkin-landing__logo">
        <div class="checkin-landing__brand">La Maison de Tante Rose</div>
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

      <footer class="checkin-landing__footer">
        <p>${t(T.checkinLanding.footer)}</p>
      </footer>
    </div>`;

    // Language switcher
    document.querySelectorAll('.lang-btn-sm').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.setLang;
        localStorage.setItem('tanterose_lang', currentLang);
        document.documentElement.lang = currentLang;
        renderCheckinLanding();
      });
    });
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
        <a href="#" class="nav-brand" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">La Maison de Tante Rose</a>
        <button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
        <ul class="nav-links">
          <li><a href="#checkout">${t(T.nav.checkout)}</a></li>
          <li><a href="#rules">${t(T.nav.rules)}</a></li>
          <li><a href="#explore">${t(T.nav.explore)}</a></li>
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
        <img src="public/logo.jpeg" alt="La Maison de Tante Rose" class="hero-logo">
        <p class="hero-eyebrow">${t(T.hero.eyebrow)}</p>
        <h1>La Maison de Tante Rose</h1>
        <p class="hero-tagline">${t(T.hero.tagline)}</p>
        <div class="hero-location">${SVG.pin} ${t(T.hero.location)}</div>
        <p class="section-subtitle" style="margin-bottom:20px">${t(T.hero.selectLang)}</p>
        <div class="lang-selector">
          <button class="lang-btn ${currentLang === 'it' ? 'active' : ''}" data-set-lang="it">🇮🇹 Italiano</button>
          <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-set-lang="en">🇬🇧 English</button>
          <button class="lang-btn ${currentLang === 'fr' ? 'active' : ''}" data-set-lang="fr">🇫🇷 Français</button>
          <button class="lang-btn ${currentLang === 'es' ? 'active' : ''}" data-set-lang="es">🇪🇸 Español</button>
        </div>
      </div>
    </section>

    <!-- Welcome -->
    <section class="section section--white">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.welcome.title)}</h2><p class="section-subtitle">${t(T.welcome.subtitle)}</p></div>
        <div class="reveal" style="max-width:750px;margin:0 auto;text-align:center"><p>${t(T.welcome.text)}</p></div>
        <div class="floral-divider">${SVG.rose}</div>
      </div>
    </section>

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

    <!-- Rules -->
    <section class="section section--white" id="rules">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.rules.title)}</h2><p class="section-subtitle">${t(T.rules.subtitle)}</p></div>
        <div class="rules-grid reveal">${T.rules.items.map(r => `
          <div class="rule-item">
            <div class="rule-icon">${r.icon}</div>
            <div><h4>${t(r.title)}</h4><p>${t(r.desc)}</p></div>
          </div>`).join('')}
        </div>
      </div>
    </section>

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

    <!-- Where to Eat -->
    <section class="section section--white" id="eat">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.eat.title)}</h2><p class="section-subtitle">${t(T.eat.subtitle)}</p></div>
        ${T.eat.categories.map(cat => `
          <div class="restaurant-category reveal">
            <h3><span class="emoji">${cat.emoji}</span> ${t(cat.name)}</h3>
            <div class="restaurant-list">${cat.restaurants.map(r => `
              <div class="restaurant-item">
                <div class="name">${r.name}</div>
                <div class="desc">${t(r.desc)}</div>
                <div class="meta">📍 ${r.meta}</div>
              </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </section>

    <!-- Contacts -->
    <section class="section section--cream" id="contacts">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.contacts.title)}</h2><p class="section-subtitle">${t(T.contacts.subtitle)}</p></div>
        <div class="contacts-grid reveal">${T.contacts.items.map(c => `
          <div class="contact-card">
            <div class="icon">${c.icon}</div>
            <h4>${t(c.title)}</h4>
            <p><a href="${c.link}" class="phone-link">${c.value}</a></p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-brand">La Maison de Tante Rose</div>
        <div class="footer-divider"></div>
        <p>${t(T.footer.madeWith)}</p>
      </div>
    </footer>

    <!-- Scroll to Top -->
    <button class="scroll-top" aria-label="Scroll to top">${SVG.arrowUp}</button>
    `;

    initMainInteractions(sig);
  }

  // ---- Steps renderer (used by check-in landing) ----
  function renderSteps(room) {
    const prefix = (room === 'verte') ? 'verte_' : '';

    const step1title = T.checkin[prefix + 'step1title'] || T.checkin.step1title;
    const step1text  = T.checkin[prefix + 'step1text']  || T.checkin.step1text;
    const step2title = T.checkin[prefix + 'step2title'] || T.checkin.step2title;
    const step2text  = T.checkin[prefix + 'step2text']  || T.checkin.step2text;
    const step3title = T.checkin[prefix + 'step3title'] || T.checkin.step3title;
    const step3text  = T.checkin[prefix + 'step3text']  || T.checkin.step3text;

    // Photo paths per room
    const photos = {
      rosa: { step2: 'public/rosa%201.jpeg', step3: 'public/rosa%202.jpeg' },
      verte: { step2: 'public/verte1.jpeg', step3: 'public/verte%202.jpeg' }
    };
    const roomPhotos = photos[room] || photos.rosa;

    return [
      { n: 1, title: t(step1title), text: t(step1text), img: null },
      { n: 2, title: t(step2title), text: t(step2text), img: roomPhotos.step2 },
      { n: 3, title: t(step3title), text: t(step3text), img: roomPhotos.step3 }
    ].map(s => `
      <div class="step">
        <div class="step-number">${s.n}</div>
        <div class="step-content">
          <h4>${s.title}</h4>
          <p>${s.text}</p>
          ${s.img ? `<img src="${s.img}" alt="Step ${s.n}" class="step-photo">` : ''}
        </div>
      </div>`).join('');
  }

  // ---- Main site interactions ----
  function initMainInteractions(sig) {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.setLang;
        localStorage.setItem('tanterose_lang', currentLang);
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

    // Navbar scroll
    const nav = document.getElementById('navbar');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true, ...sig });
    onScroll();

    // Mobile menu
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }));

    // Scroll top
    const stb = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => stb.classList.toggle('visible', window.scrollY > 500), { passive: true, ...sig });
    stb.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});

