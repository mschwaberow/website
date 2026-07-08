# KinStay Website — Tasks

## Status
Complete first draft of a single-page site built and ready to preview. Not yet deployed to
GitHub. A few content items need Matt to confirm/fill before publishing (see below).

## Before You Publish — Confirm / Fill In
- [ ] **Activate the direct-booking form (1 step).** Get a free access key at
      https://web3forms.com (enter the email where you want inquiries delivered — they email you
      a key instantly, no account needed). In `index.html`, replace `YOUR-WEB3FORMS-ACCESS-KEY`
      in the form's hidden `access_key` field with your key. Until then the form validates and
      shows the captcha but won't send. Inquiries arrive at whatever email you signed up with.
      (Captcha uses Web3Forms' shared hCaptcha key and already works — no setup needed. To use
      your own hCaptcha or Cloudflare Turnstile later, swap the `data-sitekey`.)
- [x] **Turn on the live calendar** by deploying the Cloudflare Worker (README → "Live
      Availability Calendar") and setting `endpoint` in `js/availability.js` to its URL.
      ⚠️ Do NOT paste the raw iCal URLs into the repo — those feeds contain guest reservation
      codes and last-4 phone digits, and this repo is public. The Worker holds the URLs
      server-side and returns dates only. (The old public-proxy approach was dropped: it exposed
      those URLs client-side AND the proxy — allorigins — was returning 522s.)
- [ ] **Verify the headline stats** against the live Airbnb/VRBO listing: currently shows
      **4 bedrooms · 3 bathrooms · sleeps 10**. These are inferred from the AirDNA report and
      photo folders — correct them in `index.html` (the `.facts` block, the About section,
      and the FAQ) if the real listing differs.
- [ ] **Decide on public contact.** The site intentionally routes inquiries through Airbnb/VRBO
      messaging (no personal cell/email is published, to avoid spam). Add a dedicated email if
      you want a direct contact button.
- [ ] **Pet policy** wording in the FAQ points guests to the listings — set it explicitly if
      you have a firm policy.

## Up Next (optional enhancements)
- [ ] Add an embedded map (Google Maps iframe) in the Area section.
- [ ] Seasonal hero swap (snowy exterior in winter, green in summer).
- [ ] Direct booking — phase 2: the current form is a manual inquiry route (you follow up and
      collect payment yourself). To make it self-serve with real-time availability and payment,
      add a booking engine (Hospitable/Lodgify/OwnerRez) synced to the Airbnb/VRBO calendars.
- [ ] Add Plausible or Google Analytics to track visits.

## Done
- [x] Set pet policy in the FAQ: small pets welcome for a small nightly fee, ask first.
- [x] Hardened the calendar to fetch a single sanitized Worker `endpoint` (dates only) instead
      of exposing tokened iCal URLs client-side — the raw feeds leak guest confirmation codes &
      last-4 phone digits, which must not ship in a public repo.
- [x] Added Google Analytics 4 (gtag.js, measurement ID G-2DL3CGDNX8) high in <head>.
      Verified a live page_view hit reaching GA. Note: your own/localhost visits count —
      set up an internal-traffic filter in GA if you want to exclude them.
- [x] Added a live availability calendar (js/availability.js) in the Book-direct section: parses
      Airbnb + VRBO iCal feeds and greys out booked nights, shows 3 months + legend, degrades
      gracefully with no feeds. iCal parsing verified (checkout day stays available).
- [x] Replaced the "Painter's Pond parking" line with "Private driveway parking for 3–4 cars".
- [x] Added a direct-booking route: reframed Book into two paths (instant on Airbnb/VRBO vs.
      book direct), plus a "#inquire" section with a check-availability step (links to both
      calendars) and a styled inquiry form (name, email, phone, dates, guests, preferred contact
      method, message). Submits via Web3Forms (static-friendly, emails the owner) with hCaptcha
      spam protection and an inline success message. Needs the access key above to go live.
- [x] Added 4 real 5-star guest reviews (2 Airbnb, 2 Andrea/Colette + 2 VRBO Cara/Heather),
      lightly trimmed for length with meaning unchanged, plus a "Rated 5 stars on Airbnb & VRBO"
      header. Source text pasted from the live listings on 2026-07-08.
- [x] Swapped hero to the fall exterior photo (IMG_20191103_143026); renamed property to
      "KinStay Massanutten" and corrected "cabin"→"house" and "Blue Ridge"→"Massanutten".
- [x] Optimized 17 professional photos into web-sized thumb + full versions, plus hero,
      OG image, favicons, and a cream logo for the footer.
- [x] Built responsive single-page site: hero, quick facts, about, amenities (12), gallery
      w/ lightbox, area guide, reviews, booking CTAs, FAQ, footer.
- [x] SEO: title, meta description, Open Graph/Twitter tags, favicons, sitemap, robots,
      JSON-LD LodgingBusiness structured data.
- [x] Brand palette derived from the KinStay logo (teal #40A798).
- [x] CNAME set to kinstay.com for GitHub Pages.

## Known Issues / Deferred
- Airbnb/VRBO listings block automated fetching, so property facts came from local docs
  (AirDNA report, guidebook) rather than the live listings — hence the "confirm stats" task.
  Review text was pasted in manually from the live listings (fetch/browser access was blocked).

## Notes for Next Session
Site lives in `D:\Dropbox\4466 Palmer\Website\`. To deploy, copy the folder contents into the
GitHub Pages repo and push. Content is all in `index.html`; the gallery photo list is the
`PHOTOS` array in `js/main.js`. Source photos: `../STRPics/Nano Pics`.
