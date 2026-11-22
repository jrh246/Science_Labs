# Science Labs

A searchable static library: Home → Science → Biology → Units → Labs. Eight Biology units contain 48 catalog investigations. All 48 investigations are available in the standalone development library, plus an optional Sordaria extension and a matter-cycle card activity. Modular investigations support virtual/classroom data, printable worksheets and teacher guides, and report/data downloads. The 33 previously planned investigations have completed their sequential development builds and reviews; production publication and external classroom/device/language acceptance remain separate. See [LAB_LEARNING_REVIEW.md](LAB_LEARNING_REVIEW.md) for the learning purpose and required work in every implemented lab and design guidance for all planned entries.

Run `npm ci` and `npm run dev` to preview locally. See [ARCHITECTURE.md](ARCHITECTURE.md) for routes, catalog fields, standalone and account-platform boundaries, and validation.

## Existing Cell Homeostasis Virtual Lab

In the standalone build, the seven-step dialysis-tubing investigation is aligned to the supplied **Cell Homeostasis Virtual Lab** worksheet. It uses no accounts, APIs, analytics, or server application. Answers stay in browser localStorage. Reset clears saved progress. The optional account platform described below adds authenticated cloud saving and teacher submissions.

## Supplied osmosis observations

Edit `src/data/labConfig.js`. Concentrations, water volumes, sugar masses and before/after masses use the teacher's supplied values. They have not been independently verified against the original interactive. The 2.5 g empty dish mass remains illustrative. Concentrations use % w/v with the classroom approximation that added sugar does not change volume. Final masses are supplied observations, not calculated osmotic predictions.

The teacher confirmed that the latest lab corrections resolved the older concentration wording and accepted the current lab. A and D are the configured equal-concentration conditions.

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

Resource roadmap: [LAB_RESOURCES_PLAN.md](LAB_RESOURCES_PLAN.md). New lab build order: Biology 2e chapters 8, 7, then 10. Procedures and diagrams are original; simulated results are instructional models rather than empirical measurements.

## Fruit DNA extraction workspace

The DNA activity (`investigation.html?lab=dna-replication`) now uses a dedicated interactive bench. Students move fruit, mash it, add measured ingredients, filter and layer alcohol. One preparation and two model-prepared controls replace nine repeated preparations. Two mechanism checks and two evidence explanations focus the activity on membranes, separation, controls and limits of visual evidence. Classroom entry, downloads, offline access and earlier-work export are supported. The worksheet includes concept support, observations, and explanations in three pages; the teacher guide is two pages. Students can download their own completed lab report as a PDF or print it, including all recorded responses. See `ARCHITECTURE.md` for state and validation details.

## Learning-focused workflows

The required comparisons now use three enzyme reactions, two plants, three expression reactions, and one gel. Extra independent trials remain optional when studying reliability. Sampling remains required in microscopy, mitosis, inheritance, linkage, Sordaria, photosynthesis, and yeast because the questions use sample differences. After one completed virtual sample, a matched-preparation shortcut removes repeated setup while retaining fresh readings, measurements, and classifications. Reporter plates require one spreading pass instead of three.

Each modular lab explains why its amount of work is required. Earlier multi-trial work in the shortened labs is preserved and downloadable; new comparisons start separately. The worksheets and teacher guides match the revised workflows.

## Virtual-only molecular genetics lab

`investigation.html?lab=genetic-information` opens **DNA to RNA to Protein** in Genetics. It is a supplemental virtual-only activity, separate from fruit extraction and the fluorescent-protein investigation. Students place enzymes, build short complementary DNA and RNA windows, process/export mRNA and decode three amino-acid codons plus a stop signal. Required location checks and two explanations distinguish copying the genome from expressing a gene. Reports include optional name/period, PDF download, printing and recorded-response JSON. No classroom route or wet-lab materials are presented.


## Amplify / Neon account platform

The separate account platform adds Better Auth with Resend email, owner course/unit/lab publishing, immutable lab releases, teaching workspaces, classes/invitations, version-pinned assignments, user-scoped cloud drafts, immutable submissions, teacher report review/PDF/print/JSON, and pilot/school licenses. Stripe subscription checkout, billing management, and verified webhooks are implemented but disabled until configured.

Run `npm ci --prefix server` and `npm run dev:platform`. This builds and registers the current labs locally before starting the servers. Open `http://localhost:4310/platform.html`; sign in as owner and choose **Development labs** (`http://localhost:4310/platform.html#/development-labs`) to preview every built lab without changing public publishing switches. Restart the development command after changing lab sources. The main catalog supports live search and course, unit, lab-format, and sorting filters, with choices kept in the URL. Completed Biology labs are now published in the local catalog for review; hosted publishing remains separate. The public library continues to show only published course/unit/lab versions and honors access settings. See [PLATFORM_DEPLOYMENT.md](PLATFORM_DEPLOYMENT.md) for the local owner account, email outbox, deployment steps, environment separation, domain requirements, and remaining hosted acceptance. Test with `npm test --prefix server` and `npm run test:platform:browser`.

The standalone lab build remains supported. Device work can be exported from the original library and explicitly imported into a matching assignment. Real cloud resources, email delivery, and billing require environment configuration; local development uses an isolated embedded PostgreSQL database and captured email.


## Planned app languages and translated printing

The site must eventually let students choose Spanish or another available language directly in the app. Teachers must be able to download/print translated student materials, including Spanish handouts while using an English interface. Language changes must preserve progress, original answers, and the science. Free-lab language selection must remain available without sign-in or a paid membership.

This is a documented future requirement, not a released translation feature. Implementation and language-review work are tracked under [G18](LAB_DESIGN_GUIDE.md#g18), [AUD-10](LAB_DESIGN_AUDIT.md#aud-10), and the localization section of ARCHITECTURE.md.


## Remaining Biology build tasks

[BIOLOGY_BUILD_TASKS.md](BIOLOGY_BUILD_TASKS.md) records the completed sequential builds and separate development reviews for the 33 previously planned Biology labs. Any further queue work requires a passing review before the next build begins. Start with `npm run biology:queue`. Queue/review data are in `data/development-tracker/biology-build-queue.json` and `biology-reviews/`. Current catalog availability, standards approval, language readiness, and whole-course completion remain separate.


Your one-at-a-time lab review is tracked separately in [BIOLOGY_USER_REVIEW.md](BIOLOGY_USER_REVIEW.md). It records your three stated reviews and keeps the bird lab open for your recheck after the [PDF delivery correction](data/development-tracker/pdf-audits/2026-11-15/README.md). Development build checks do not check off your review.


[BIOLOGY_LAB_MODES.md](BIOLOGY_LAB_MODES.md) identifies current Virtual/Classroom support and specific proposed classroom counterparts for all 49 Biology labs. Current support, classroom adaptation plans, physical classroom validation, and user review are separate; a planned practical or paper-model activity does not change an app’s virtual-only label.


[Classroom activity shortlist](BIOLOGY_CLASSROOM_OPTIONS.md): two or three ranked proposals per lab, with source links, learning evidence and virtual-redesign implications. Open the searchable review page at http://localhost:4310/CLASSROOM_ACTIVITY_OPTIONS.html. The planning page is separate from lab publication and does not change current app modes or user approval.
