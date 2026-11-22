# Next labs and downloadable resources

## Biology expansion resource workflow

Follow BIOLOGY_BUILD_TASKS.md and the per-lab JSON reviews for current acceptance. Verified November 15, 2026: all 33 sequential build/review pairs are complete, all 48 main Biology catalog entries are locally available, and 105 resource PDFs pass current prompt/link/hash checks. Completed-report exports are additionally tested in each lab’s evidence; blank handouts are not substitutes. Native translations, classroom/physical-device acceptance and publication remain separate. The November 12 counts below describe the earlier AUD-08/09 snapshot; scripts/verify-resources.py reports current totals, prompt/link parity and hashes.

New builders: scripts/build-seed-resources.py; scripts/build-surface-resources.py; and scripts/build-biology-resources.py food-macromolecules food-content.js foodContent. The generic builder reads current authored prompts, controls, limits and teacher notes, embeds a Unicode font (Windows Arial or Linux DejaVu, configurable with LAB_RESOURCE_FONT), and updates only its generated resource hashes.

Run these authoring tools in a Python environment with ReportLab, pypdf, PyMuPDF and Pillow. scripts/render-biology-review.py LAB_ID renders retained reports/handouts for visual review and checks text fidelity. Python is a build-time authoring dependency; deployed labs use static browser assets and the existing Node API.

Browser review artifacts write to tmp by default. Set BIOLOGY_CAPTURE_LAB to the active stable lab ID when deliberately capturing retained acceptance evidence. Preserve already accepted artifacts during later regression runs. Rebuild the standalone app after resource changes to refresh its offline cache, and keep production publishing as a separate decision.


## Current resource status — AUD-08/09, 2026-11-12

There are **39 public PDF resources**, including a separate two-page [DNA to RNA to Protein teacher guide](public/resources/genetic-information-teacher-guide.pdf), the osmosis worksheet/guide, method-specific fermentation packets, and the updated legacy fermentation overviews. The genetics guide is linked from the catalog and the lab. All 153 pages were rendered and visually reviewed. Completed student reports are separate generated PDF/print exports, with optional name/period and unfinished/complete status; blank handouts do not replace them.

The current generators read live lab definitions and shared prompts. Use `scripts/build-resources.py` for the core three, `scripts/build-extended-resources.py` for the ten shared extended pathways, `scripts/build-dna-resources.py` for dedicated extraction, `scripts/build-osmosis-resources.py` for osmosis, `scripts/build-fermentation-classroom.py` for all three physical collectors and their overview URLs, and `scripts/build-genetics-resources.py` for the virtual-only information-flow guide. The core builder appends supplied cutouts once after rebuilding its base packets. Node, ReportLab, pypdf, Pillow, and Poppler are required as used by the generators.

After rebuilding resources, render and inspect the changed pages, refresh the `ASSET_INVENTORY.json` PDF hashes, and run `python scripts/verify-resources.py`. The checker compares current questions, analysis prompts, learning-purpose notes, condition names, dedicated prompts, classroom recipes, catalog downloads, and hashes. Rebuild the app afterward so offline copies include the resource revision. The current build verifies **62 cache URLs**. The [audit](LAB_DESIGN_AUDIT.md) records report, offline, interaction, and deployment checks plus the remaining classroom and physical-device acceptance.

Keep physical classroom method sheets with their real measurement units, time series, and observations alongside the online report. The online form exports what students enter there. Matter-cycle cards remain optional practice/discussion with separate saved placements and a paper response page. A separately assigned full-lab version would need the completed-work reporting contract.

The sections below retain earlier design history; their original page counts and controls describe those earlier revisions.

Current expansion: see LAB_BUILD_TASKS.md for the ten new cell/genetics labs and ASSET_REVIEW.md for the October 14 asset review. The sections below retain the earlier development history.

Implementation order: **8. Light and Photosynthesis → 7. Yeast Fermentation and Fuel Sources → 10. Measuring Mitosis**. Numbers are textbook references, not lab titles.

## Initial development release

Each lab includes a prediction/design stage, virtual or classroom data collection selected per treatment/field, common analysis questions, browser progress, a shareable setup link, CSV export, plain-text report download, and print-to-PDF reporting. Original model values and schematic cells are identified as simulated; classroom data remain measured observations. There is no login, protected answer key, automatic grade, or server submission.

| Lab | Virtual investigation | Classroom counterpart | Resources |
| --- | --- | --- | --- |
| Light and Photosynthesis | Three light treatments, three independent trials, 0–20 min observations, ET50 and mean curves | Floating leaf disks using matched preparation and light treatments | Three-page student worksheet; two-page teacher guide |
| Yeast Fermentation and Fuel Sources | Water control, glucose, sucrose; three trials; 0–30 min gas collection and average rates | Matched yeast cultures with gas syringes | Three-page student worksheet; two-page teacher guide |
| Measuring Mitosis | Two original schematic fields, 20 cells each; classification review, tally, percent, assumed duration | Counts from two non-overlapping prepared-slide fields | Three-page student worksheet; two-page teacher guide |

## Worksheet requirements

Student worksheets use the app's questions and treatment names. Include student/date/class fields; hypothesis and design spaces; raw observations; units; virtual/classroom provenance; replicate or sample counts; calculations; graph instructions; evidence-based explanations; limitations. Never embed teacher answers in the student worksheet. The current PDFs are printable, not fillable forms.

## Teacher-guide requirements

Include objectives, preparation/time, materials and relevant safety, classroom procedures, all-virtual and hybrid routes, substitute/absence instructions, model limitations, expected reasoning, troubleshooting, a suggested rubric, reading connections, and public-access disclosure. The guide's example results apply only to the model, not classroom grading targets.

## Resource lifecycle and next steps

1. Publish version-1 PDFs alongside the development labs. Generate them from shared content with `scripts/build-resources.py`; retain the generator and explicit version labels.
2. Teacher pilot: confirm equipment, age level, accessibility, observation times, and class-period fit. Check whether laboratory quantities need adapting locally.
3. Add editable DOCX versions and accessible, fillable PDF worksheets after the pilot stabilizes content; preserve the same activity IDs and table units.
4. Add bilingual or scaffolded versions if requested; track language and support level in resource metadata.
5. When assignments and tracking are built, store content/rubric versions and data provenance with each attempt. Add authenticated teacher resources only when a backend exists; static download URLs are public.

## Verification

Check all six downloads return PDFs, rendered pages have no clipping, student pages omit model keys, names and units match the app, hybrid sources survive refresh/export, and offline downloads work after initial site caching. Scientific models are instructional rather than empirically calibrated. Clinical interpretations of reaction rates or cell counts are outside these labs.

## Student entry and future teacher workspace

Photosynthesis opens directly to the student prediction/design activity; its teacher customization panel and assignment-link builder are removed. The default route is all virtual. Existing hybrid links and saved attempts remain supported so this UI change does not discard classroom work. Other labs retain their current setup pending review of this pattern.

For now, teachers can use the downloadable guide and worksheet to assign classroom components outside the website. No new setup page or login is implied. A separate public Teacher resources page would be an inexpensive interim option, but it would not provide teacher-only access; defer implementing it until requested.

When teacher accounts are introduced, add a Teacher dashboard → Lab library → Customize assignment flow. Teachers select activity modes, instructions, due dates, and assessment settings there, then preview the student view and publish an assignment link. Students open that assignment directly without teacher controls. Persist an assignment ID and content version, enforce teacher authorization on the backend, and preserve virtual/classroom data provenance. Migrate existing URL-based configurations into saved assignments rather than treating URL parameters as access control.


## Supplied molecule cutouts and equation activity

Photosynthesis and yeast fermentation overview pages offer separate Card Activity and Virtual Lab choices. The activity.html page shows a circular model with photosynthesis above and cellular respiration below; ATP and heat leave the cycle. Students drag illustrated cards or select a card and destination with mouse, touch, or keyboard. Two sets contain 38 individual molecules (12 CO2, 12 H2O, 12 O2, and 2 glucose) to build both equations simultaneously; five energy and organelle symbols complete eight groups. Light belongs in the external Energy transfer in box above the circle; chlorophyll stays in Light absorption. The supply dispenses one molecule per move. Students must balance quantities as well as types. A fixed destination bar allows placement anywhere without dragging across a large page; desktop dragging also scrolls near viewport edges. The version-2 saved activity keeps earlier bundle practice separate. Feedback checks direction, card multiplicities, symbol roles, and atom counts. Progress saves under a versioned, deployment-specific matter-cycle key, independently of lab data. Earlier equation practice remains stored but is not applied to this redesigned task. The respiration half represents aerobic respiration, not fermentation.

The photosynthesis student packet has 8 pages (3 lab + preparation/exploration + cutout introduction + 3 cutout sheets); its teacher packet has 8 pages including interactive-lamp guidance. The yeast student packet has 8 pages (3 lab + introduction + 3 reusable molecule sheets + respiration symbols); its teacher packet has 9 pages including all supplied originals and answer keys. Student packets omit the photosynthesis answer page and the text below the respiration symbols. Teacher resources remain public.

Source PDFs are preserved byte-for-byte under resources/source. Rebuild packets with scripts/build-resources.py; it calls scripts/cutout-resources.py only after rebuilding the base packet, preventing duplicate appendices. Requires ReportLab, pypdf, Pillow, and pdftoppm. The respiration student page embeds only the top 330 points of a 200 dpi rendering at original print size, so answer text is absent rather than merely hidden by a crop box. Future editable/fillable handouts should retain this separation and add a structured equation-response field to assignment reporting.


## Interactive leaf-disk model

The photosynthesis virtual collector now uses leaf-model.js and a leaf-simulator component. A general infiltration explanation is available before prediction. Detailed equipment directions and the three syringe pull/release cycles follow the required prediction and design. Lamp intensity can be changed at any time (Off/Low/High or 0-100%). A 30x/60x/120x clock, pause/resume, two-minute advance, and fast-forward controls integrate gas production, respiration, and loss; disks can rise and sink. The timer pauses at 20 minutes and can resume to 120. Navigation disconnects the timer, and reload resumes only on request.

Fully infiltrated runs held at the assigned intensity contribute 0-20 minute readings to comparison means. Other runs remain exploratory and are exported with light history. A fresh-disks reset replaces only the selected trial after confirmation. Legacy precomputed observations remain until a new interactive trial is begun. Persisted interactive trials live in leafRuns alongside the existing investigation state; numerical gas parameters are illustrative, not experimentally calibrated. Photosynthesis handouts include an extra preparation/exploration page. Teacher guidance separates model behavior from classroom expectations.


## Future language versions — required, not yet implemented

Plan Spanish and other reviewed, available language editions of worksheets, collector sheets, teacher resources, and completed student reports. Teachers must be able to choose the output language without changing their own app interface; an English-speaking teacher printing Spanish student materials is the initial acceptance example. Students need the matching in-app language option.

Generate translated PDF and native-print text from versioned localized definitions tied to stable lab/question IDs. Keep the English/legacy resource URLs and previous student work usable. Expose only languages actually available for a given resource, with an explicit notice/fallback for missing versions. Preserve scientific symbols, units, recorded values, student names, and verbatim student answers. Include output-language/version metadata and distinguish translated copies from the original submitted evidence.

Translation requires scientific/language review plus rendered layout checks for blank resources, partial/completed reports, long writing, accents/scripts, fonts, and appropriate offline assets. Review private teacher additions separately. Publisher translations and source-edition language metadata do not establish translated app or resource readiness. Follow [G18](LAB_DESIGN_GUIDE.md#g18) and track remaining implementation in AUD-10. No translated resource is marked complete by this planning update.
