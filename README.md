# Lumina Strategy Solutions

Marketing landing page for **Lumina Strategy Solutions (SMC-Private) Limited** — an outsourced sales, support, and lead-generation team based in Gulberg-II, Lahore.

Built as a single static HTML page with vanilla CSS and JavaScript. No framework, no build step.

## Structure

```
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    ├── images/        # logos, decorative star, office + team photos
    └── video/         # circular hero video
```

## What the page does

- **Audience toggle** in the hero — switches between *For Businesses* and *Careers* views; choice persists via localStorage
- **Animated stats** that count up when scrolled into view
- **Hero video** masked into a circle, plays once on load and replays when the hero re-enters the viewport
- **Service overview** in a 2x2 card grid
- **"Why Lumina"** editorial card grid (Business) and **"Get paid to talk"** perks section (Careers)
- **Open roles** with collapsible job cards
- **Testimonials** carousel on desktop, stacked cards on mobile
- **CV application modal** — opens from any "Send your CV" button, includes file upload + math captcha
- **Pinned announcement bar** that slides in after the hero scrolls off-screen
- **Mobile hamburger nav** below 720px

## Running locally

The page is fully static. Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 3000
# then visit http://localhost:3000
```

## Design system

Three card variants used across the page for visual consistency:

- **Variant A — Branded featured** (blue gradient + yellow accent): hero stats card, featured Why Lumina card
- **Variant B — Clean** (white + light border + hover lift): all other content cards
- **Variant C — Voice / personal** (lavender): testimonials only

Typography: **Manrope** (display, headings, stat numbers) + **Inter** (body, UI). Loaded from Google Fonts.

Brand palette: blue `#2563eb` (primary), gold `#FFA800` (accent — sparkle, gradients), navy `#0E1525` (text on light backgrounds).

## Notes for future contributors

- Cache-busting query strings (`?v=N`) on `styles.css`, `main.js`, and `hero-person.mp4` — bump these whenever you edit those files so browsers fetch the new version
- The decorative stars and the testimonial avatars all reuse `assets/images/star.svg` and `assets/images/people.png` via CSS background-position quadrant cropping
- Widow prevention runs on page load — the last 3 words of every paragraph and heading are bound together with non-breaking spaces so no word ever wraps alone
