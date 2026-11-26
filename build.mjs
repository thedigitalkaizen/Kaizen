// Builds the static website into docs/ (what GitHub Pages serves).
// Usage: node build.mjs
// Edit content in src/ (pages, data, site.config.json), never in docs/.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { services } from './src/data/services.mjs';
import { clients } from './src/data/clients.mjs';
import { industries } from './src/data/industries.mjs';
import { icons, arrow } from './src/data/icons.mjs';
import { posts } from './src/data/posts.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'docs');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/site.config.json'), 'utf8'));
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const layout = read('src/layout.html');
const SITE = cfg.siteUrl.replace(/\/$/, '');
const NAME = cfg.siteName;
const REQUEST_MODE = !!cfg.callRequestApi; // 'Book' buttons open the vetted request page instead of the calendar

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
check(cfg.whatsappNumber, /^\d{8,15}$/, 'whatsappNumber');
const consentMode = cfg.cookieConsent || 'opt-in';
if (!['opt-in', 'notice'].includes(consentMode)) throw new Error('site.config.json: cookieConsent must be "opt-in" or "notice"');
const trackingOn = !!(cfg.ga4Id || cfg.metaPixelId || cfg.clarityId);

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
// one badge colour per industry, so colour carries meaning instead of rotating
const catColor = { education: 'ic-royal', travel: 'ic-em', hospitality: 'ic-amber', lifestyle: 'ic-violet', food: 'ic-amber' };
function portCard(c) {
  const mark = c.logo ? `<img src="{{BASE}}${esc(c.logo)}" alt="${esc(c.name)} logo" loading="lazy">` : c.ini;
  const metric = c.metric ? `<div class="port-metric"><b>${esc(c.metric)}</b><span>${esc(c.metricLabel)}</span></div>` : '';
  const link = c.caseStudy && c.caseStudy.published ? `<a class="port-link" data-nav="portfolio/${c.slug}">Read case study ${arrow}</a>` : '';
  return `<div class="port client-card reveal" data-cat="${c.cat}"><div class="client-top"><div class="client-mark ${catColor[c.cat] || 'ic-royal'}${c.logo ? ' has-logo' : ''}">${mark}</div><div><h3>${esc(c.name)}</h3><span class="client-cat">${c.catL}</span></div></div><p>${esc(c.desc)}</p>${metric}${link}</div>`;
}
const heroProof = () => `<p class="hero-proof reveal d3 in"><span class="hp-dots">${clients.slice(0, 3).map(c => `<i class="${catColor[c.cat] || 'ic-royal'}">${esc(c.ini)}</i>`).join('')}</span><span>Working with <b>${esc(clients[0].name)}</b>, <b>${esc(clients[7] ? clients[7].name : clients[1].name)}</b> and ${clients.length - 2} more brands across India &amp; the GCC</span></p>`;
const COUNTRIES = ["India", "Saudi Arabia", "UAE", "Qatar", "Bahrain", "Oman"];

// "By the numbers" bento: every number is shown with the real things it counts
const CC = { "India": "IN", "Saudi Arabia": "SA", "UAE": "AE", "Qatar": "QA", "Bahrain": "BH", "Oman": "OM" };
function proofBlock() {
  const inds = [...new Set(clients.map(c => c.catL))];
  const bars = Array.from({ length: 12 }, (_, i) => `<i style="height:${Math.round(22 + i * 78 / 11)}%"></i>`).join('');
  return `<div class="proof">
<div class="pf w reveal"><div class="pf-top"><span class="pf-n">${clients.length}</span><span class="pf-l">brands we work with</span></div><div class="pf-chips">${clients.map(c => `<span>${esc(c.name)}</span>`).join('')}</div></div>
<div class="pf reveal d1"><div class="pf-top"><span class="pf-n">${inds.length}</span><span class="pf-l">industries</span></div><div class="pf-chips">${inds.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
<div class="pf reveal d1"><div class="pf-top"><span class="pf-n">${COUNTRIES.length}</span><span class="pf-l">countries</span></div><div class="pf-cc">${COUNTRIES.map(c => `<span><b>${CC[c] || ''}</b>${esc(c)}</span>`).join('')}</div></div>
<div class="pf w reveal d2"><div class="pf-top"><span class="pf-n">10</span><span class="pf-l">tested changes per account, each week</span></div><div class="pf-track">${bars}</div><div class="pf-axis"><span>Week 1</span><span>12 weeks = 120 tested changes</span><span>Week 12</span></div></div>
</div>`;
}

function portSummary() {
  const inds = [...new Set(clients.map(c => c.catL))];
  return `<div class="port-summary reveal"><div class="ps-stats"><div><b>${clients.length}</b><span>Brands</span></div><div><b>${inds.length}</b><span>Industries</span></div><div><b>${COUNTRIES.length}</b><span>Countries</span></div></div><div class="ps-countries">${COUNTRIES.map(c => `<span>${c}</span>`).join("")}</div></div>`;
}

// ---------- testimonials (shows on the home page once any client in clients.mjs has quote + quoteBy) ----------
function testimonials() {
  const q = clients.filter(c => c.quote && c.quoteBy);
  if (!q.length) return '';
  return `<section class="section"><div class="wrap">${sectionHead('In their words', 'What our clients say.')}<div class="svc-grid">${q.map((c, i) => `<blockquote class="case-quote reveal${i % 3 ? ' d' + (i % 3) : ''}"><p>“${esc(c.quote)}”</p><cite>${esc(c.quoteBy)} · ${esc(c.name)}</cite></blockquote>`).join('')}</div></div></section>`;
}

// ---------- ad landing pages: one per industry, no menu, one goal ----------
function landingPage(ind) {
  const ours = clients.filter(c => c.cat === ind.clientCat);
  const wa = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hi AdKaizen team, I want a free audit for my ' + ind.navTitle.toLowerCase().replace(/s$/, '') + ' business')}`;
  const tel = 'tel:' + String(cfg.phone).replace(/[^+0-9]/g, '');
  const form = `<div class="form-card lp-form reveal in" id="lp-form"><h2 class="h-md">Get your free ad audit</h2><p class="muted lp-form-sub">30-minute call. You get the top 3 fixes in writing, whether or not you hire us.</p>
<form data-ok="lpOk" data-source="Landing page — ${ind.navTitle}"><div class="form-ok" id="lpOk">Thanks! We’ll WhatsApp you within one business day.</div><div class="form-error" id="lpErr">Something went wrong. Please try again, or WhatsApp us.</div><input type="text" name="_gotcha" class="fld-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="hidden" name="industry" value="${ind.navTitle}">
<div class="fld"><label for="lp-name">Your name</label><input id="lp-name" type="text" name="name" autocomplete="name" required></div>
<div class="fld"><label for="lp-phone">WhatsApp number</label><input id="lp-phone" type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="+91 98765 43210" pattern="[+0-9 ()-]{7,20}" title="Enter a phone number with country code, e.g. +91 98765 43210" required></div>
<div class="fld"><label for="lp-budget">Monthly ad budget</label><select id="lp-budget" name="budget"><option>Under ₹1L</option><option>₹1L – ₹3L</option><option>₹3L – ₹10L</option><option>₹10L+</option><option>Not running ads yet</option></select></div>
<button class="btn btn-primary btn-block btn-lg" type="submit">Get my free audit ${arrow}</button><p class="form-note">No spam. We only use your number to arrange the call.</p></form></div>`;
  const how = [['Tell us about your business', 'Share your number and budget. We reply on WhatsApp within one business day.'], ['Free 30-minute audit call', 'We go through your ads, landing page and lead follow-up with you, live on Google Meet.'], ['Leave with a written plan', 'The top 3 fixes for your account, in writing, whether or not you hire us.']];
  const content = `<section class="page active" id="page-lp">
<div class="hero lp-hero"><div class="orb-wrap"><span class="orb orb-1"></span><span class="orb orb-2"></span></div><div class="grid-overlay"></div><div class="wrap"><div class="hero-grid">
<div><div class="eyebrow reveal in"><span class="dot"></span>${ind.kicker}</div><h1 class="reveal d1 in">${ind.h1}</h1><p class="lead reveal d2 in">${ind.intro}</p>
<ul class="check-list lp-points reveal d3 in">${ind.playbook.slice(0, 3).map(([t]) => `<li>${tick}<span>${t}</span></li>`).join('')}</ul>
${ours.length ? `<p class="hero-proof reveal d3 in"><span class="hp-dots">${ours.slice(0, 3).map(c => `<i class="${catColor[c.cat] || 'ic-royal'}">${esc(c.ini)}</i>`).join('')}</span><span>Trusted by ${ours.map(c => `<b>${esc(c.name)}</b>`).join(', ')}</span></p>` : ''}</div>
${form}</div></div></div>
<section class="section"><div class="wrap">${sectionHead('Sound familiar?', 'What holds growth back, and how we fix it.')}<div class="svc-grid two">${ind.pains.map(([p, f], i) => `<div class="svc reveal${i % 2 ? ' d1' : ''}"><h3>${p}</h3><p>${f}</p></div>`).join('')}</div></div></section>
<section class="section" style="background:var(--bg-2)"><div class="wrap">${sectionHead('How it works', 'Three steps, no obligation.')}<div class="steps lp-steps">${how.map(([t, d], i) => `<div class="step reveal${i ? ' d' + i : ''}"><div class="n">0${i + 1}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap">${sectionHead('Our playbook', 'What we run for you.')}<div class="playbook">${ind.playbook.map(([t, d], i) => `<div class="pb-item reveal"><div class="n">${String(i + 1).padStart(2, '0')}</div><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></div></section>
${faqSection(ind.faqs)}
<section class="section" style="padding-top:0"><div class="wrap"><div class="cta-band reveal"><span class="orb orb-1" style="background:#2F6BFF"></span><span class="orb orb-2" style="background:#7C5CFF"></span><div class="inner"><h2 class="h-lg">Ready for more serious enquiries?</h2><p>Get a free audit of your ads and lead follow-up. It takes 30 minutes.</p><div class="row"><a class="btn btn-primary btn-lg" href="#lp-form">Get my free audit ${arrow}</a><a class="btn btn-ghost btn-lg lp-wa" href="${wa}" target="_blank" rel="noopener">WhatsApp us</a></div></div></div></div></section>
<div class="lp-sticky"><a class="lp-s-wa" href="${wa}" target="_blank" rel="noopener">WhatsApp us</a><a class="lp-s-call" href="${tel}">Call now</a><a class="lp-s-form" href="#lp-form">Free audit</a></div>
</section>`;
  add({ route: `lp/${ind.slug}/`, key: 'lp', nav: '', robots: 'noindex, follow', title: `Free Ad Audit for ${ind.navTitle} | ${NAME}`,
    description: ind.metaDescription, content });
}

// ---------- /book-a-call/: form → email code (OTP) → CRM pipeline; the booking link is sent by hand after review ----------
function bookCallPage() {
  const wa = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hi AdKaizen team, I sent a strategy call request on your website.')}`;
  const opt = a => a.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  const form = `<div class="form-card lp-form cr-card reveal in" id="call-form">
<form id="callReq" data-step="details" novalidate>
<div class="cr-head"><h2 class="h-md">Request your free call</h2><p class="muted lp-form-sub">Takes a minute. We confirm your email with a 6-digit code.</p></div>
<div class="form-error" id="crErr" role="alert"></div>
<input type="text" name="_gotcha" class="fld-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
<fieldset class="cr-details">
<div class="crf-row"><div class="fld"><label for="cr-name">Your name</label><input id="cr-name" name="name" autocomplete="name" maxlength="120" required></div>
<div class="fld"><label for="cr-company">Company / brand</label><input id="cr-company" name="company" autocomplete="organization" maxlength="160" required></div></div>
<div class="crf-row"><div class="fld"><label for="cr-email">Work email</label><input id="cr-email" type="email" name="email" autocomplete="email" maxlength="200" required></div>
<div class="fld"><label for="cr-phone">WhatsApp number</label><input id="cr-phone" type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="+91 98765 43210" maxlength="20" pattern="[+0-9 ()-]{7,20}" required></div></div>
<div class="fld"><label for="cr-web">Website or Instagram</label><input id="cr-web" name="website" maxlength="300" placeholder="yourbrand.com or @yourbrand" required></div>
<div class="crf-row"><div class="fld"><label for="cr-ind">Industry</label><select id="cr-ind" name="industry">${opt([['education', 'Education'], ['travel', 'Travel &amp; Umrah'], ['training', 'Training institute'], ['other', 'Other']])}</select></div>
<div class="fld"><label for="cr-country">Country</label><select id="cr-country" name="country">${opt([['IN', 'India'], ['AE', 'UAE'], ['SA', 'Saudi Arabia'], ['QA', 'Qatar'], ['BH', 'Bahrain'], ['OM', 'Oman'], ['KW', 'Kuwait'], ['OT', 'Other']])}</select></div></div>
<div class="fld"><label for="cr-budget">Monthly ad budget</label><select id="cr-budget" name="budget">${opt([['Under ₹1L', 'Under ₹1L'], ['₹1L – ₹3L', '₹1L – ₹3L'], ['₹3L – ₹10L', '₹3L – ₹10L'], ['₹10L+', '₹10L+'], ['Not running ads yet', 'Not running ads yet']])}</select></div>
<div class="fld"><label for="cr-msg">What do you want help with? <span class="opt">(optional)</span></label><textarea id="cr-msg" name="message" maxlength="600" rows="3"></textarea></div>
<button class="btn btn-primary btn-block btn-lg" type="submit">Send me the code ${arrow}</button>
<p class="form-note">No spam. We only use your details to review your request.</p>
</fieldset>
<fieldset class="cr-code" disabled>
<p class="cr-sent">We sent a 6-digit code to <b id="crEmailShow"></b>. Check your inbox and spam folder.</p>
<div class="fld"><label for="cr-otp">Verification code</label><input id="cr-otp" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code" class="cr-otp"></div>
<button class="btn btn-primary btn-block btn-lg" type="submit">Verify and send request ${arrow}</button>
<div class="cr-links"><button type="button" class="link-btn" id="crBack">Change details</button><button type="button" class="link-btn" id="crResend" disabled>Send a new code</button></div>
</fieldset>
</form>
<div class="cr-done" id="crDone" hidden tabindex="-1"><div class="cr-tick">${tick}</div><h2 class="h-md">Request received</h2>
<p>Thanks! A strategist will look at your business and email your personal booking link within one business day.</p>
<p class="muted">Need us sooner? Message us on WhatsApp.</p><a class="btn btn-ghost btn-block" href="${wa}" target="_blank" rel="noopener">WhatsApp us</a></div>
</div>`;
  const content = `<section class="page active" id="page-lp">
<div class="hero lp-hero"><div class="orb-wrap"><span class="orb orb-1"></span><span class="orb orb-2"></span></div><div class="grid-overlay"></div><div class="wrap"><div class="hero-grid">
<div><div class="eyebrow reveal in"><span class="dot"></span>Free strategy call</div><h1 class="reveal d1 in">Book your free strategy call</h1>
<p class="lead reveal d2 in">30 minutes on Google Meet with a senior strategist. We review every request first, so each call is prepared for your business.</p>
<ol class="cta-steps light cr-steps reveal d3 in" aria-label="How booking works">${STEPS.map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol></div>
${form}</div></div></div>
</section>`;
  add({ route: 'book-a-call/', key: 'lp', nav: '', robots: 'noindex, follow', title: `Book a Free Strategy Call | ${NAME}`,
    description: 'Request a free 30-minute strategy call with AdKaizen. Verify your email, we review your business and send your booking link.', content });
}

// ---------- page definitions ----------
const pages = [];
const add = p => pages.push({ robots: 'index, follow', ...p });

add({ route: '', key: 'home', nav: 'home', title: `${NAME} | Performance Marketing & Lead Generation in India & the GCC`,
  description: 'AdKaizen is a performance marketing agency for Meta Ads, Google Ads, SEO, lead generation and AI automation — engineered for measurable, compounding growth in India and the GCC.',
  content: read('src/pages/home.html').replace('{{HERO_PROOF}}', heroProof()) + testimonials() });
add({ route: 'about/', key: 'about', nav: 'about', title: `About Us | ${NAME}`,
  description: 'AdKaizen is a performance marketing agency built on kaizen: continuous, measured improvement for education, travel and service brands in India and the GCC.',
  content: read('src/pages/about.html'), crumbs: [['About', 'about/']] });
add({ route: 'services/', key: 'services', nav: 'services', title: `Digital Marketing Services | ${NAME}`,
  description: 'Performance marketing, Meta Ads, Google Ads, SEO, social media, web design, branding, AI automation, lead generation and CRO — run as one growth engine.',
  content: read('src/pages/services.html'), crumbs: [['Services', 'services/']] });
add({ route: 'portfolio/', key: 'portfolio', nav: 'portfolio', title: `Portfolio & Client Work | ${NAME}`,
  description: 'Brands we work with across education, travel, training and hospitality — including Akbar Study Abroad, Akbar Umrah and Akbar Training Center Bahrain.',
  content: read('src/pages/portfolio.html').replace('{{PORTFOLIO_GRID}}', clients.map(portCard).join('')).replace('{{PORTFOLIO_SUMMARY}}', portSummary()), crumbs: [['Portfolio', 'portfolio/']] });
add({ route: 'blog/', key: 'blog', nav: 'blog', title: `The AdKaizen Journal — Growth Playbooks | ${NAME}`,
  description: 'Practical growth playbooks for Meta Ads, Google Ads, SEO, CRO and AI automation from AdKaizen.',
  content: read('src/pages/blog.html'), crumbs: [['Blog', 'blog/']] });
add({ route: 'contact/', key: 'contact', nav: 'contact', title: `Contact & Free Strategy Call | ${NAME}`,
  description: 'Book a free 30-minute strategy call with AdKaizen, or message us on WhatsApp. A senior strategist replies within one business day.',
  content: read('src/pages/contact.html'), crumbs: [['Contact', 'contact/']] });
add({ route: 'privacy-policy/', key: 'privacy', nav: 'privacy-policy', title: `Privacy Policy | ${NAME}`,
  description: 'How AdKaizen collects, uses and protects information submitted through this website.',
  content: read('src/pages/privacy-policy.html'), crumbs: [['Privacy Policy', 'privacy-policy/']] });

// ROI calculator as its own page (same widget as the home page section)
{
  const home = read('src/pages/home.html');
  const roi = home.slice(home.indexOf('<!-- ROI CALCULATOR -->'), home.indexOf('<!-- PROCESS -->'))
    .replace(/<div class="s-head center reveal">[\s\S]*?<\/p><\/div>/, '')
    .replace(/ <a data-nav="tools\/roi-calculator"[^>]*>How we estimate<\/a>/, ' See how we estimate below.');
  if (!roi.includes('id="c-budget"')) throw new Error('ROI calculator section not found in home.html');
  const pct = { 'Real Estate': 34, 'E-commerce / Retail': 38, 'Education': 32, 'Healthcare': 30, 'SaaS / Technology': 42, 'Local Services': 36, 'Hospitality & Travel': 33, 'Finance & Insurance': 31 };
  const faqs = [
    ['How accurate is this calculator?', 'It is a directional estimate, not a promise. It applies a typical cost-per-lead reduction for your industry to your current numbers. Your real result depends on your offer, creative, landing page, follow-up speed and market.'],
    ['Where do the improvement percentages come from?', 'They are planning assumptions based on the gains a structured testing process (better targeting, more creatives, cleaner tracking and faster lead follow-up) commonly delivers. On a strategy call we replace them with a forecast built on your own ad account data.'],
    ['What counts as a “qualified lead”?', 'Here it simply means a lead at your current cost per lead. On a call we agree on what a qualified lead means for your business, for example a booked counselling session or a paid deposit.'],
    ['Is the strategy call really free?', 'Yes. It is a 30-minute call on Google Meet. You leave with the top three fixes for your account whether or not you work with us.'],
  ];
  add({ route: 'tools/roi-calculator/', key: 'tool', nav: 'tools/roi-calculator', title: `Ad Spend ROI Calculator: Leads & Cost per Lead | ${NAME}`,
    description: 'Free ad spend calculator: enter your monthly budget and cost per lead to estimate how many more leads a structured Meta and Google Ads testing process could bring.',
    content: `<section class="page active" id="page-tool">${pageHero('Free tool', 'Ad spend ROI calculator', 'Enter your monthly ad budget and current cost per lead to see how many more leads you could get from the same spend.')}
${roi}
<section class="section"><div class="wrap"><div class="detail-grid">
  <div class="reveal"><h2 class="h-md">How the estimate works</h2><p class="muted" style="margin-top:12px">Today’s leads = monthly budget ÷ current cost per lead. We then lower your cost per lead by a typical improvement for your industry and recalculate the leads the same budget buys. The annual saving is what those extra leads would cost you at today’s price.</p><p class="muted" style="margin-top:12px">These are planning assumptions, not guaranteed results.</p></div>
  <div class="info-card reveal d1"><h3 style="margin-bottom:12px">Cost-per-lead reduction used</h3><ul class="check-list">${Object.entries(pct).map(([k, v]) => `<li>${tick}<span>${k.replace('&', '&amp;')}: <b>${v}%</b></span></li>`).join('')}</ul></div>
</div></div></section>
${faqSection(faqs)}
${ctaBand}</section>`,
    crumbs: [['ROI Calculator', 'tools/roi-calculator/']] });
}

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
      provider: { '@type': 'ProfessionalService', name: NAME, alternateName: ['Ad Kaizen', 'AdKaizen Agency'], url: SITE + '/' }, areaServed: ['India', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Oman'] } });
}

const svcBySlug = Object.fromEntries(services.map(s => [s.slug, s]));
// ---------- Free guides (PDFs made by tools/make-guides.sh, given in exchange for an email) ----------
const guides = [
  { id: 'meta-playbook', file: 'meta-ads-playbook-education.pdf', tone: 'royal', kicker: 'Playbook · 7 pages', title: 'Meta Ads Playbook for Education Brands',
    text: 'For study-abroad consultants, coaching centres and training institutes.',
    points: ['Work out the most you can pay per lead', 'Tracking that tells Meta who your good leads are', 'Offers and creatives that attract serious students', 'Follow-up routine and launch checklist'] },
  { id: 'umrah-checklist', file: 'umrah-season-checklist.pdf', tone: 'em', kicker: 'Checklist · 4 pages', title: 'Umrah Season Campaign Checklist',
    text: 'For Umrah travel agencies planning Ramadan 2027 and the season after.',
    points: ['Packages and trust signals to prepare', 'Ads and a month-by-month content plan', 'WhatsApp enquiry handling for peak weeks', 'Before, during and after travel'] },
];
const guideCard = g => `<div class="guide-card reveal"><div class="guide-cover ${g.tone}"><span>${g.kicker}</span><b>${g.title}</b></div><div class="guide-body"><p>${g.text}</p><ul class="check-list compact">${g.points.map(p => `<li>${tick}<span>${p}</span></li>`).join('')}</ul>
<form data-ok="${g.id}Ok" data-source="Guide download — ${g.title}"><input type="hidden" name="guide" value="${g.title}"><div class="guide-fields"><input type="text" name="name" placeholder="Your name" required autocomplete="name" aria-label="Your name"><input type="email" name="email" placeholder="Work email" required autocomplete="email" aria-label="Email"></div><input type="text" name="_gotcha" class="fld-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn btn-primary btn-block" type="submit">Get the free guide ${arrow}</button></form>
<div class="form-ok" id="${g.id}Ok">Thanks! <a class="btn btn-em btn-block" style="margin-top:10px" href="{{BASE}}assets/guides/${g.file}" target="_blank" rel="noopener" data-guide="${g.id}">Download the PDF</a></div><div class="form-error" id="${g.id}Err">Something went wrong. Please try again.</div></div></div>`;
for (const g of guides) if (!fs.existsSync(path.join(ROOT, 'assets/guides', g.file))) throw new Error(`guide PDF missing: ${g.file} (run bash tools/make-guides.sh)`);
add({ route: 'guides/', key: 'guides', nav: 'guides', title: `Free Marketing Guides for Education & Travel Brands | ${NAME}`,
  description: 'Free downloadable guides: the Meta Ads Playbook for Education Brands and the Umrah Season Campaign Checklist. Practical, step-by-step and free.',
  content: `<section class="page active" id="page-guides">${pageHero('Free guides', 'Free playbooks for growing brands.', 'Step-by-step guides from the accounts we run. Enter your email and the PDF is yours. No spam; unsubscribe any time.')}
<section class="section" style="padding-top:48px"><div class="wrap"><div class="guide-grid">${guides.map(guideCard).join('')}</div>
<p class="muted" style="text-align:center;margin-top:28px;font-size:14px">We'll occasionally email you practical marketing tips. See our <a data-nav="privacy-policy" style="text-decoration:underline">privacy policy</a>.</p></div></section>
${ctaBand}</section>`,
  crumbs: [['Free guides', 'guides/']] });

// ---------- Blog ----------
const postImg = p => p.cover ? `blog-${p.slug}.webp` : p.img;
const fmtDate = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const postMeta = p => `<div class="blog-meta"><span>By AdKaizen</span><span class="dotsep"></span><span>${fmtDate(p.date)}</span><span class="dotsep"></span><span>${p.readMins} min read</span></div>`;
const postCard = p => `<a class="post reveal" data-nav="blog/${p.slug}"><div class="post-img"><span class="cat">${p.category}</span><img src="{{BASE}}assets/img/${postImg(p)}" alt="" loading="lazy" width="900" height="563"></div><div class="post-body"><h3>${p.title}</h3><p>${p.excerpt}</p><span class="post-link">Read article ${arrow}</span></div></a>`;
const articleCta = `<div class="article-cta"><div><h3>Want us to look at your ads?</h3><p>Book a free 30-minute audit call. You leave with the top 3 fixes for your account, whether or not you hire us.</p></div><div class="ac-actions"><a class="btn btn-primary" data-nav="contact">Book Free Strategy Call ${arrow}</a><a class="btn btn-ghost" href="https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hi AdKaizen team, I read your article and want a free audit')}" target="_blank" rel="noopener">WhatsApp us</a></div></div>`;
const guidePromo = p => { const g = p.industry === 'umrah-travel-agencies' ? guides[1] : (p.industry === 'study-abroad-consultants' || p.category === 'Meta Ads') ? guides[0] : null; return g ? `<div class="guide-promo"><div><span>Free ${g.kicker.split(' ·')[0].toLowerCase()}</span><b>${g.title}</b></div><a class="btn btn-primary" data-nav="guides">Get it free ${arrow}</a></div>` : ''; };
const featuredPost = posts.find(p => p.featured) || posts[0];
const blogFeatured = `<a class="blog-featured reveal" data-nav="blog/${featuredPost.slug}"><div class="bf-media"><span class="badge">Featured</span><img src="{{BASE}}assets/img/${postImg(featuredPost)}" alt="" loading="lazy"></div><div class="bf-body"><span class="cat">${featuredPost.category}</span><h3>${featuredPost.title}</h3><p>${featuredPost.excerpt}</p>${postMeta(featuredPost)}<span class="btn btn-primary">Read the playbook ${arrow}</span></div></a>`;
const blogGrid = posts.filter(p => p !== featuredPost).map(postCard).join('');
for (const p of posts) {
  if (!fs.existsSync(path.join(ROOT, 'assets/img', postImg(p)))) throw new Error(`posts.mjs: image missing for ${p.slug} (run python tools/make-covers.py)`);
  const related = [...posts.filter(o => o !== p && o.industry && o.industry === p.industry), ...posts.filter(o => o !== p && !(o.industry && o.industry === p.industry))].slice(0, 3);
  const content = `<section class="page active" id="page-post"><div class="page-hero article-hero"><div class="orb-wrap"><span class="orb orb-1"></span><span class="orb orb-2"></span></div><div class="grid-overlay"></div><div class="wrap reveal"><div class="eyebrow" style="justify-content:center"><span class="dot"></span>${p.category}</div><h1>${p.title}</h1>${postMeta(p)}</div></div>
<section class="section" style="padding-top:40px"><div class="wrap"><figure class="article-cover reveal"><img src="{{BASE}}assets/img/${postImg(p)}" alt="" width="1200" height="750"></figure><article class="article reveal">${p.body}${guidePromo(p)}${articleCta}</article></div></section>
<section class="section" style="padding-top:0"><div class="wrap">${sectionHead('Keep reading', 'More from the AdKaizen Journal.')}<div class="blog-grid">${related.map(postCard).join('')}</div></div></section>
${ctaBand}</section>`;
  add({ route: `blog/${p.slug}/`, key: 'post', nav: 'blog', title: `${p.title} | ${NAME}`, description: p.metaDescription, content,
    ogImage: p.cover ? `assets/img/blog-${p.slug}.jpg` : undefined, ogType: 'article',
    crumbs: [['Blog', 'blog/'], [p.title, `blog/${p.slug}/`]],
    schema: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.metaDescription, datePublished: p.date, dateModified: p.date,
      image: SITE + '/assets/img/' + postImg(p), author: { '@type': 'Organization', name: NAME, url: SITE + '/' }, publisher: { '@type': 'Organization', name: NAME },
      mainEntityOfPage: SITE + `/blog/${p.slug}/` } });
}

for (const ind of industries) {
  const ours = clients.filter(c => c.cat === ind.clientCat);
  const indPosts = posts.filter(p => p.industry === ind.slug);
  const content = `<section class="page active" id="page-industry">${pageHero(ind.kicker, ind.h1, ind.intro, heroActions)}
<section class="section"><div class="wrap">${sectionHead('Sound familiar?', 'What holds growth back — and how we fix it.')}<div class="svc-grid two">${ind.pains.map(([p, f], i) => `<div class="svc reveal${i % 2 ? ' d1' : ''}"><h3>${p}</h3><p>${f}</p></div>`).join('')}</div></div></section>
<section class="section" style="background:var(--bg-2)"><div class="wrap">${sectionHead('Our playbook', 'What we run for you.')}<div class="playbook">${ind.playbook.map(([t, d], i) => `<div class="pb-item reveal"><div class="n">${String(i + 1).padStart(2, '0')}</div><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap">${sectionHead('Trusted in this industry', 'Brands we work with.')}<div class="chip-row reveal">${ours.map(c => `<a class="chip-link" data-nav="${c.caseStudy && c.caseStudy.published ? 'portfolio/' + c.slug : 'portfolio'}">${esc(c.name)}</a>`).join('')}</div>
<div class="svc-grid" style="margin-top:56px">${['meta-ads', 'google-ads', 'lead-generation'].map(k => svcCard(svcBySlug[k])).join('')}</div></div></section>
${indPosts.length ? `<section class="section" style="padding-top:0"><div class="wrap">${sectionHead('From the AdKaizen Journal', 'Guides for your industry.')}<div class="blog-grid">${indPosts.map(postCard).join('')}</div></div></section>` : ''}
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
    description: `How AdKaizen helped ${c.name}: ${cs.challenge.slice(0, 110)}`, content,
    crumbs: [['Portfolio', 'portfolio/'], [c.name, `portfolio/${c.slug}/`]] });
}

for (const ind of industries) landingPage(ind);

// ---------- head extras ----------
const orgSchema = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: NAME, alternateName: ['Ad Kaizen', 'AdKaizen Agency'],
  description: 'Performance marketing agency specialising in Meta Ads, Google Ads, SEO, lead generation and AI automation.',
  url: SITE + '/', logo: SITE + '/assets/brand/symbol-color.svg', image: SITE + '/assets/img/og-image.jpg', telephone: cfg.phone, email: cfg.email, priceRange: '₹₹',
  address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
  areaServed: ['India', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Oman'],
  knowsAbout: services.map(s => s.title),
  sameAs: Object.values(cfg.social || {}).filter(Boolean) };

// Tags respect the visitor's cookie choice (stored as kz-consent = granted | denied).
// opt-in: nothing is tracked until "Accept". notice: tracked unless "Decline".
function tracking() {
  if (!trackingOn) return '';
  let h = `<script>(function(){var c=null;try{c=localStorage.getItem('kz-consent');}catch(e){}window.KZ_CONSENT_OK=${consentMode === 'notice' ? "c!=='denied'" : "c==='granted'"};})();</script>\n`;
  if (cfg.ga4Id) h += `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var kzG=window.KZ_CONSENT_OK?'granted':'denied';gtag('consent','default',{ad_storage:kzG,analytics_storage:kzG,ad_user_data:kzG,ad_personalization:kzG});gtag('js',new Date());gtag('config','${cfg.ga4Id}');</script>\n`;
  if (cfg.metaPixelId) h += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');if(!window.KZ_CONSENT_OK)fbq('consent','revoke');fbq('init','${cfg.metaPixelId}');fbq('track','PageView');</script>\n`;
  if (cfg.clarityId) h += `<script>window.kzLoadClarity=function(){if(window.kzClarityLoaded)return;window.kzClarityLoaded=1;(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${cfg.clarityId}");};if(window.KZ_CONSENT_OK)window.kzLoadClarity();</script>\n`;
  return h;
}
const consentBar = `<div class="consent-bar" id="consentBar" role="region" aria-label="Cookie choice" hidden><p>We use cookies to measure how our website and ads perform. <a data-nav="privacy-policy">Privacy policy</a></p><div class="consent-actions"><button type="button" class="btn btn-ghost" data-consent="denied">Decline</button><button type="button" class="btn btn-primary" data-consent="granted">Accept</button></div></div>`;

function faqSchema(html) {
  const qs = [...html.matchAll(/<button class="faq-q">([\s\S]*?)<span class="ico">[\s\S]*?<div class="faq-a"><p>([\s\S]*?)<\/p><\/div>/g)];
  if (!qs.length) return null;
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs.map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } })) };
}

// ---------- render ----------
const industryLinks = industries.map(i => `<a data-nav="industries/${i.slug}">${i.navTitle}</a>`).join('');
const clientConfig = { formspree: cfg.formspreeEndpoint || '', booking: REQUEST_MODE ? '' : (cfg.bookingUrl || ''), callApi: cfg.callRequestApi || '', whatsapp: cfg.whatsappNumber || '' };

const STEPS = REQUEST_MODE
  ? [['Send your details', 'A short form. We confirm your email with a 6-digit code.'], ['We review your business', 'A strategist checks your brand, then sends your booking link within one business day.'], ['30-minute call on Google Meet', 'You leave with the top 3 fixes in writing, whether or not you hire us.']]
  : [['Pick a time', 'Choose any free 30-minute slot in our calendar.'], ['Audit call on Google Meet', 'We review your ads, funnel and cost per lead with you, live.'], ['Leave with a plan', 'You get the top 3 fixes in writing, whether or not you hire us.']];
if (REQUEST_MODE) bookCallPage(); // needs STEPS, so it runs here
const bookSteps = (cls = '') => `<ol class="cta-steps${cls}" aria-label="How booking works">${STEPS.map(([t, d], i) => `<li><span class="n">${i + 1}</span><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol>`;

const ver = f => crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);
const V_CSS = ver('css/style.css'), V_JS = ver('js/site.js');

function render(p, baseOverride) {
  const depth = p.route.split('/').filter(Boolean).length;
  const BASE = baseOverride ?? '../'.repeat(depth);
  const canonical = SITE + '/' + p.route;
  const schemas = [orgSchema];
  if (p.crumbs) schemas.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', ''], ...p.crumbs].map(([n, r], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + '/' + r })) });
  const fs_ = faqSchema(p.content); if (fs_) schemas.push(fs_);
  p = { ...p, content: p.content
    .replaceAll('{{PROOF}}', proofBlock()).replaceAll('{{N_BRANDS}}', String(clients.length)).replaceAll('{{N_INDS}}', String(new Set(clients.map(c => c.catL)).size))
    .replace(/(<div class="cta-band[\s\S]*?<div class="row">[\s\S]*?<\/div>)/g, '$1' + bookSteps())
    .replace('{{BLOG_FEATURED}}', blogFeatured).replace('{{BLOG_GRID}}', blogGrid)
    .replace('{{BOOK_STEPS}}', `<div class="book-steps reveal"><h2 class="h-md">${REQUEST_MODE ? 'How booking works' : 'What happens after you book'}</h2>${bookSteps(' light')}<a class="btn btn-primary" data-nav="contact">${REQUEST_MODE ? 'Book a free call' : 'Pick a time'} ${arrow}</a></div>`) };
  if (p.schema) schemas.push(p.schema);
  let head = '';
  if (cfg.googleSiteVerification && p.route === '') head += `<meta name="google-site-verification" content="${cfg.googleSiteVerification}">\n`;
  head += schemas.map(jsonScript).join('\n') + '\n';
  head += `<script>window.KAIZEN=${JSON.stringify(clientConfig).replace(/</g, '\\u003c')};</script>\n`;
  head += tracking();
  let bodyEnd = trackingOn ? consentBar : '';
  // no-JS pixel can't ask for consent, so it only runs in "notice" mode
  if (cfg.metaPixelId && consentMode === 'notice') bodyEnd += `<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${cfg.metaPixelId}&amp;ev=PageView&amp;noscript=1"></noscript>`;

  let html = layout
    .replace('{{CONTENT}}', p.content)
    .replace('{{HEAD_EXTRA}}', head)
    .replace('{{BODY_END}}', bodyEnd)
    .replace('{{INDUSTRY_LINKS}}', industryLinks)
    .replaceAll('{{TITLE}}', esc(p.title))
    .replaceAll('{{DESCRIPTION}}', esc(p.description))
    .replaceAll('{{ROBOTS}}', p.robots)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{OG_IMAGE}}', SITE + '/' + (p.ogImage || 'assets/img/og-image.jpg'))
    .replace('<meta property="og:type" content="website">', `<meta property="og:type" content="${p.ogType || 'website'}">`)
    .replaceAll('{{PAGE}}', p.key)
    .replace('{{V_CSS}}', V_CSS).replace('{{V_JS}}', V_JS)
    .replaceAll('{{BASE}}', BASE);

  if (trackingOn) html = html.replace('<a data-nav="privacy-policy">Privacy Policy</a>', '<a data-nav="privacy-policy">Privacy Policy</a><button type="button" class="link-btn" data-cookie-settings>Cookie settings</button>');

  // data-nav="x" → real links (and active state, and booking hook on "Book" buttons)
  html = html.replace(/<a\b([^>]*?)\sdata-nav="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (m, pre, target, post, inner) => {
    let attrs = (pre + post).replace(/\shref="[^"]*"/, '');
    const isActive = target === p.nav || (target === 'home' && p.nav === 'home');
    attrs = attrs.replace(/\sclass="([^"]*)"/, (_, c) => ` class="${c.replace(/\bactive\b/, '').trim()}${isActive ? ' active' : ''}"`.replace(' class=" active"', ' class="active"'));
    if (isActive && !/\sclass=/.test(attrs)) attrs += ' class="active"';
    attrs = attrs.replace(/\sclass=""/, '');
    const book = target === 'contact' && /Book|Strategy Call/i.test(inner) ? ' data-book' : '';
    const href = book && REQUEST_MODE ? BASE + 'book-a-call/' : target === 'home' ? (BASE || './') : BASE + target + '/';
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

for (const dir of ['css', 'assets/img', 'assets/logos', 'assets/guides', 'assets/icons', 'assets/brand']) {
  if (fs.existsSync(path.join(ROOT, dir))) fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
}
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'js/site.js'), path.join(OUT, 'js/site.js'));

console.log(`Built ${pages.length} pages + 404 into docs/`);
console.log(`Tracking: GA4 ${cfg.ga4Id ? 'ON' : 'off'} · Meta Pixel ${cfg.metaPixelId ? 'ON' : 'off'} · Clarity ${cfg.clarityId ? 'ON' : 'off'} · Booking ${cfg.bookingUrl ? 'ON' : 'off'} · Custom domain ${cfg.customDomain || 'off'}`);
console.log(`Case studies published: ${publishedCases.length}/${clients.filter(c => c.caseStudy).length}`);
