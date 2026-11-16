// Builds the static website into docs/ (what GitHub Pages serves).
// Usage: node build.mjs
// Edit content in src/ (pages, data, site.config.json), never in docs/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { services } from './src/data/services.mjs';
import { clients } from './src/data/clients.mjs';
import { industries } from './src/data/industries.mjs';
import { icons, arrow } from './src/data/icons.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'docs');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/site.config.json'), 'utf8'));
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const layout = read('src/layout.html');
const SITE = cfg.siteUrl.replace(/\/$/, '');
const NAME = cfg.siteName;

// ---------- validation (keeps bad IDs from breaking or injecting into pages) ----------
const check = (val, re, label) => { if (val && !re.test(val)) throw new Error(`site.config.json: ${label} "${val}" looks wrong`); };
check(cfg.ga4Id, /^G-[A-Z0-9]{4,15}$/, 'ga4Id');
check(cfg.metaPixelId, /^\d{10,20}$/, 'metaPixelId');
check(cfg.clarityId, /^[a-z0-9]{6,20}$/i, 'clarityId');
check(cfg.bookingUrl, /^https:\/\/[^\s"'<>]+$/, 'bookingUrl');
check(cfg.googleSiteVerification, /^[A-Za-z0-9_-]{10,100}$/, 'googleSiteVerification');
check(cfg.email, /^[^\s@"<>]+@[^\s@"<>]+\.[a-z]{2,}$/i, 'email');
check(cfg.customDomain,/^[a-z0-9.-]+\.[a-z]{2,}$/, 'customDomain');
for (const [k, v] of Object.entries(cfg.social || {})) check(v, /^https:\/\/[^\s"'<>]+$/, `social.${k}`);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonScript = obj => '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';

// ---------- shared HTML pieces (same markup the original site used) ----------
const pageHero = (kick, h1, p, actions = '') =>
  `<div class="page-hero"><div class="orb-wrap"><span class="orb orb-1"></span><span class="orb orb-2"></span></div><div class="grid-overlay"></div><div class="wrap reveal"><div class="eyebrow" style="justify-content:center"><span class="dot"></span>${kick}</div><h1>${h1}</h1><p>${p}</p>${actions}</div></div>`;
const heroActions = `<div class="hero-actions"><a class="btn btn-primary btn-lg" data-nav="contact">Book Free Strategy Call ${arrow}</a><a class="btn btn-ghost btn-lg" data-nav="portfolio">See our work</a></div>`;
const ctaBand = `<section class="section" style="padding-top:0"><div class="wrap"><div class="cta-band reveal"><span class="orb orb-1" style="background:#2F6BFF"></span><span class="orb orb-2" style="background:#7C5CFF"></span><div class="inner"><h2 class="h-lg">Let’s engineer your next growth curve.</h2><p>Book a free 30-minute strategy call. We’ll audit your funnel and show you exactly where the compounding wins are.</p><div class="row"><a class="btn btn-primary btn-lg" data-nav="contact">Book Free Strategy Call ${arrow}</a></div></div></div></div></section>`;
const tick = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const faqHtml = faqs => faqs.map(([q, a]) => `<div class="faq-item"><button class="faq-q">${q}<span class="ico"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span></button><div class="faq-a"><p>${a}</p></div></div>`).join('');
const faqSection = (faqs, title = 'Questions, answered.') => `<section class="section"><div class="wrap"><div class="s-head center reveal"><div class="eyebrow" style="justify-content:center"><span class="dot"></span>FAQ</div><h2 class="h-lg">${title}</h2></div><div class="faq reveal d1">${faqHtml(faqs)}</div></div></section>`;
const sectionHead = (eyebrow, h2, center = true) => `<div class="s-head${center ? ' center' : ''} reveal"><div class="eyebrow"${center ? ' style="justify-content:center"' : ''}><span class="dot"></span>${eyebrow}</div><h2 class="h-lg">${h2}</h2></div>`;
const svcCard = s => `<div class="svc reveal"><span class="tag">${s.tag}</span><span class="s-ic ${s.color}"><svg viewBox="0 0 24 24" fill="none">${icons[s.icon]}</svg></span><h3>${s.title}</h3><p>${s.short}</p><a class="s-link" data-nav="services/${s.slug}">Learn more ${arrow}</a></div>`;
const processSteps = `<section class="section" style="background:var(--bg-2)"><div class="wrap">${sectionHead('How we work', 'The compounding loop.')}<div class="steps"><div class="step reveal"><div class="n">01</div><h3>Audit &amp; Strategy</h3><p>We map your funnel, unit economics and quickest wins into a clear 90-day plan.</p></div><div class="step reveal d1"><div class="n">02</div><h3>Build &amp; Launch</h3><p>Tracking, creative and campaigns go live — instrumented to measure every rupee.</p></div><div class="step reveal d2"><div class="n">03</div><h3>Test &amp; Improve</h3><p>Weekly experiments cut waste and scale what works. Small gains, stacked.</p></div><div class="step reveal d3"><div class="n">04</div><h3>Scale &amp; Report</h3><p>We put budget behind winners and report results in plain language.</p></div></div></div></section>`;

// ---------- portfolio ----------
const publishedCases = clients.filter(c => c.caseStudy && c.caseStudy.published);
function portCard(c) {
  const tile = c.logo ? `<img src="{{BASE}}${esc(c.logo)}" alt="${esc(c.name)} logo" loading="lazy">` : `<span>${c.ini}</span>`;
  const metric = c.metric ? `<div class="port-metric"><b>${esc(c.metric)}</b><span>${esc(c.metricLabel)}</span></div>` : '';
  const link = c.caseStudy && c.caseStudy.published ? `<a class="port-link" data-nav="portfolio/${c.slug}">Read case study ${arrow}</a>` : '';
  return `<div class="port" data-cat="${c.cat}"><div class="port-img"><span class="cat">${c.catL}</span><div class="port-tile ${c.tile}${c.logo ? ' has-logo' : ''}">${tile}</div></div><div class="port-body"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>${metric}${link}</div></div>`;
}

// ---------- page definitions ----------
const pages = [];
const add = p => pages.push({ robots: 'index, follow', ...p });

add({ route: '', key: 'home', nav: 'home', title: `${NAME} | Performance Marketing & Digital Growth Agency`,
  description: 'Kaizen is a performance marketing agency for Meta Ads, Google Ads, SEO, lead generation and AI automation — engineered for measurable, compounding growth in India and the GCC.',
  content: read('src/pages/home.html') });
add({ route: 'about/', key: 'about', nav: 'about', title: `About Us | ${NAME}`,
  description: 'Kaizen is a performance marketing agency built on kaizen: continuous, measured improvement for education, travel and service brands in India and the GCC.',
  content: read('src/pages/about.html'), crumbs: [['About', 'about/']] });
add({ route: 'services/', key: 'services', nav: 'services', title: `Digital Marketing Services | ${NAME}`,
  description: 'Performance marketing, Meta Ads, Google Ads, SEO, social media, web design, branding, AI automation, lead generation and CRO — run as one growth engine.',
  content: read('src/pages/services.html'), crumbs: [['Services', 'services/']] });
add({ route: 'portfolio/', key: 'portfolio', nav: 'portfolio', title: `Portfolio & Client Work | ${NAME}`,
  description: 'Brands we work with across education, travel, training and hospitality — including Akbar Study Abroad, Akbar Umrah and Akbar Training Center Bahrain.',
  content: read('src/pages/portfolio.html').replace('{{PORTFOLIO_GRID}}', clients.map(portCard).join('')), crumbs: [['Portfolio', 'portfolio/']] });
add({ route: 'blog/', key: 'blog', nav: 'blog', title: `The Kaizen Journal — Growth Playbooks | ${NAME}`,
  description: 'Practical growth playbooks for Meta Ads, Google Ads, SEO, CRO and AI automation from Kaizen.',
  content: read('src/pages/blog.html'), crumbs: [['Blog', 'blog/']] });
add({ route: 'contact/', key: 'contact', nav: 'contact', title: `Contact & Free Strategy Call | ${NAME}`,
  description: 'Book a free 30-minute strategy call with Kaizen, or message us on WhatsApp. A senior strategist replies within one business day.',
  content: read('src/pages/contact.html'), crumbs: [['Contact', 'contact/']] });
add({ route: 'privacy-policy/', key: 'privacy', nav: 'privacy-policy', title: `Privacy Policy | ${NAME}`,
  description: 'How Kaizen collects, uses and protects information submitted through this website.',
  content: read('src/pages/privacy-policy.html'), crumbs: [['Privacy Policy', 'privacy-policy/']] });

for (const s of services) {
  const related = services.filter(o => o.slug !== s.slug && (o.tag === s.tag || o.tag === 'Core')).slice(0, 3);
  const content = `<section class="page active" id="page-service">${pageHero(s.title, s.h1, s.intro, heroActions)}
<section class="section"><div class="wrap"><div class="detail-grid">
<div class="reveal">${sectionHead('What’s included', 'Everything it takes, handled.', false)}<ul class="check-list">${s.includes.map(i => `<li>${tick}<span>${i}</span></li>`).join('')}</ul></div>
<div class="info-card reveal d1"><span class="s-ic ${s.color}"><svg viewBox="0 0 24 24" fill="none">${icons[s.icon]}</svg></span><h3>Best for</h3><ul class="check-list compact">${s.forWho.map(i => `<li>${tick}<span>${i}</span></li>`).join('')}</ul><a class="btn btn-primary" data-nav="contact">Get a free ${s.title} audit ${arrow}</a></div>
</div></div></section>
${processSteps}
${faqSection(s.faqs)}
<section class="section" style="padding-top:0"><div class="wrap">${sectionHead('Works well with', 'Related services.')}<div class="svc-grid">${related.map(svcCard).join('')}</div></div></section>
${ctaBand}</section>`;
  add({ route: `services/${s.slug}/`, key: 'service', nav: 'services', title: `${s.title} Agency in India & the GCC | ${NAME}`,
    description: s.metaDescription, content, crumbs: [['Services', 'services/'], [s.title, `services/${s.slug}/`]],
    schema: { '@context': 'https://schema.org', '@type': 'Service', name: s.title, serviceType: s.title, description: s.metaDescription,
      provider: { '@type': 'ProfessionalService', name: NAME, alternateName: 'Kaizen Agency', url: SITE + '/' }, areaServed: ['India', 'Bahrain', 'United Arab Emirates', 'Saudi Arabia'] } });
}

const svcBySlug = Object.fromEntries(services.map(s => [s.slug, s]));
for (const ind of industries) {
  const ours = clients.filter(c => c.cat === ind.clientCat);
  const content = `<section class="page active" id="page-industry">${pageHero(ind.kicker, ind.h1, ind.intro, heroActions)}
<section class="section"><div class="wrap">${sectionHead('Sound familiar?', 'What holds growth back — and how we fix it.')}<div class="svc-grid two">${ind.pains.map(([p, f], i) => `<div class="svc reveal${i % 2 ? ' d1' : ''}"><h3>${p}</h3><p>${f}</p></div>`).join('')}</div></div></section>
<section class="section" style="background:var(--bg-2)"><div class="wrap">${sectionHead('Our playbook', 'What we run for you.')}<div class="playbook">${ind.playbook.map(([t, d], i) => `<div class="pb-item reveal"><div class="n">${String(i + 1).padStart(2, '0')}</div><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap">${sectionHead('Trusted in this industry', 'Brands we work with.')}<div class="chip-row reveal">${ours.map(c => `<a class="chip-link" data-nav="${c.caseStudy && c.caseStudy.published ? 'portfolio/' + c.slug : 'portfolio'}">${esc(c.name)}</a>`).join('')}</div>
<div class="svc-grid" style="margin-top:56px">${['meta-ads', 'google-ads', 'lead-generation'].map(k => svcCard(svcBySlug[k])).join('')}</div></div></section>
${faqSection(ind.faqs)}
${ctaBand}</section>`;
  add({ route: `industries/${ind.slug}/`, key: 'industry', nav: 'services', title: `${ind.title} | ${NAME}`,
    description: ind.metaDescription, content, crumbs: [['Industries', `industries/${ind.slug}/`], [ind.navTitle, `industries/${ind.slug}/`]] });
}

for (const c of publishedCases) {
  const cs = c.caseStudy;
  const results = cs.results.length ? `<section class="section dark-band"><div class="wrap"><div class="stats">${cs.results.map((r, i) => `<div class="stat reveal${i ? ' d' + i : ''}"><div class="num"><span>${esc(r.v)}</span></div><div class="lbl">${esc(r.k)}</div></div>`).join('')}</div></div></section>` : '';
  const quote = cs.quote ? `<section class="section" style="padding-top:0"><div class="wrap"><blockquote class="case-quote reveal"><p>“${esc(cs.quote)}”</p><cite>${esc(cs.quoteBy)}</cite></blockquote></div></section>` : '';
  const content = `<section class="page active" id="page-case">${pageHero(`Case study · ${c.catL}`, esc(c.name), esc(c.desc))}
${results}
<section class="section"><div class="wrap"><div class="detail-grid">
<div class="reveal">${sectionHead('The challenge', 'Where they started.', false)}<p class="muted case-text">${esc(cs.challenge)}</p></div>
<div class="reveal d1">${sectionHead('What we did', 'The approach.', false)}<ul class="check-list">${cs.approach.map(a => `<li>${tick}<span>${esc(a)}</span></li>`).join('')}</ul>
<div class="chip-row" style="margin-top:24px">${cs.services.map(s => `<span class="chip-link">${esc(s)}</span>`).join('')}</div>${cs.period ? `<p class="muted" style="margin-top:16px;font-size:14px">Period: ${esc(cs.period)}</p>` : ''}</div>
</div></div></section>
${quote}
${ctaBand}</section>`;
  add({ route: `portfolio/${c.slug}/`, key: 'case', nav: 'portfolio', title: `${c.name} Case Study | ${NAME}`,
    description: `How Kaizen helped ${c.name}: ${cs.challenge.slice(0, 110)}`, content,
    crumbs: [['Portfolio', 'portfolio/'], [c.name, `portfolio/${c.slug}/`]] });
}

// ---------- head extras ----------
const orgSchema = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: NAME, alternateName: 'Kaizen Agency',
  description: 'Performance marketing agency specialising in Meta Ads, Google Ads, SEO, lead generation and AI automation.',
  url: SITE + '/', image: SITE + '/assets/img/og-image.jpg', telephone: cfg.phone, email: cfg.email, priceRange: '₹₹',
  address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
  areaServed: ['India', 'Bahrain', 'United Arab Emirates', 'Saudi Arabia'],
  knowsAbout: services.map(s => s.title),
  sameAs: Object.values(cfg.social || {}).filter(Boolean) };

function tracking() {
  let h = '';
  if (cfg.ga4Id) h += `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${cfg.ga4Id}');</script>\n`;
  if (cfg.metaPixelId) h += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cfg.metaPixelId}');fbq('track','PageView');</script>\n`;
  if (cfg.clarityId) h += `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${cfg.clarityId}");</script>\n`;
  return h;
}

function faqSchema(html) {
  const qs = [...html.matchAll(/<button class="faq-q">([\s\S]*?)<span class="ico">[\s\S]*?<div class="faq-a"><p>([\s\S]*?)<\/p><\/div>/g)];
  if (!qs.length) return null;
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs.map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } })) };
}

// ---------- render ----------
const industryLinks = industries.map(i => `<a data-nav="industries/${i.slug}">${i.navTitle}</a>`).join('');
const clientConfig = { formspree: cfg.formspreeEndpoint || '', booking: cfg.bookingUrl || '' };

function render(p, baseOverride) {
  const depth = p.route.split('/').filter(Boolean).length;
  const BASE = baseOverride ?? '../'.repeat(depth);
  const canonical = SITE + '/' + p.route;
  const schemas = [orgSchema];
  if (p.crumbs) schemas.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', ''], ...p.crumbs].map(([n, r], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + '/' + r })) });
  const fs_ = faqSchema(p.content); if (fs_) schemas.push(fs_);
  if (p.schema) schemas.push(p.schema);
  let head = '';
  if (cfg.googleSiteVerification && p.route === '') head += `<meta name="google-site-verification" content="${cfg.googleSiteVerification}">\n`;
  head += schemas.map(jsonScript).join('\n') + '\n';
  head += `<script>window.KAIZEN=${JSON.stringify(clientConfig).replace(/</g, '\\u003c')};</script>\n`;
  head += tracking();
  const bodyEnd = cfg.metaPixelId ? `<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${cfg.metaPixelId}&amp;ev=PageView&amp;noscript=1"></noscript>` : '';

  let html = layout
    .replace('{{CONTENT}}', p.content)
    .replace('{{HEAD_EXTRA}}', head)
    .replace('{{BODY_END}}', bodyEnd)
    .replace('{{INDUSTRY_LINKS}}', industryLinks)
    .replaceAll('{{TITLE}}', esc(p.title))
    .replaceAll('{{DESCRIPTION}}', esc(p.description))
    .replaceAll('{{ROBOTS}}', p.robots)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{OG_IMAGE}}', SITE + '/assets/img/og-image.jpg')
    .replaceAll('{{PAGE}}', p.key)
    .replaceAll('{{BASE}}', BASE);

  // data-nav="x" → real links (and active state, and booking hook on "Book" buttons)
  html = html.replace(/<a\b([^>]*?)\sdata-nav="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (m, pre, target, post, inner) => {
    let attrs = (pre + post).replace(/\shref="[^"]*"/, '');
    const isActive = target === p.nav || (target === 'home' && p.nav === 'home');
    attrs = attrs.replace(/\sclass="([^"]*)"/, (_, c) => ` class="${c.replace(/\bactive\b/, '').trim()}${isActive ? ' active' : ''}"`.replace(' class=" active"', ' class="active"'));
    if (isActive && !/\sclass=/.test(attrs)) attrs += ' class="active"';
    attrs = attrs.replace(/\sclass=""/, '');
    const href = target === 'home' ? (BASE || './') : BASE + target + '/';
    const book = target === 'contact' && /Book|Strategy Call/i.test(inner) ? ' data-book' : '';
    return `<a href="${href}"${attrs}${book} data-nav="${target}">${inner}</a>`;
  });

  // social icons: keep only those with a URL in the config
  html = html.replace(/<a href="#" data-social="(\w+)" aria-label="([^"]*)">([\s\S]*?)<\/a>/g, (m, k, label, inner) => {
    const url = (cfg.social || {})[k];
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}">${inner}</a>` : '';
  });
  html = html.replace(/<div class="foot-social">\s*<\/div>/, '');
  // the contact email is written into several pages; config.email replaces it everywhere
  html = html.replaceAll('thedigitalkaizen@gmail.com', cfg.email);
  if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error(`Unfilled token in ${p.route || 'home'}: ${html.match(/\{\{[A-Z_]+\}\}/)[0]}`);
  return html;
}

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };

for (const p of pages) write(p.route + 'index.html', render(p));

// 404 page: served at any depth, so it uses absolute paths
const base404 = cfg.customDomain ? '/' : (cfg.githubPagesPath || '/');
write('404.html', render({ route: '404/', key: '404', nav: '', robots: 'noindex', title: `Page not found | ${NAME}`, description: 'This page could not be found.',
  content: `<section class="page active" id="page-404">${pageHero('404', 'This page took a different route.', 'The page you were looking for doesn’t exist or has moved.', `<div class="hero-actions"><a class="btn btn-primary btn-lg" data-nav="home">Back to home ${arrow}</a><a class="btn btn-ghost btn-lg" data-nav="contact">Contact us</a></div>`)}</section>` }, base404));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(p => p.robots.startsWith('index')).map(p => `  <url><loc>${SITE}/${p.route}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
if (cfg.customDomain) write('CNAME', cfg.customDomain + '\n');
write('.nojekyll', '');

for (const dir of ['css', 'assets/img', 'assets/logos']) {
  if (fs.existsSync(path.join(ROOT, dir))) fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
}
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'js/site.js'), path.join(OUT, 'js/site.js'));

console.log(`Built ${pages.length} pages + 404 into docs/`);
console.log(`Tracking: GA4 ${cfg.ga4Id ? 'ON' : 'off'} · Meta Pixel ${cfg.metaPixelId ? 'ON' : 'off'} · Clarity ${cfg.clarityId ? 'ON' : 'off'} · Booking ${cfg.bookingUrl ? 'ON' : 'off'} · Custom domain ${cfg.customDomain || 'off'}`);
console.log(`Case studies published: ${publishedCases.length}/${clients.filter(c => c.caseStudy).length}`);
