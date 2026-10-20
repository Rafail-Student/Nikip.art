# Nikip.Art

Portfolio and commissions site for Nikip.Art, an artist who paints places in acrylic and watercolour.

**Live:** https://rafail-student.github.io/Nikip.art/

## What it does

- **Home, gallery, commission form and privacy pages**, in English and Greek (`/el/`)
- **Lightbox gallery** with keyboard navigation, pinch / wheel / tap zoom up to 4x and drag-to-pan
- **Commission form** with in-browser validation, sent asynchronously (Fetch API) to Formspree, with clear error and offline messages
- **Responsive** from small phones to desktop, with a separate lighter hero video for mobile

## How it's built

Plain HTML, CSS and JavaScript. There are no frameworks, no libraries and no build step.

- **Progressive enhancement:** every page renders, navigates and submits even if `script.js` fails to load
- **Performance:** WebP images, lazy loading, self-hosted fonts, and a hero video that only loads when it scrolls into view (`IntersectionObserver`)
- **Accessibility:** semantic markup, ARIA on interactive parts, a skip link, and support for `prefers-reduced-motion`
- **Hosting:** GitHub Pages, deployed straight from `main`

```
index.html, paintings.html, contact.html, privacy.html, 404.html   English pages
el/                                                                Greek pages
style.css                                                          all styles
script.js                                                          all behaviour (vanilla JS)
assets/                                                            paintings, videos, logos, fonts
```

## Background

The first version of the site was built in WordPress with Elementor. I developed it locally in LocalWP and migrated it by hand, database included, to Pantheon. I rebuilt it from scratch in plain code to get full control over the markup, faster load times and free static hosting.

## How I worked

I built this site with [Claude Code](https://claude.com/claude-code) as a pair programmer. I made the design and technical decisions, gathered feedback from the artist, and reviewed, tested and iterated on every change. The commit history shows that process step by step.

## Author

Rafail Iliadis, Applied Informatics student, University of Macedonia
[github.com/rafail-student](https://github.com/rafail-student)

---

All paintings and photographs © Nikip.Art. All rights reserved.
