# UNIPC — website

Static, low-bandwidth institutional website for **UNIPC — the United Nations
Indigenous Peoples Council**, an organization of Indigenous nations and peoples
founded in October 2020. Plain HTML/CSS/JS — no build step, no framework.

## Two rules govern everything here

### 1. UNIPC is in a Preparatory Phase
UNIPC is **not yet an operating organization** — no funds, bank accounts, staff,
operations, physical office, or legal entity. Every role is unpaid and held as
"[Role]-designate" until treaty ratification. **The site collects no payment of
any kind, by design** — a deliberate safeguard so no one can claim to represent
UNIPC while handling money on its behalf. There is no card form, amount selector,
or account detail anywhere in this codebase. **Do not add any payment/pledge
integration** until the client formally confirms the mechanism. Donate is
explanatory only.

### 2. Three-tense claims discipline
Every statement is one of: **what we are** (present, clay `#8A4B23`) · **what we
achieved** (past, jade `#4E8577`) · **what we seek** (ambition, never stated as
fact — amber `#C87F3A`, usually on the dark slate panel). Never blend the tenses
or promote a "seek" into a present-tense claim. Preserve every hedge verbatim.

## Structure
```
index.html          Home
nations.html        Path — Nations & Peoples
states.html         Path — States & Ministries
organizations.html  Path — Organizations & Civil Society
allies.html         Path — Allies & Funders
support.html        Support the Recognition (in-kind sponsorship)
donate.html         How to donate (explanatory; NO payment collected)
about.html          About & founding
achieved.html       What we achieved
recognition.html    The path to recognition (roadmap)
membership.html     Membership
newsroom.html       Newsroom & statements
contact.html        Contact & briefings
status.html         Current status (Preparatory Phase)
emblem.html         The emblem
media.html          Media & brand use
assets/unipc.css    Shared design system (Sky & Earth tokens)
assets/unipc.js     Progressive enhancement (scroll fade, mailto forms) — no payment logic
```

## Conventions & constraints
- **Works without JavaScript.** Core content and forms render/submit with JS off;
  JS only enhances (scroll reveal, inline form-success).
- **Low bandwidth is a hard requirement.** One cached stylesheet, no framework,
  fonts loaded non-blocking (`display=swap`) with system fallbacks.
- **No dark navy anywhere** — cultural directive. The dark register is wet slate
  `#43514F`.
- **No trackers, ever.** No analytics that fingerprint; contact lists are never
  shared or sold. Privacy is a safety feature.
  Traffic is measured only by Cloudflare's server-side analytics (dashboard);
  no analytics script is ever placed on a page. If a Cloudflare beacon or
  `challenge-platform` script reappears in the HTML, disable it in the dashboard.
- **The independence disclaimer** appears verbatim in every footer, the homepage
  band, and the Status page.
- Forms and `mailto:` links route to the real department addresses (all `@unipc.info`):
  `secretariat@`, `eosg@`, `membership@`, `irp@`, `jcac@`, `treaties@`, `otc@`,
  `oac@`, `osc@`, `social@`, `volunteer@`. `ohr@` is deliberately dropped for now (no staff until a legal
  persona exists) and `media@` is not used (`social@` covers press). Wired per page.

## Deploy
No build step. Publish/output directory: the **repository root**. Security and
caching headers live in `_headers` (honored by both Cloudflare Pages and
Netlify); `netlify.toml` remains for the current Netlify deploy.

**Target host — Cloudflare Pages:** connect this GitHub repo in the Cloudflare
dashboard → Workers & Pages → Create → Pages → Connect to Git → `unipc-site`.
Framework preset **None**, build command **empty**, build output directory `/`.
Add the custom domain under the Pages project's *Custom domains*; Cloudflare
issues HTTPS automatically. `_headers` and any `_redirects` file are applied
automatically.

The site is live and open to search engines: `robots.txt` allows all crawling and
points to `sitemap.xml`. Only `404.html` carries `noindex`, which is intended.

## Local preview
```
python3 -m http.server 8000
```
then open http://localhost:8000/
