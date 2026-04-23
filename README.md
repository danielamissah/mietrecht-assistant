
# Mietrecht Assistant

> Tenant rights assistant for Germany — check if your rent is legal, understand your rights, and generate formal letters to your landlord. Free, in English and German.

Germany has some of the strongest tenant protection laws in the world, but most renters — especially expats — do not know what they are entitled to. This app explains your rights in plain English, checks your rent against the Mietpreisbremse, and generates legally-grounded formal letters via AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)


---

## Live Demo

🔗 [mietrecht-assistant.vercel.app](https://mietrecht-assistant.vercel.app/)

---

## Features

* **Mietpreisbremse checker** — enter your city, apartment size, and Wohnlage to see if your rent exceeds the legal cap (§556d BGB)
* **Tenant rights guide** — 6 categories, 18 Q&A pairs covering rent increases, deposit, repairs, Nebenkosten, eviction, and Mietpreisbremse — in English and German
* **AI letter generator** — generates a formal German legal letter plus an English reference version in parallel using Groq (Llama 3.3 70B)
* **5 dispute types** — Mietpreisbremse Rüge, deposit dispute, repair request, Nebenkosten challenge, eviction Widerspruch
* **Google Places autocomplete** — address fields autocomplete to German addresses
* **English and German** — full translation of all UI, toggle persists via localStorage
* **Mobile responsive** — fluid layout using CSS clamp() and auto-fit grids

---

## Supported Cities (Mietpreisbremse)

| City              | Mietspiegel Year |
| ----------------- | ---------------- |
| Berlin            | 2023             |
| Munich (München) | 2023             |
| Hamburg           | 2023             |
| Frankfurt         | 2022             |
| Cologne (Köln)   | 2022             |
| Stuttgart         | 2022             |
| Düsseldorf       | 2022             |

---

## How the Mietpreisbremse Check Works

The Mietpreisbremse (§556d BGB) limits new rents to a maximum of 10% above the local ortsübliche Vergleichsmiete.

```
Vergleichsmiete = Mietspiegel rate (€/m²) × apartment size (m²)
Legal maximum   = Vergleichsmiete × 1.10

If your rent > legal maximum:
  Monthly overpayment = your rent − legal maximum
  Annual overpayment  = monthly overpayment × 12
```

**Example — Berlin, 60m², mittlere Wohnlage:**

```
Mietspiegel rate    = €8.94/m²
Vergleichsmiete     = €8.94 × 60 = €536.40/month
Legal maximum       = €536.40 × 1.10 = €590.04/month

If your rent is €700/month:
  Monthly overpayment = €700 − €590.04 = €109.96
  Annual overpayment  = €109.96 × 12   = €1,319.52
```

**Important exemptions** — the Mietpreisbremse does not apply to:

* New buildings first rented after 1 October 2014
* Apartments rented above the limit before the law came into force (Bestandsschutz)
* Extensively modernised apartments (costs exceeding one third of new construction equivalent)

---

## How the Letter Generator Works

The letter generator makes two parallel API calls to Groq (Llama 3.3 70B) — one for the German letter and one for the English reference version. Both are returned simultaneously.

```
User fills form
       ↓
POST /api/generate-letter
       ↓
Promise.all([
  groq.chat.completions.create(DE system prompt + user details),
  groq.chat.completions.create(EN system prompt + user details),
])
       ↓
{ letterDE, letterEN }
       ↓
Two-tab display: German (send this) | English (for reference)
```

Each dispute type has a dedicated system prompt that instructs the model to cite the correct BGB paragraphs and use formal German legal register. Temperature is set to 0.3 — low enough for consistent legal citations, high enough to avoid robotic repetition.

| Dispute type          | Key legal references               |
| --------------------- | ---------------------------------- |
| Mietpreisbremse Rüge | §556d BGB, §556g BGB             |
| Deposit dispute       | §548 BGB, §551 BGB               |
| Repair request        | §535 Abs. 1 Satz 2 BGB, §536 BGB |
| Nebenkosten dispute   | §556 BGB, §259 BGB, BetrKV §2   |
| Eviction challenge    | §574 BGB, §573 BGB               |

---

## Project Structure

```
mietrecht-assistant/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-letter/
│   │   │   │   └── route.ts        # Groq API route — generates DE + EN letters
│   │   │   └── health/
│   │   │       └── route.ts        # Health check for Docker and uptime monitors
│   │   ├── layout.tsx              # Open Sans font, SEO metadata
│   │   ├── page.tsx                # Main page — tab navigation, hero
│   │   └── globals.css             # CSS variables, slider styles
│   ├── components/
│   │   ├── AddressInput.tsx        # Google Places autocomplete input
│   │   ├── LanguageToggle.tsx      # EN / DE pill toggle
│   │   ├── LetterGenerator.tsx     # Letter form + dual-language output
│   │   ├── RentCheck.tsx           # Mietpreisbremse calculator
│   │   └── RightsGuide.tsx         # Accordion Q&A for 6 rights categories
│   ├── data/
│   │   ├── mietspiegel.ts          # Vergleichsmiete data per city + Wohnlage
│   │   └── translations.ts         # All UI strings in EN and DE
│   ├── hooks/
│   │   ├── usePlacesAutocomplete.ts # Google Places API hook
│   │   └── useTranslation.ts        # Language state + localStorage persistence
│   ├── lib/
│   │   ├── mietspiegel.ts          # Mietpreisbremse calculation logic
│   │   ├── sanity.ts               # Sanity CMS client (future content)
│   │   └── validateEnv.ts          # Environment variable validation
│   └── types/
│       ├── index.ts                # Shared TypeScript interfaces
│       └── google-maps.d.ts        # window.google type declaration
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Type check, lint, build, Docker verify
│   │   └── lighthouse.yml          # Performance and SEO audit on PRs
│   ├── dependabot.yml              # Weekly dependency updates
│   └── pull_request_template.md
├── Dockerfile                      # Multi-stage production image
├── docker-compose.yml              # Local dev and production containers
├── lighthouserc.js                 # Lighthouse CI thresholds
└── vercel.json                     # Frankfurt region, security headers
```

---

## Tech Stack

| Layer      | Technology                    | Why                                                             |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)       | SSR for SEO; tenant rights pages must rank on Google            |
| Language   | TypeScript (strict)           | Type-safe calculation engine and API contracts                  |
| Font       | Open Sans                     | Readable at small sizes; suitable for dense legal content       |
| AI         | Groq (Llama 3.3 70B)          | Fast, free tier, OpenAI-compatible API; excellent formal German |
| Address    | Google Places API             | Autocomplete restricted to German addresses                     |
| i18n       | Custom hook + localStorage    | No library overhead; EN/DE with persistence                     |
| Styling    | Inline styles + CSS variables | Full control; no Tailwind purge edge cases                      |
| CMS        | Sanity.io                     | Editorial content management for future rights articles         |
| Hosting    | Vercel (Frankfurt)            | EU data residency; zero-config deploys                          |
| CI         | GitHub Actions                | Type check, lint, build, Docker, Lighthouse on every PR         |
| Containers | Docker (multi-stage)          | ~150MB production image; non-root user                          |

---

## Getting Started

### Prerequisites

* Node.js 18+
* A [Groq API key](https://console.groq.com/) (free)
* A [Google Places API key](https://console.cloud.google.com/) (Places API + Maps JavaScript API enabled)
* A [Sanity project](https://sanity.io/) (free tier)

### Installation

```bash
git clone https://github.com/danielamissah/mietrecht-assistant.git
cd mietrecht-assistant
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key
GROQ_API_KEY=your_groq_api_key
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/).

### Run with Docker

```bash
# Production build
docker compose up --build

# Development with hot reload
docker compose --profile dev up
```

---

## DevOps Setup

### CI Pipeline (GitHub Actions)

Every push and pull request to `main` runs:

1. **Type check** — `npx tsc --noEmit`
2. **Lint** — `npx next lint --max-warnings 0`
3. **Production build** — validates the full Next.js build
4. **Docker build** — builds the multi-stage image and verifies the health check endpoint
5. **Lighthouse audit** (PRs only) — fails if SEO score drops below 0.9 or accessibility below 0.9

### Branch Protection

The `main` branch requires:

* Pull request before merging (no direct pushes)
* All CI checks passing before merge
* No force pushes

### Deployment

Vercel auto-deploys on every merge to `main`. The deployment targets the `fra1` (Frankfurt) region for EU data residency and lowest latency for German users.

Security headers applied on all routes:

* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `X-XSS-Protection: 1; mode=block`
* `Referrer-Policy: strict-origin-when-cross-origin`

---

## Updating Mietspiegel Data

Mietspiegel data is published every 1–2 years per city. To update:

1. Find the latest figures in `src/data/mietspiegel.ts`
2. Update the `eur_per_sqm` values and `year` field for the relevant city
3. Update the table in this README
4. Cite the source in the PR description

Current sources:

* Berlin: [IMV Berlin Mietspiegel 2023](https://www.stadtentwicklung.berlin.de/wohnen/mietspiegel/)
* Munich: [Münchner Mietspiegel 2023](https://www.muenchen.de/mietspiegel)
* Hamburg: [Hamburger Mietenspiegel 2023](https://www.hamburg.de/mietspiegel)
* Frankfurt: [Frankfurter Mietspiegel 2022](https://www.frankfurt.de/mietspiegel)

---

## Legal Disclaimer

This tool provides general legal information, not legal advice. Letters generated by AI should be reviewed carefully before sending. For complex disputes, contact your local [Mieterverein](https://www.mieterbund.de/mieterverein-suche) or a qualified Rechtsanwalt. Information is based on German law as of 2025.

---

## Roadmap

* [ ] Full Mietspiegel coverage for all 16 Bundesländer
* [ ] Postcode-level Mietspiegel matching (currently city-level)
* [ ] Sanity CMS integration for editorial rights articles
* [ ] Nebenkosten calculator (line-by-line disallowability checker)
* [ ] Mieterhöhung validator (checks if a rent increase notice is legally valid)
* [ ] Kautionsrechner (deposit interest calculator)

---

## Contributing

Pull requests welcome, especially for:

* Additional city Mietspiegel data (with source citations)
* Corrections to legal content (cite the BGB paragraph)
* New dispute types for the letter generator

Please open an issue first for significant changes. All legal content changes require a source citation.

---

## License

MIT — see [LICENSE](https://claude.ai/chat/LICENSE) for details.
