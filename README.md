# Science Labs

A searchable static library: Home → Science → Biology → Units → Labs. Eight Biology units contain 47 proposed investigations. Osmosis and Cell Homeostasis is the first available virtual lab; other investigations are explicitly marked planned.

Run `npm ci` and `npm run dev` to preview locally. See [ARCHITECTURE.md](ARCHITECTURE.md) for routes, catalog fields, future assignment/reporting boundaries, and validation.

## Existing Cell Homeostasis Virtual Lab

Static, private, seven-step dialysis-tubing investigation aligned to the supplied **Cell Homeostasis Virtual Lab** worksheet. No accounts, APIs, analytics, or server application. All answers stay in browser localStorage. Reset clears saved progress.

## Experimental values — teacher review required

Edit `src/data/labConfig.js`. Concentrations, water volumes, sugar masses and before/after masses use the teacher's supplied values. They have not been independently verified against the original interactive. The 2.5 g empty dish mass remains illustrative. Concentrations use % w/v with the classroom approximation that added sugar does not change volume. Final masses are supplied observations, not calculated osmotic predictions.

Some surviving versions of the worksheet identify tubes A and C as having little or no mass change. Based on the documented concentrations and experimental dataset, A and D are the isotonic conditions. The recreated simulation uses A and D.

Each new run adds triangular measurement error up to ±0.05 g to the supplied initial and baseline final masses, rounded to hundredths. Measurements are generated once, stored locally, and reused for weighing, calculations, tables and graphs. Reset creates a new dataset; refresh retains it. Generation rejects errors that reverse gain/loss or produce an isotonic change of 0.20 g or more. Biological conditions remain fixed. Existing version-1 saved experiments retain their original measurements. Teacher-adjustable noise and isotonic limits are in the same configuration file. Student-facing screens present experimental measurements without describing randomization.

## Local development

Node 22.12+ (tested with Node 24). From this directory:

```sh
npm ci --cache /tmp/science-npm-cache
npm run dev
```

## Build and validation

```sh
npm test
npm run build
npm run preview
npm run test:e2e
```

Output: `dist`. Browser tests use `/usr/bin/chromium` when available, a path supplied by `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, or Playwright’s installed Chromium. Run `npx playwright install chromium` if needed. Browser tests cover the full experiment, required gates, incorrect calculation feedback, refresh, offline reload, reset and four viewport widths. Screenshots are written to `test-results`. Chromium checks do not replace testing on actual Safari/iPad or Android hardware.

## Cloudflare Pages

Connect this repository. Build command: `npm run build`; output directory: `dist`; root directory: repository root. Use Node 24. No runtime secrets or environment variables are needed. HTTPS enables offline service-worker caching.

## GitHub Pages

The included `.github/workflows/deploy.yml` tests, builds and deploys `dist` on pushes to `main`. In GitHub Settings → Pages → Build and deployment, select **GitHub Actions**. Push to `main` or manually run **Deploy lab** in the Actions tab. The site will be at https://jrh246.github.io/Science_Labs/. Relative build URLs support repository subpaths.

## Offline and accessibility

The generated service worker precaches the built HTML, CSS, JavaScript, manifest and SVG icon. Open once online and allow installation to finish before disconnecting. Refresh preserves work. An updated build gets a new cache version. Installation UI varies by browser; tablets can add the site to the home screen. SVG icons may require PNG alternatives for some installation UIs.

Semantic controls, keyboard focus, signed numeric input, text labels, touch targets, tap placement alongside native drag/drop and reduced-motion clock support are included. Conclusions appear only in results. No CDN or remote fonts are used.

Reset Lab clears recorded work and refreshes this lab’s offline cache from the server. If offline, it retains fallback assets so students can start again without internet. It cannot clear Chrome’s general HTTP cache. Preparation uses an 4-second fill, 2-second weighing, and 4-second sugar pour with a reduced-motion alternative. Prepared beakers remind students to record their solution information on the worksheet.
