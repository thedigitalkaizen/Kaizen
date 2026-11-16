# Kaizen — website

Static website hosted free on GitHub Pages. Each page is a real HTML file, so Google can index it.

**Live:** https://thedigitalkaizen.github.io/Kaizen/ (later: https://thekaizenagency.com)

## How it works

```
src/site.config.json   ← settings: tracking IDs, booking link, domain, socials
src/data/services.mjs  ← the 10 service pages
src/data/industries.mjs← the 3 industry pages
src/data/clients.mjs   ← portfolio cards, results and case studies
src/pages/*.html       ← home, about, services, portfolio, blog, contact, privacy policy
src/layout.html        ← header, footer, popups shared by every page
css/ js/ assets/img/   ← styles, scripts, images
build.mjs              ← turns all of the above into the finished site in docs/
docs/                  ← GENERATED — GitHub Pages serves this folder. Don't edit by hand.
```

## Making a change

1. Edit a file in `src/` (or `css/`, `js/`).
2. Run `node build.mjs`.
3. Commit and push. The live site updates in about a minute.

## Common jobs

| Job | Where |
|---|---|
| Turn on Google Analytics / Meta Pixel / Clarity | `ga4Id`, `metaPixelId`, `clarityId` in `src/site.config.json` |
| Make "Book Free Strategy Call" open a calendar | `bookingUrl` in `src/site.config.json` |
| Verify Google Search Console | `googleSiteVerification` in `src/site.config.json` |
| Add a result to a portfolio card | `metric` + `metricLabel` in `src/data/clients.mjs` |
| Add a client logo | put the file in `assets/logos/`, set `logo` in `src/data/clients.mjs` |
| Publish a case study | fill `caseStudy` in `src/data/clients.mjs`, set `published: true` |
| Connect the custom domain | `customDomain` in `src/site.config.json` (writes the CNAME file) |
| Show social icons in the footer | `social` in `src/site.config.json` |

Only publish real, client-approved numbers.

See `SETUP-DOMAIN-AND-EMAIL.md` for the domain and business email setup.
