# thekaizenagency.com: domain, website and email setup

Do the steps in order. Steps marked **(you)** happen in your own accounts.

## 1. Buy the domain (you)
- Buy **thekaizenagency.com** at Cloudflare Registrar, Namecheap or GoDaddy.
- Optional: also buy **thedigitalkaizen.in** and forward it to `https://thekaizenagency.com`.
- Turn on auto-renew and WHOIS privacy.

## 2. Publish the site on GitHub
1. Create a new **public** repo, e.g. `hanif-243/kaizen-agency-site` (Claude can do this for you).
2. Push this folder to its `main` branch.
3. Repo → Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Custom domain should show `thekaizenagency.com` (it comes from the `CNAME` file).

## 3. Verify the domain on GitHub (you, before step 4)
This stops anyone else from claiming the domain on GitHub.
- github.com → your profile picture → Settings → Pages → **Add a domain** → `thekaizenagency.com`.
- GitHub shows a **TXT** record, something like `_github-pages-challenge-hanif-243` with a code. Add it in DNS (step 4), then click Verify.

## 4. DNS records for the website (you, at your registrar)
Delete any default/parking **A** or **CNAME** records on `@` and `www` first.

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Auto |
| A | @ | 185.199.109.153 | Auto |
| A | @ | 185.199.110.153 | Auto |
| A | @ | 185.199.111.153 | Auto |
| AAAA | @ | 2606:50c0:8000::153 | Auto |
| AAAA | @ | 2606:50c0:8001::153 | Auto |
| AAAA | @ | 2606:50c0:8002::153 | Auto |
| AAAA | @ | 2606:50c0:8003::153 | Auto |
| CNAME | www | hanif-243.github.io | Auto |
| TXT | (from GitHub, step 3) | (code from GitHub) | Auto |

If you use Cloudflare: set these records to **DNS only** (grey cloud), not Proxied, until HTTPS is working.

Then: repo → Settings → Pages → wait until the DNS check passes → tick **Enforce HTTPS**. The certificate can take from a few minutes up to 24 hours.

## 5. Business email (you)
Pick one provider. Each gives you its **exact** MX, SPF and DKIM values in its setup wizard; copy those, not values from a blog post.

**Zoho Mail** (free plan for up to 5 users, browser and app only):
- Sign up at zoho.com/mail, choose the Forever Free plan, add `thekaizenagency.com`.
- Verify the domain with the TXT record Zoho gives you.
- Add Zoho's 3 MX records, its SPF TXT record (`v=spf1 include:zohomail.in ~all`, or whatever Zoho shows for your region) and its DKIM TXT record.

**Google Workspace** (paid, Gmail interface):
- Sign up at workspace.google.com, add the domain, follow the wizard.
- MX: `smtp.google.com` priority 1. SPF: `v=spf1 include:_spf.google.com ~all`. DKIM: generate it in Admin console → Apps → Gmail → Authenticate email.

**For both, add DMARC** (start in monitor mode):

| Type | Name / Host | Value |
|---|---|---|
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:hello@thekaizenagency.com` |

After 2 to 4 weeks with no problems, change `p=none` to `p=quarantine`.

The email records (MX/TXT) and the website records (A/CNAME) don't clash.

**Mailboxes to create:**
- `hello@`: main public contact (website, Instagram, WhatsApp bio)
- `hanif@`: your personal one for client relationships
- `leads@`: alias of hello@, receives website form submissions
- `billing@`: alias of hello@, for invoices

Test: send an email from your phone to hello@ and reply. Then check the reply's spam score at mail-tester.com (aim for 9/10 or better).

## 6. Switch the site to the new email (Claude does this once the mailbox works)
- Replace `thedigitalkaizen@gmail.com` in `index.html` and `js/content.js` (contact page, form error message, schema).
- Point the Formspree form at `leads@thekaizenagency.com` (formspree.io → form settings → target email).
- Republish.

## 7. After launch
- Add the site to Google Search Console (verify with a DNS TXT record) and submit `https://thekaizenagency.com/sitemap.xml`.
- Update the website link on Instagram, Facebook, Google Business Profile and WhatsApp Business.
- Old site at hanif-243.github.io/Claude: unpublish it, or replace it with a page that redirects to the new domain, so there's no duplicate copy.
