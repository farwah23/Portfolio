# Umme Farwa — Web Developer Portfolio

A responsive, accessible single-page portfolio built with semantic HTML, modern CSS, and lightweight JavaScript.

## Project structure

```text
umme-farwa-portfolio/
├── assets/
│   └── umme-farwa-hero.jpg  # Optimized hero portrait
├── index.html             # Content and page structure
├── styles.css             # Design system and responsive styles
├── script.js              # Navigation, reveal effects, and contact interaction
└── README.md
```

## Run locally

From the project directory, start any static file server. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Customize the portfolio

1. **About text:** Edit the `#about` section in `index.html`.
2. **Skills:** Add, remove, or reorder `.skill-card` elements inside `#skill-track`. JavaScript duplicates these cards for a seamless automatic loop; the duplicates are hidden from assistive technology. Visitors can grab and drag the cards with a mouse or pointer, swipe on touchscreens, use a trackpad, or press the Left/Right arrow keys while the track is focused. The animation pauses during interaction and resumes 1.2 seconds after release. Change `elapsed * 0.025` in `script.js` to adjust the animation speed or `resumeSkillAnimation(1200)` to adjust the restart delay. Card widths are controlled by `.skill-grid` in the desktop, tablet, and mobile CSS rules.
3. **Projects:** The Selected Projects section uses a responsive four-card editorial grid without screenshots. The cards use alternating dark, theme-related ink surfaces with cream text and orange project-name buttons. Each card includes the project category, a concise description, and a button that opens the live website securely in a new tab. Edit the content or destinations directly in `index.html`; adjust the card layout and colors under `.project-grid` and `.project-card` in `styles.css`.
4. **Contact:** The demo copies a prepared message to the visitor's clipboard. For production, connect the form to Formspree, Netlify Forms, your own PHP endpoint, or another form service in `script.js`.
5. **Links and résumé:** Add GitHub, LinkedIn, email, and résumé links once those details are available.
6. **Colors:** The requested palette is stored as CSS variables at the top of `styles.css`.

## Footer social icons

The footer uses a responsive, two-column contact layout inspired by the supplied reference: a large “Let’s work together.” message sits beside labeled links for Email, WhatsApp, Instagram, Facebook, and X/Twitter. Each uppercase platform label includes its Font Awesome icon, with the account name or address displayed beneath it. Destinations are defined directly in `index.html`; external profiles open in a new tab with `noopener noreferrer`, while Email uses `mailto:`. Footer layout, grid spacing, colors, and hover motion can be adjusted in the `.footer` rules in `styles.css`.

The hero portrait uses a circular 1:1 crop with a static, thin orange border controlled by `.hero-portrait` in `styles.css`.

## Site-wide GSAP 3D motion

GSAP and ScrollTrigger power the portfolio’s coordinated 3D motion system. The header, hero copy, and portrait animate on page load with perspective, depth, and rotation; About, Skills, Projects, and Contact content reveal from alternating 3D angles; and footer contact rows animate in sequence. On hover-capable devices, the portrait, project cards, and contact form respond to pointer position with subtle 3D tilt. Elements settle flat after entrance so text remains readable and existing CSS interactions continue working. The Intersection Observer reveal remains as a fallback if GSAP cannot load, and visitors who prefer reduced motion receive the complete page without 3D animation. Animation timing and targets are configured in `setupPortfolioMotion()` and `setup3DTilt()` in `script.js`.

## Locomotive smooth scrolling

Locomotive Scroll 4.1.4 provides eased scrolling across the main page and footer while the fixed navbar remains outside the transformed scroll container. Its scroll position is synchronized with GSAP ScrollTrigger through `scrollerProxy`, so section reveals and footer motion use the same source of truth. Internal navigation links use Locomotive’s `scrollTo` method and account for the fixed header. The integration automatically falls back to native scrolling when the library is unavailable or the visitor enables reduced motion. The pinned CDN assets and `data-scroll-container` wrapper live in `index.html`; initialization, GSAP synchronization, anchors, resizing, and cleanup live in `script.js`.

## Day and night mode

The sun/moon button in the navigation switches between the original cream day theme and an ink-and-brown night theme. The selected theme is stored under `umme-farwa-theme` in local storage and restored before styles load to avoid a theme flash. When no saved choice exists, the portfolio follows the visitor’s system color preference. Theme behavior lives in `script.js`, while night-mode colors are defined under `html[data-theme="dark"]` in `styles.css`.

## Hero portrait

The right side of the hero uses `assets/umme-farwa-hero.jpg`, an optimized 900×1200 portrait. To replace it later, export a 3:4 JPG or WebP, keep the subject centered, and either reuse the same filename or update the image `src` in `index.html`. The intrinsic `width` and `height` attributes should match the replacement asset to prevent layout shifting.

## Design tokens

- Accent orange: `#eb5e28`
- Warm cream: `#efece3`
- Deep ink: `#2c2324`
- Muted brown: `#766754`

## Deployment

The project is fully static, so it can be deployed to GitHub Pages, Netlify, Vercel, or any basic web host. Upload the project files with `index.html` as the site root.

## Accessibility and performance

- Semantic sections and heading hierarchy
- Keyboard-friendly skip link and navigation
- Keyboard, touch, and native-scroll support for the automatically animated Skills slider
- Reduced-motion support
- Responsive layout across mobile, tablet, and desktop
- No heavy front-end framework or runtime dependency
