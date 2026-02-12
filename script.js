/* ============================================
   La Maison de Tante Rose — App Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'it';
  let abortCtrl = null;

  // SVG Icons (top-level scope)
  const SVG = {
    rose: `<svg class="rose-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.7C7.2 11.3 6 13.5 6 16c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.5-1.2-4.7-3.3-5.8 1.1-.9 1.8-2.2 1.8-3.7C16.5 4 14.5 2 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`,
    corner: `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.55">
        <!-- Rose 1 -->
        <g transform="translate(60,60)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#C4848A" opacity="0.7"/>
          <ellipse cx="5" cy="-5" rx="16" ry="13" fill="#D4A0A4" opacity="0.6"/>
          <ellipse cx="-3" cy="3" rx="18" ry="14" fill="#C4848A" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="10" ry="8" fill="#E8B4B8" opacity="0.8"/>
          <ellipse cx="0" cy="0" rx="5" ry="4" fill="#F0D4D8"/>
        </g>
        <!-- Rose 2 -->
        <g transform="translate(120,35) scale(0.7)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#C4848A" opacity="0.6"/>
          <ellipse cx="4" cy="-4" rx="14" ry="11" fill="#D4A0A4" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="#E8B4B8" opacity="0.8"/>
          <ellipse cx="0" cy="0" rx="4" ry="3" fill="#F0D4D8"/>
        </g>
        <!-- Rose 3 (bud) -->
        <g transform="translate(30,110) scale(0.5)">
          <ellipse cx="0" cy="0" rx="16" ry="12" fill="#C4848A" opacity="0.5"/>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="#E8B4B8" opacity="0.7"/>
        </g>
        <!-- Stems -->
        <path d="M60 78 C 55 120, 70 160, 90 200" stroke="#8B9E7E" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M84 49 C 100 80, 95 120, 90 200" stroke="#8B9E7E" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M30 116 C 40 140, 60 170, 90 200" stroke="#8B9E7E" stroke-width="1.5" fill="none" opacity="0.35"/>
        <!-- Leaves -->
        <path d="M52 100 C 30 95, 20 110, 40 115 C 30 105, 38 98, 52 100Z" fill="#8B9E7E" opacity="0.4"/>
        <path d="M92 90 C 110 80, 120 95, 105 102 C 115 88, 100 85, 92 90Z" fill="#A8B89D" opacity="0.35"/>
        <path d="M75 140 C 55 132, 45 145, 62 150 C 50 138, 60 135, 75 140Z" fill="#8B9E7E" opacity="0.3"/>
        <path d="M95 130 C 115 125, 125 138, 108 143 C 120 128, 105 127, 95 130Z" fill="#A8B89D" opacity="0.3"/>
        <!-- Small buds -->
        <circle cx="100" cy="65" r="5" fill="#E8B4B8" opacity="0.3"/>
        <circle cx="40" cy="80" r="4" fill="#D4A0A4" opacity="0.25"/>
      </g>
    </svg>`
  };

  // Auto-detect language first
  const saved = localStorage.getItem('tanterose_lang');
  if (saved && ['it', 'en', 'fr', 'es'].includes(saved)) currentLang = saved;
  else {
    const bl = navigator.language.slice(0, 2);
    if (['it', 'en', 'fr', 'es'].includes(bl)) currentLang = bl;
  }
  document.documentElement.lang = currentLang;

  function t(obj) { return obj[currentLang] || obj['en'] || ''; }

  // ---- PIN Gate ----
  function showPinGate() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="pin-gate">
          <div class="pin-card">
            <div class="pin-brand">🌹 La Maison de Tante Rose</div>
            <h2>${t(T.pin.title)}</h2>
            <p class="pin-subtitle">${t(T.pin.subtitle)}</p>
            <div class="pin-input-group">
              <input type="password" id="pinInput" class="pin-input" placeholder="${t(T.pin.placeholder)}" maxlength="10" autocomplete="off" inputmode="numeric">
              <div class="pin-error-msg" id="pinError"></div>
            </div>
            <button class="pin-btn" id="pinSubmit">${t(T.pin.button)}</button>
            <div class="pin-lang-row">
              <button class="pin-lang-btn ${currentLang === 'it' ? 'active' : ''}" data-pl="it">🇮🇹</button>
              <button class="pin-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-pl="en">🇬🇧</button>
              <button class="pin-lang-btn ${currentLang === 'fr' ? 'active' : ''}" data-pl="fr">🇫🇷</button>
              <button class="pin-lang-btn ${currentLang === 'es' ? 'active' : ''}" data-pl="es">🇪🇸</button>
            </div>
          </div>
        </div>`;

    const pinInput = document.getElementById('pinInput');
    const pinError = document.getElementById('pinError');
    const pinSubmit = document.getElementById('pinSubmit');

    function tryPin() {
      if (pinInput.value === ACCESS_PIN) {
        sessionStorage.setItem('tanterose_auth', ACCESS_PIN);
        app.innerHTML = '';
        render();
      } else {
        pinInput.classList.add('error');
        pinError.textContent = t(T.pin.error);
        setTimeout(() => pinInput.classList.remove('error'), 500);
      }
    }

    pinSubmit.addEventListener('click', tryPin);
    pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryPin(); });
    pinInput.focus();

    // Mini language switcher on PIN screen
    document.querySelectorAll('.pin-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.pl;
        localStorage.setItem('tanterose_lang', currentLang);
        document.documentElement.lang = currentLang;
        showPinGate();
      });
    });
  }

  // Check if already authenticated this session
  if (sessionStorage.getItem('tanterose_auth') !== ACCESS_PIN) {
    showPinGate();
  } else {
    render();
  }

  // ---- Build Page ----
  function render() {
    // Cleanup previous scroll listeners
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
          <li><a href="#checkin">${t(T.nav.checkin)}</a></li>
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

    <!-- Check-in -->
    <section class="section section--cream" id="checkin">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.checkin.title)}</h2><p class="section-subtitle">${t(T.checkin.subtitle)}</p></div>
        <div class="room-tabs reveal">
          <button class="room-tab active" data-room="rosa">🌹 ${T.checkin.roomRosa}</button>
          <button class="room-tab" data-room="verte">🌿 ${T.checkin.roomVerte}</button>
        </div>
        <div class="room-content active" id="room-rosa">
          <div class="steps reveal">${renderSteps()}</div>
        </div>
        <div class="room-content" id="room-verte">
          <div class="steps reveal">${renderSteps()}</div>
        </div>
      </div>
    </section>

    <!-- Check-out -->
    <section class="section section--white" id="checkout">
      <div class="container">
        <div class="section-header reveal"><h2>${t(T.checkout.title)}</h2><p class="section-subtitle">${t(T.checkout.subtitle)}</p></div>
        <div class="checkout-box reveal">
          <div class="time-badge">🕙 ${T.checkout.time}</div>
          <p>${t(T.checkout.text)}</p>
        </div>
      </div>
    </section>

    <!-- Rules -->
    <section class="section section--cream" id="rules">
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
    <section class="section section--white" id="explore">
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
    <section class="section section--cream" id="eat">
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
    <section class="section section--white" id="contacts">
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

    initInteractions(sig);
  }

  function renderSteps() {
    return [
      { n: 1, title: t(T.checkin.step1title), text: t(T.checkin.step1text) },
      { n: 2, title: t(T.checkin.step2title), text: t(T.checkin.step2text) },
      { n: 3, title: t(T.checkin.step3title), text: t(T.checkin.step3text) }
    ].map(s => `
      <div class="step">
        <div class="step-number">${s.n}</div>
        <div class="step-content"><h4>${s.title}</h4><p>${s.text}</p></div>
      </div>`).join('');
  }

  function initInteractions(sig) {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.setLang;
        localStorage.setItem('tanterose_lang', currentLang);
        document.documentElement.lang = currentLang;
        const scrollY = window.scrollY;
        render();
        window.scrollTo(0, scrollY);
      });
    });

    // Room tabs
    document.querySelectorAll('.room-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.room-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`room-${tab.dataset.room}`).classList.add('active');
      });
    });

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // Navbar scroll (uses AbortController signal for cleanup)
    const nav = document.getElementById('navbar');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true, ...sig });
    onScroll();

    // Mobile menu
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }));

    // Scroll top (uses AbortController signal for cleanup)
    const stb = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => stb.classList.toggle('visible', window.scrollY > 500), { passive: true, ...sig });
    stb.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});

