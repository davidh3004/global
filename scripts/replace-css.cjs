const fs = require('fs');
const file = 'c:/Users/henri/Desktop/WEBSITES/reciclaje-master/reciclaje-master/src/pages/[...lang].astro';
let content = fs.readFileSync(file, 'utf8');
const newCss = `<style>
  /* ====================================================================
     WORDPRESS-STYLE HOMEPAGE (UPDATED)
     ==================================================================== */

  /* ---------- HERO ---------- */
  .hero.hero {
    min-height: 700px;
    background: var(--green-dark);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding-top: 100px;
    padding-bottom: 120px; /* space for overlapping stats */
  }
  .hero .hero-bg {
    position: absolute;
    inset: 0;
    background: url('/about-1.jpeg') center/cover no-repeat;
    opacity: 1;
    filter: brightness(0.6) grayscale(10%);
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(90deg, rgba(15,26,18,0.95) 0%, rgba(20,58,33,0.85) 45%, rgba(20,58,33,0.1) 100%);
  }
  .hero .hero-content {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }
  .hero-copy {
    max-width: 650px;
  }

  .hero-eyebrow {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--green-light);
    margin-bottom: 20px;
  }

  .hero.hero h1 {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(48px, 6vw, 72px);
    line-height: 1.05;
    letter-spacing: 0px;
    color: #fff;
    margin-bottom: 20px;
  }
  .hero.hero h1 span.hl { color: var(--green-light); }

  .hero .hero-sub {
    font-size: 18px;
    line-height: 1.6;
    color: rgba(255,255,255,0.85);
    margin-bottom: 36px;
  }

  .hero-btns {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  /* The GET A QUOTE button from mockup is green */
  .hero-btns .btn-hero {
    background: var(--green);
    color: #fff;
    padding: 16px 32px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  .hero-btns .btn-hero:hover { background: #32a154; }

  /* The OUR SERVICES button from mockup is outline */
  .hero-btns .btn-hero-ghost {
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255,255,255,0.5);
    padding: 14px 32px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
  .hero-btns .btn-hero-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

  /* ---------- STATS BAND (overlaps hero) ---------- */
  .stats.stats {
    background: var(--green-dark);
    position: relative;
    z-index: 3;
    max-width: 1200px;
    margin: -80px auto 0;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .stats .stats-inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  .stats .stat {
    padding: 40px 24px;
    text-align: center;
    border-right: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .stats .stat:last-child { border-right: none; }
  .stats .stat-ico {
    width: 48px;
    height: 48px;
    color: var(--green-light);
    margin-bottom: 8px;
  }
  .stats .stat-ico svg { width: 100%; height: 100%; }
  .stats .stat-val {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin: 0;
  }
  .stats .stat-lbl {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }

  /* ---------- WHAT WE DO ---------- */
  .what-we-buy {
    padding: 100px 0 80px;
    background: #f8f9fa;
  }
  .wwb-head { text-align: center; max-width: 800px; margin: 0 auto 60px; }
  .sec-stamp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--green);
    margin-bottom: 16px;
  }
  .sec-stamp-rule { width: 40px; height: 2px; background: var(--green); }
  .what-we-buy .sec-title {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 48px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--green-dark);
  }
  .what-we-buy .sec-lead { display: none; } /* hidden in mockup */

  .buy-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .buy-item {
    display: flex;
    flex-direction: column;
    background: var(--green-dark);
    text-decoration: none;
    transition: transform 0.2s ease;
  }
  .buy-item:hover { transform: translateY(-5px); }
  .buy-photo {
    position: relative;
    height: 200px;
    overflow: visible;
  }
  .buy-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .buy-icon {
    position: absolute;
    left: 24px;
    bottom: -24px;
    z-index: 2;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--green-light);
  }
  .buy-icon svg { width: 48px; height: 48px; stroke-width: 1.5; }
  .buy-body { padding: 40px 24px 24px; text-align: left; }
  .buy-body h3 {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .buy-body p { display: none; } /* hidden in mockup, only title and learn more */
  .buy-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    color: var(--green-light);
    transition: gap 0.2s ease;
  }
  .buy-item:hover .buy-more { gap: 12px; }

  /* ---------- ABOUT (Built on Experience) ---------- */
  .about.about { 
    background: var(--green-dark); 
    padding: 100px 0; 
  }
  .about .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .about .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .about-panel {
    color: #fff;
  }
  .about-panel .sec-tag { 
    color: var(--green-light); 
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 14px;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .about-panel .sec-tag-line { width: 30px; height: 2px; background: var(--green-light); }
  .about-panel .sec-title {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.1;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 24px;
  }
  .about-panel .sec-title span { color: #fff; }
  .about-panel .about-text p {
    font-size: 16px;
    color: rgba(255,255,255,0.8);
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .about-panel .about-list { list-style: none; margin: 30px 0; padding: 0; }
  .about-panel .about-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    padding: 8px 0;
  }
  .about-panel .chk {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--green);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .about-panel .chk svg { width: 14px; height: 14px; stroke: #fff; stroke-width: 3; fill: none; }
  .about-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: var(--green);
    color: #fff;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.2s ease;
  }
  .about-btn:hover { background: #32a154; }

  .about-photo {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    height: 600px;
  }
  .about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .about-photo .about-badge { display: none; }

  /* ---------- CTA BAND ---------- */
  .cta-band.cta-band { 
    background: var(--green-dark);
    padding: 60px 24px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .cta-band .cta-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
  }
  .cta-band .cta-text h2 {
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-size: 32px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;
    margin: 0 0 8px 0;
    line-height: 1.2;
  }
  .cta-band .cta-text p {
    font-size: 14px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--green-light);
    margin: 0;
  }
  .cta-band .cta-actions {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
  }
  .cta-band .btn-white {
    background: var(--green);
    color: #fff;
    padding: 14px 28px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
  }
  .cta-band .btn-outline-white {
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255,255,255,0.3);
    padding: 12px 28px;
    font-family: 'Oswald', 'Arial Narrow', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
  }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 1024px) {
    .stats .stats-inner { grid-template-columns: 1fr 1fr; }
    .stats .stat:nth-child(2) { border-right: none; }
    .stats .stat:nth-child(1), .stats .stat:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .buy-grid { grid-template-columns: 1fr 1fr; }
    .about .about-grid { grid-template-columns: 1fr; }
    .about-photo { height: 400px; }
    .cta-band .cta-inner { flex-direction: column; text-align: center; }
  }
  @media (max-width: 600px) {
    .hero.hero h1 { font-size: 36px; }
    .hero-btns { flex-direction: column; align-items: stretch; }
    .stats .stats-inner { grid-template-columns: 1fr; }
    .stats .stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .stats .stat:last-child { border-bottom: none; }
    .buy-grid { grid-template-columns: 1fr; }
    .about-panel .sec-title { font-size: 36px; }
  }
</style>`;

content = content.replace(/<style>[\s\S]*<\/style>/, newCss);
fs.writeFileSync(file, content);
console.log('CSS replaced successfully');
