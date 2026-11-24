// Portfolio cards + case studies.
//
// HOW TO ADD PROOF (only use real, client-approved numbers):
//   logo:        put the file in assets/logos/ and write e.g. 'assets/logos/akbar-study.png'
//   metric:      the headline result, e.g. '−38%'
//   metricLabel: what it means, e.g. 'cost per lead in 60 days'
//   caseStudy.published: set to true once the case study text is filled in and approved
//
// Anything left empty is simply not shown on the site.

export const clients = [
  {
    slug: 'akbar-study-abroad', cat: 'education', catL: 'Education', tile: 'ic-royal', ini: 'AS',
    name: 'Akbar Study Abroad',
    desc: 'Overseas education consultancy helping students navigate university admissions and visas.',
    logo: '', metric: '', metricLabel: '',
    caseStudy: {
      published: false,
      services: ['Meta Ads', 'Lead Generation', 'AI Automation'],
      challenge: '',            // 2–3 sentences: what was the problem before you started?
      approach: [],             // 3–5 bullet points: what did you do?
      results: [],              // e.g. [{ v: '−38%', k: 'Cost per lead' }, { v: '2.1x', k: 'Monthly enquiries' }]
      period: '',               // e.g. 'Jan–Mar 2026'
      quote: '', quoteBy: ''    // optional testimonial + name/title
    }
  },
  {
    slug: 'akbar-travels', cat: 'travel', catL: 'Travel & Tourism', tile: 'ic-em', ini: 'AT',
    name: 'Akbar Travels',
    desc: 'Full-service travel agency handling domestic and international bookings.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'akbar-umrah', cat: 'travel', catL: 'Travel & Tourism', tile: 'ic-violet', ini: 'AU',
    name: 'Akbar Umrah',
    desc: 'Dedicated Umrah and pilgrimage travel packages and on-ground logistics.',
    logo: '', metric: '', metricLabel: '',
    caseStudy: {
      published: false,
      services: ['Meta Ads', 'Google Ads', 'Lead Generation'],
      challenge: '', approach: [], results: [], period: '', quote: '', quoteBy: ''
    }
  },
  {
    slug: 'akbar-training-center-bahrain', cat: 'education', catL: 'Education', tile: 'ic-royal', ini: 'TC',
    name: 'Akbar Training Center Bahrain',
    desc: 'Professional certification and vocational training programs based in Bahrain.',
    logo: '', metric: '', metricLabel: '',
    caseStudy: {
      published: false,
      services: ['Meta Ads', 'Lead Generation', 'Social Media'],
      challenge: '', approach: [], results: [], period: '', quote: '', quoteBy: ''
    }
  },
  {
    slug: 'akbar-academy', cat: 'education', catL: 'Education', tile: 'ic-em', ini: 'AA',
    name: 'Akbar Academy',
    desc: 'Academic coaching and skill-development programs for students.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'al-sabahat-tours', cat: 'travel', catL: 'Travel & Tourism', tile: 'ic-violet', ini: 'ST',
    name: 'Al Sabahat Tours and Travels',
    desc: 'Tours and travel planning across leisure and group packages.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'auroflair', cat: 'lifestyle', catL: 'Lifestyle', tile: 'ic-royal', ini: 'AF',
    name: 'Auroflair',
    desc: 'Lifestyle brand building its digital presence and audience.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'allahrakha-catering', cat: 'hospitality', catL: 'Hospitality', tile: 'ic-em', ini: 'AR',
    name: 'Allahrakha Catering',
    desc: 'Catering brand serving events, functions and celebrations.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'flavourzy', cat: 'food', catL: 'Food & D2C', tile: 'ic-violet', ini: 'FZ',
    name: 'Flavourzy',
    desc: 'Direct-to-consumer food brand selling online.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  },
  {
    slug: 'scholar-academy', cat: 'education', catL: 'Education', tile: 'ic-violet', ini: 'SA',
    name: 'Scholar Academy',
    desc: 'Test-prep and tutoring academy for school and college students.',
    logo: '', metric: '', metricLabel: '', caseStudy: null
  }
];
