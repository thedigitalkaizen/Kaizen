// One entry per service page: /services/<slug>/
// icon = key in icons.mjs, color = ic-royal | ic-em | ic-violet
export const services = [
  {
    slug: 'performance-marketing', icon: 'perf', color: 'ic-royal', tag: 'Core',
    title: 'Performance Marketing',
    short: 'Full-funnel paid growth engineered to a target CAC and ROAS — not vanity reach.',
    metaDescription: 'Performance marketing agency for Meta Ads, Google Ads and full-funnel paid growth. Campaigns managed to a target cost per lead, CAC and ROAS.',
    h1: 'Paid growth, managed to your numbers.',
    intro: 'We plan, launch and run your paid channels as one system — every campaign tied to a target cost per lead, CAC or ROAS you agree with us up front.',
    includes: [
      'Funnel and unit-economics audit before a rupee is spent',
      'Channel mix across Meta, Google, YouTube and retargeting',
      'Conversion tracking: GA4, Meta Pixel and Conversions API',
      'Weekly creative and audience tests',
      'Budget pacing and scaling rules based on real cost per result',
      'Plain-language weekly report and monthly strategy call'
    ],
    forWho: ['Brands spending ₹50,000+ a month on ads', 'Businesses with a sales team waiting for leads', 'Founders tired of reports full of reach and impressions'],
    faqs: [
      ['What budget do I need?', 'We recommend at least ₹50,000 a month in ad spend so tests reach meaningful numbers. Smaller budgets can work for a single, focused channel.'],
      ['Do you need access to my ad accounts?', 'Yes — you keep ownership. We work as partners inside your Business Manager and Google Ads account, so the data stays yours if we ever part ways.'],
      ['How do you report?', 'A weekly snapshot of spend, leads, cost per lead and what we are testing next, plus a monthly review call.']
    ]
  },
  {
    slug: 'meta-ads', icon: 'meta', color: 'ic-royal', tag: 'Paid',
    title: 'Meta Ads',
    short: 'Facebook & Instagram campaigns with creative testing loops that keep CPL falling.',
    metaDescription: 'Meta Ads agency for Facebook and Instagram lead generation. Creative testing, Conversions API setup and campaigns built to lower cost per lead.',
    h1: 'Facebook & Instagram ads that keep getting cheaper.',
    intro: 'Most Meta accounts stall because the same two creatives run for months. We run a steady loop of new hooks, formats and offers so your cost per lead keeps moving down.',
    includes: [
      'Account and Pixel audit, Conversions API setup',
      'Lead form and WhatsApp-click campaigns',
      'Reels, carousel and static creative briefs every week',
      'Audience and Advantage+ campaign structure',
      'Lead quality feedback loop with your sales team',
      'Retargeting for website visitors and video viewers'
    ],
    forWho: ['Education, travel and service businesses that sell through calls or WhatsApp', 'Brands with an Instagram audience they are not converting', 'Teams that need a predictable weekly lead flow'],
    faqs: [
      ['Lead forms or landing pages?', 'Both have a place. Instant forms are cheaper per lead, landing pages usually bring better-quality leads. We test both and keep what your sales team says converts.'],
      ['Do you make the creatives?', 'We write the briefs and hooks and can produce the edits. If you have an in-house designer, we brief them each week.'],
      ['How quickly will cost per lead drop?', 'Expect the first 2–3 weeks to be learning. Improvements come from weekly tests stacking up, not one change.']
    ]
  },
  {
    slug: 'google-ads', icon: 'google', color: 'ic-royal', tag: 'Paid',
    title: 'Google Ads',
    short: 'Search, Performance Max & YouTube that capture high-intent demand profitably.',
    metaDescription: 'Google Ads management for Search, Performance Max and YouTube. Capture high-intent customers with conversion tracking and tight cost control.',
    h1: 'Show up when customers are already searching.',
    intro: 'Google Search catches people at the moment they need you. We build tightly themed campaigns, cut wasted search terms every week and only scale what turns into enquiries.',
    includes: [
      'Keyword and competitor research',
      'Search campaigns with tightly themed ad groups',
      'Performance Max with clean audience signals',
      'YouTube ads for awareness and retargeting',
      'Weekly negative-keyword and search-term cleanup',
      'Call, form and WhatsApp conversion tracking'
    ],
    forWho: ['Businesses people actively search for (courses, visas, travel, services)', 'Local businesses that want calls from nearby customers', 'Brands paying for clicks that never convert'],
    faqs: [
      ['Search or Performance Max?', 'Search first for control and clean data. Performance Max is added once conversion tracking is reliable.'],
      ['Can you fix an existing account?', 'Yes. We start with an audit and usually find wasted spend in search terms, broad match and missing negatives.'],
      ['Do you handle Google Business Profile?', 'Yes, for local businesses we connect it to your ads and help you collect reviews.']
    ]
  },
  {
    slug: 'seo', icon: 'seo', color: 'ic-em', tag: 'Organic',
    title: 'SEO',
    short: 'Technical + content SEO that compounds into free, durable, high-intent traffic.',
    metaDescription: 'SEO services for service businesses: technical fixes, local SEO, Google Business Profile and content that ranks for high-intent searches.',
    h1: 'Traffic you don’t pay for every click.',
    intro: 'SEO is the most kaizen channel there is: small improvements every month that add up to traffic you keep. We fix the technical basics, then publish pages that answer what your customers actually search.',
    includes: [
      'Technical audit: speed, indexing, structured data',
      'Keyword map for every service and location',
      'Service and location landing pages',
      'Google Business Profile optimisation and reviews',
      'Monthly content built around buyer questions',
      'Search Console and ranking reports'
    ],
    forWho: ['Businesses tired of paying for every single lead', 'Local and regional service providers', 'Brands with a website that gets almost no organic traffic'],
    faqs: [
      ['How long does SEO take?', 'Technical fixes show within weeks; meaningful ranking gains usually take 3–6 months of steady work.'],
      ['Do you write the content?', 'Yes. We research, write and optimise pages, and you approve them before they go live.'],
      ['Is local SEO included?', 'Yes — Google Business Profile, local pages and review generation are part of the plan.']
    ]
  },
  {
    slug: 'social-media', icon: 'social', color: 'ic-em', tag: 'Organic',
    title: 'Social Media',
    short: 'Content and community that builds trust and feeds every paid channel.',
    metaDescription: 'Social media management for Instagram, Facebook and LinkedIn: content calendars, Reels, community management and growth reporting.',
    h1: 'Content that builds trust before the first call.',
    intro: 'People check your Instagram before they enquire. We plan and produce content that answers their questions, shows real proof and makes your ads work harder.',
    includes: [
      'Monthly content calendar built on your content pillars',
      'Reels scripts, hooks and editing',
      'Carousels and story sequences',
      'Comment and DM management',
      'Profile and bio optimisation',
      'Monthly growth and engagement report'
    ],
    forWho: ['Brands whose customers research them on Instagram first', 'Founders who want to be visible without doing it all themselves', 'Businesses running ads to a profile that looks inactive'],
    faqs: [
      ['Which platforms do you cover?', 'Instagram and Facebook as standard; LinkedIn and YouTube Shorts on request.'],
      ['Do I need to be on camera?', 'It helps, but it is not required. We can build content around your team, students, travellers or product.'],
      ['How many posts a month?', 'Typically 12–20 pieces a month depending on the plan, with Reels as the priority.']
    ]
  },
  {
    slug: 'web-design', icon: 'web', color: 'ic-violet', tag: 'Build',
    title: 'Web Design',
    short: 'Fast, conversion-first sites and funnels built to turn clicks into customers.',
    metaDescription: 'Conversion-focused web design and landing pages. Fast, mobile-first websites with tracking, WhatsApp and booking built in.',
    h1: 'Websites built to turn clicks into enquiries.',
    intro: 'A good-looking site is not enough. We build fast, mobile-first pages with one clear next step — call, WhatsApp, form or booking — and tracking on every one of them.',
    includes: [
      'Conversion-focused page structure and copy',
      'Mobile-first, fast-loading build',
      'Landing pages for each ad campaign',
      'WhatsApp, booking and form integrations',
      'GA4, Meta Pixel and conversion tracking',
      'SEO basics: titles, schema, sitemap'
    ],
    forWho: ['Businesses whose site does not produce enquiries', 'Brands running ads to their homepage', 'Anyone launching a new service or offer'],
    faqs: [
      ['How long does a website take?', 'A focused landing page takes about a week; a full site usually 3–5 weeks.'],
      ['Can I edit it myself?', 'Yes. We can set up a simple editor so your team can update text and blog posts.'],
      ['Do you handle hosting and domain?', 'We set it up for you and you keep full ownership of the domain and accounts.']
    ]
  },
  {
    slug: 'branding', icon: 'brand', color: 'ic-violet', tag: 'Build',
    title: 'Branding',
    short: 'Positioning and identity that make premium pricing feel obvious.',
    metaDescription: 'Brand positioning and identity design: messaging, logo, visual system and brand guidelines for growing businesses.',
    h1: 'A brand that makes the price feel obvious.',
    intro: 'When customers can’t tell you apart from competitors, they choose on price. We sharpen what you stand for and give it a look and voice people remember.',
    includes: [
      'Positioning and competitor review',
      'Messaging: tagline, value proposition, key proof points',
      'Logo and visual identity',
      'Brand guidelines for your team and partners',
      'Social and ad templates',
      'Pitch deck and sales collateral'
    ],
    forWho: ['New businesses launching their first identity', 'Growing brands that have outgrown a DIY logo', 'Companies entering a new market or segment'],
    faqs: [
      ['Do I need branding before ads?', 'Not always. Many clients start with ads and refine their brand as we learn what messages convert.'],
      ['What do I receive?', 'Logo files in every format, colour and type system, templates and a brand guideline document.'],
      ['How many revision rounds?', 'Two structured rounds per stage, so decisions stay fast.']
    ]
  },
  {
    slug: 'ai-automation', icon: 'ai', color: 'ic-violet', tag: 'Systems',
    title: 'AI Automation',
    short: 'Lead routing, follow-up and reporting on autopilot — your team, multiplied.',
    metaDescription: 'AI and marketing automation: instant lead follow-up on WhatsApp and email, CRM routing, chatbots and automated reporting.',
    h1: 'Reply to every lead in minutes, not hours.',
    intro: 'Leads go cold fast. We connect your ads, forms and WhatsApp to your CRM so every enquiry gets an instant reply, lands with the right person and is followed up automatically.',
    includes: [
      'Instant WhatsApp and email replies to new leads',
      'Lead routing to the right salesperson or branch',
      'CRM setup and pipeline stages',
      'AI chat assistant for common questions',
      'Follow-up sequences for leads that go quiet',
      'Automated daily and weekly reports'
    ],
    forWho: ['Teams that get more leads than they can call back quickly', 'Businesses losing leads between ads and sales', 'Owners who want reports without building spreadsheets'],
    faqs: [
      ['Which tools do you use?', 'We work with your existing CRM where possible, plus WhatsApp Business API, Zapier/Make and AI assistants.'],
      ['Will it sound robotic?', 'No. We write replies in your brand voice and hand over to a human as soon as the lead is ready.'],
      ['Is lead data safe?', 'Data stays in your own accounts. We set up access so you stay in control.']
    ]
  },
  {
    slug: 'lead-generation', icon: 'lead', color: 'ic-em', tag: 'Core',
    title: 'Lead Generation',
    short: 'Predictable pipelines of qualified, sales-ready leads — measured to the rupee.',
    metaDescription: 'Lead generation agency for education, travel and service businesses. Qualified leads from Meta, Google and WhatsApp with full tracking.',
    h1: 'A predictable flow of leads your team can close.',
    intro: 'Cheap leads that never answer the phone are expensive. We build the full path — ad, landing page or form, instant follow-up and qualification — and optimise for leads that turn into customers.',
    includes: [
      'Offer and lead-magnet planning',
      'Campaigns on Meta, Google and WhatsApp',
      'Qualifying questions to filter out time-wasters',
      'Instant lead alerts to your team',
      'Lead quality tracking with your sales team',
      'Monthly cost-per-customer reporting'
    ],
    forWho: ['Study-abroad, training and travel businesses', 'Service businesses that sell over the phone or WhatsApp', 'Sales teams that need a steady weekly pipeline'],
    faqs: [
      ['How do you measure lead quality?', 'We agree on what a qualified lead is with your team and track it in a shared sheet or CRM, then optimise towards it.'],
      ['Do you guarantee a number of leads?', 'We set targets based on your budget and market after the audit. Honest forecasts beat promises.'],
      ['Can leads go straight to WhatsApp?', 'Yes — click-to-WhatsApp campaigns and instant WhatsApp replies are often the best-performing setup in India and the GCC.']
    ]
  },
  {
    slug: 'conversion-rate-optimization', icon: 'cro', color: 'ic-royal', tag: 'Growth',
    title: 'Conversion Rate Optimization',
    short: 'Systematic testing that lifts revenue from the traffic you already have.',
    metaDescription: 'Conversion rate optimisation (CRO): landing page testing, heatmaps and funnel fixes that turn more of your existing traffic into leads.',
    h1: 'More enquiries from the traffic you already have.',
    intro: 'Doubling your conversion rate halves your cost per lead without adding a rupee of ad spend. We find where visitors drop off and test fixes one at a time.',
    includes: [
      'Funnel analysis in GA4',
      'Heatmaps and session recordings',
      'Landing page copy and layout tests',
      'Form and checkout friction fixes',
      'Speed and mobile improvements',
      'Test log with results you can keep'
    ],
    forWho: ['Sites with traffic but few enquiries', 'Brands spending heavily on ads to one landing page', 'Teams that want decisions based on data, not opinions'],
    faqs: [
      ['How much traffic do I need?', 'A few hundred visitors a week is enough for big, clear tests. Smaller sites get expert reviews and best-practice fixes.'],
      ['What tools do you use?', 'GA4, Microsoft Clarity for heatmaps and recordings, and simple A/B testing tools.'],
      ['How soon will I see results?', 'Quick wins like form fixes often show within weeks; structured tests run 2–4 weeks each.']
    ]
  }
];
