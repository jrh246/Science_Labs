# Science Labs library

## Navigation

The Vite build has three entry points. `index.html` hosts the catalog; `lab.html` hosts the existing osmosis investigation; `investigation.html?lab=:id` hosts the modular investigations. Hash routes work on static hosting and GitHub Pages repository subpaths without server rewrite rules:

- `#/` — landing page
- `#/science` — discipline selection
- `#/science/biology` — eight Biology units
- `#/science/biology/:unitId` — unit investigations
- `#/science/biology/:unitId/:labId` — lab overview
- `#/search?q=...&available=1` — shareable search results

All catalog pages have global search and breadcrumbs. The working lab has return navigation and library search. The service worker caches all HTML entries and the PDF resources, including offline navigation. The existing lab retains its `cell-lab` browser-storage key so previously saved experiments remain usable on the same origin.

## Content

`src/catalog.js` is the content source: eight units and 47 proposed investigations aligned to Biology 2e. Titles describe investigations; chapter references are descriptive metadata. Fourteen catalog labs are available; 33 are planned. An optional Sordaria extension and matter-cycle activity are also runnable. Planned entries have overview pages but no launch control. The modular labs support virtual/classroom data selection per treatment or field, shared setup links, local progress, data/report exports, and downloadable worksheets and teacher guides.

Records have stable IDs, subject/unit relationships, type, version, status, supported modes, and launch URL. Add another lab or interactive by adding a record and its standalone entry point; register the entry with Vite. Add subject-level routes when another discipline has real content. Current search indexes lab titles, summaries, units, subjects, and chapter references. Search is browser-side and needs no service.

## Future assignments and reporting

Keep content IDs separate from teacher, assignment, learner, and attempt IDs. An eventual assignment should reference a lab ID and content version, plus teacher-selected activity modes. Each activity will need a stable ID and evidence/assessment definition before hybrid assignments are implemented. An attempt should record activity responses, data provenance (measured, simulated, or supplied), timestamps, and rubric version.

Authentication, authorization, persistent submissions, grading, and reports belong behind a future service interface. Browser localStorage is temporary device progress, not an authoritative student record or grade store. No identity or grade collection is implemented in this branch. Avoid adding fake login controls until the account service exists.

## Validation

Run `npm ci`, `npm test`, `npm run build`, then `npm run test:e2e`. Install Chromium with `npx playwright install chromium` if needed. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an existing Chromium installation. Tests cover catalog integrity, hierarchy, search, planned states, progress preservation, responsive layouts, offline entry separation, and the original lab workflow.

## Production and development deployments

`main` publishes at `/Science_Labs/`. `codex/development` publishes at `/Science_Labs/dev/`. A push to either branch rebuilds and tests both branches, assembles a single Pages artifact, and verifies progress/cache isolation in Chromium before publishing. Keep the workflow on both branches in sync. Both branches must be allowed in the `github-pages` environment. Never deploy a single branch artifact by itself: Pages replaces the entire published site.

Each address exposes `deployment.json` with the branch and deployed SHA. Preview pages display a testing banner and use a distinct browser-storage key. Service worker caches are namespaced by their registration path; root workers ignore `/dev/` traffic. The legacy production `cell-lab` progress key remains unchanged. This is operational separation on one origin, not a security boundary for untrusted code.

To promote the reviewed library, merge `codex/development` into `main`. Development edits stay on `codex/development` until that promotion. GitHub Pages preview is public.

## Modular investigations and resources

`src/investigations/content.js` holds original procedures, questions, method limitations, and source links. `model.js` provides deterministic seeded simulations, ET50 interpolation, tally/duration analysis, and persisted-state validation. `app.js` supplies the common prediction/collection/analysis flow; `visuals.js` contains original SVG teaching diagrams. All raw data carry a virtual/classroom source; student completion is not grading. Saved attempts are keyed by environment path, lab, version, and incoming source configuration.

`LAB_RESOURCES_PLAN.md` documents the 8 → 7 → 10 build sequence and downloadable-resource lifecycle. `public/resources` contains printable worksheets, teacher guides, and method-specific packets generated by the resource scripts. The shared resource builder reads exported content JSON; the extended builder reads the lab definitions directly. These PDFs are not fillable yet. Teacher guides are public. The service worker precaches the resource PDFs for offline use after initial caching.

## DNA extraction learning workspace (v2)

The stable `dna-replication` URL now routes to `extraction-app.js`, with a dedicated state machine, original shaded SVG equipment, and scoped CSS. Students prepare one complete extraction with pointer drag or click/tap/keyboard controls, answer two mechanism checks, and compare two model-prepared controls. All three observations require student-selected ordinal scores and notes. Two written responses replace the generic analysis form. Completion records work, not correctness.

A separate `extraction-v2` storage key preserves the earlier `original-v1` work, which remains downloadable. Progress and data retain the existing environment-path isolation. Reload pauses simulated time. Classroom mode accepts actual observations directly and hides simulated specimen art. Hybrid comparisons label each source; they must not be used to attribute cross-source differences to detergent alone.

`extraction-model.js` defines preparation gates and illustrative outcomes. The model is not experimentally calibrated; a single sample per condition cannot estimate variability. Physical classroom repeats remain recommended. `scripts/build-dna-resources.py` generates the matching three-page student worksheet and two-page teacher guide; the extended-resource builder delegates this lab to it.

Validation: `npm test`, `npm run build`, and `npx playwright test tests/browser/extraction.spec.js`. The dedicated browser tests cover dragging, mashing, keyboard/tap access, checkpoint feedback, observed scores, refresh/offline persistence, classroom entry, exports, reset, and responsive layouts.

## Learning-purpose and repetition decisions

`learning-design.js` records the instructional reason for each runnable lab's workload and exposes fresh-sample setup helpers and per-sample summaries. See `LAB_LEARNING_REVIEW.md` for all 48 catalog entries plus the extension and card activity. The core enzyme, plant, expression, and gel sequences are 3, 2, 3, and 1 runs respectively; their `workflowVersion: 2` selects a `streamlined-v2` key. Original-v1 attempts are left untouched and offered as raw JSON downloads. No implicit conversion discards earlier samples.

Setup shortcuts require an earlier collected virtual sample. They alter preparation only, keeping the next sample's parameters and leaving time, observations, tallies, and classifications for the student. Microscopy starts with an unmeasured ruler and requires adjustment for each new cell; older saved attempts without this flag remain compatible. Leaf/yeast retain their trial variability. Mitosis retains 40 classifications. Corn, fly, and Sordaria analysis presents per-sample percentages before pooling, with data-source labels.

`tests/learning-design.test.js` checks sampling counts, essential controls, fresh-sample behavior, and shortcut eligibility. Browser walkthroughs cover both initial manual preparation and later shortcuts, shorter completion sequences, exports, and saved-work preservation. PDF generation uses Poppler when available and a PyMuPDF fallback for the existing cropped classroom cutout; source cutout PDFs are not modified.

## DNA explanations and report requirement (activity revision 3)

Student support defines release, separation, filtrate and precipitation, then connects the lipid bilayer to detergent action. Both mechanism checkpoints show an explicit requirement before the next tool instruction; equipment controls and pointer dragging stay disabled until a correct response. `checkAttempts` preserves answer order as well as the current answer.

New attempts use `modelVersion: 3`: the no-detergent illustration has faint material, representing partial release through mechanical disruption. Real recovery is not calibrated from these categories. Recorded older attempts retain model revision 2 and their original observations, with a visible explanation and an option to start fresh by resetting. Earlier unobserved attempts adopt revision 3. The storage schema/key remains `extraction-v2` for compatibility; the report distinguishes storage, content, model, and report-schema versions.

**A completed student PDF report and a print action are required deliverables for this lab and future lab designs.** A blank worksheet, CSV, or text export does not meet this requirement. Reports must preserve the prediction, checkpoint responses and history when available, source-labeled observations, explanations, completion status, and content/model version. Exporting unfinished work is allowed when visibly labeled In progress. Completion is not grading.

`extraction-report.js` produces one versioned response snapshot for PDF, print HTML, and JSON. It uses stable question and condition IDs, an attempt ID, and explicit `not_graded` status so later assessment can consume actual responses. The PDF embeds the same UTF-8 JSON as an attachment. Optional name/class stay on the device; there is no upload. These locally editable records are not authenticated submissions or authoritative grades.

`lab-report-pdf.js` loads pdfmake and its Roboto fonts from the local bundle. Vite precaches that lazy chunk, so the first report can be generated offline after initial installation. PDF text is selectable and long responses flow across pages. The print view is regenerated before printing, including native browser printing. Browser tests verify the PDF signature, offline generation, optional identity, print content, and long answers; rendered PDFs and attached response data are checked with PyMuPDF and pypdf.

Scientific references: [University of Utah](https://learn.genetics.utah.edu/content/labs/extraction/howto/) for membranes, detergent, filtration and precipitation; [Smithsonian](https://invention.si.edu/activities/hands-on-activities/extract-dna-home) for mechanical cell disruption. The model's category choices are instructional, not measured quantities.

## Student identification on existing lab reports

The three core investigations and ten extended investigations (including Sordaria, excluding the dedicated DNA extraction app) offer optional Name and Class / period fields beside their report exports. `report-identity.js` supplies the shared form, text heading and escaped print summary. `studentName` and `studentClass` persist under each attempt's existing storage key. Older saves default these fields to blank without discarding observations, and identity edits do not change completion status. Text downloads and native printing reflect the current values immediately. DNA extraction retains its existing optional identity fields and PDF report.

## Virtual-only genetic information lab

`genetic-information` is a supplemental Genetics catalog entry (`virtualOnly: true`, modes `[Virtual]`), with its own `genetics-app.js`, model, artwork, report builder and scoped styles. It does not replace the stable extraction or reporter-expression routes. Catalog totals are derived from entries.

The six stages distinguish orientation, DNA replication, transcription, RNA processing/export, translation and explanation. `genetics-model.js` owns transitions, required locations, complementary DNA/RNA windows, tRNA/codon pairing, release at stop and completion prerequisites. DNA synthesis on the opposite template is shown in reversed reading orientation. Primer setup, long extensions and parts of the molecular machinery are supplied by the model and disclosed. The cellular context is a nuclear eukaryotic gene. The product is explicitly a three-amino-acid fragment, not a complete functional protein.

Saved state uses `science-labs:{environment path}:genetic-information:v1`. Restore replays action history through the transition function, preserving corrections and refusing invented phase/completion flags. Written answers and optional identity are retained separately. Pointer drag, click/tap placement, keyboard controls and reduced-motion styling use the same state transitions. `genetics-workbench.js` defines physical work sites and component trays for every process. Targets sit on the DNA fork, primer, growing DNA/RNA end, promoter, RNA ends/intron, nuclear pore, and ribosome. `place` events record the component and site together; the model validates both before running a transition. Legacy tool/base events remain replayable. SVG animations show enzyme binding and extension, cap addition, intron removal/exon joining, tail growth, mRNA export, tRNA delivery/chain growth, and release at stop. Capping enzymes, spliceosome, and poly(A) polymerase are represented as machines; mRNA and tRNAs are labeled as RNA rather than enzymes. Animation/replay state is ephemeral and never adds student attempts; reduced motion shows the resulting structure immediately. The molecular view is brought into view for enzyme placement and action on smaller screens.

Report schema 2 shares one snapshot across PDF, native printing, and JSON: optional name/period, prediction, model results, evidence grouped by learning goal, concept checks, and verbatim written explanations. The visible report summarizes demonstrated work and concepts revisited after feedback. Raw action history is retained only in structured JSON and the embedded attachment for future assessment. Reports distinguish student-built excerpts from model-supplied work and do not infer mastery from completion alone. Human timestamps include a readable local date/time and time zone; the ISO timestamp is retained in the data. Named downloads and the print title include a sanitized student name when provided. Long writing flows across pages. Reports work offline after initial caching; no overall grade is assigned.

Student directions, feedback, checkpoints, glossary, and report labels use short sentences with ninth-grade explanations for new biology terms. Report activity version 2 adds readable component/site placement records without changing the saved-state key or response schema. All molecular actions offer pointer dragging and a select-then-place alternative; the component tray and work sites stay together for touch use.

## Completed student reports across existing investigations (AUD-01)

All fourteen formerly missing completed-PDF pathways now share `student-report.js` (immutable response snapshot, PDF/HTML renderers, filename/time conventions) and `report-controls.js` (lazy local PDF export, native print lifecycle, accessible feedback, failure fallback). `investigation-report.js` adapts the three core and ten extended investigations; `osmosis-report.js` includes only observed masses and the student's entered calculations. Reports preserve source labels, partial results, actual estimates/classifications, written answers, and separately labeled exploration. Repeated time-series readings are arranged side by side by treatment. The new print view is generated from current state before printing and restored afterward; its named page/style rules are scoped to these reports. Existing text and CSV exports remain available.

Optional osmosis name/period fields persist under the existing `cell-lab` / development key and version-2 envelope. Valid older saves receive blank identity defaults while retaining their observations. No reset or biological workflow change is required. AUD-02 adds learning-evidence summaries below. AUD-03 and AUD-04 add save confirmations and prediction gates below. Osmosis written reasoning remains tracked under AUD-05.

`tests/student-reports.test.js` checks all fourteen adapters, source fidelity, missing work, safe names, Unicode, long answers, and old-save compatibility. `tests/browser/student-reports.spec.js` exercises offline first PDF export, named completed and draft reports, student-only native printing, responsive controls, long responses, and dependency-load failure. Report acceptance uses fixture attempts in isolated browser contexts; it does not certify classroom understanding or actual device support.

## Learning-evidence reports across existing investigations (AUD-02)

Core, extended, and osmosis reports use a version-2 response snapshot. PDF, native print, legacy text, and JSON share the current recorded responses and data. Human reports group evidence by learning goal and keep the student's written explanations verbatim. Detailed results retain their units, source labels, partial-work status, and model limits. Text exports use the shared renderer. Filenames include a sanitized student name when supplied, and visible export times include a readable local date, time, and time zone.

`report-evidence.js` maps core/extended goals to stable explanation IDs and collected work. `report-feedback.js` records checks that displayed feedback and summarizes actual changes between recorded responses. Mitosis, Sordaria, Punnett, and osmosis handlers record the relevant checks. Identical repeated checks are deduplicated. Reports label missing feedback history unavailable. Stored observations and answers remain usable under the existing save keys. Osmosis reports identify the reasoning still to be collected under AUD-05.

`report-controls.js` provides a separate versioned JSON download for all fourteen shared report pathways. It includes recorded observations, classifications, calculations, answers, feedback checks, and labeled exploration. Extraction's version-2 response document preserves its full checkpoint attempts and preparation data in JSON and the PDF attachment. Its human reports summarize evidence by goal, the actual checkpoint answers, and concepts revisited after feedback. Classroom evidence statuses use the observations and writing collected on that route. Checked answers have explicit correctness, and written reasoning remains available for teacher assessment.

`tests/report-evidence.test.js` checks report fidelity, partial work, meaningful revisions, tolerance-based calculation checks, compatibility with missing history, and classroom extraction evidence. `tests/browser/report-evidence.spec.js` exercises wrong answers, corrections, reload, and structured exports through the normal mitosis, Sordaria, and osmosis interfaces. Existing extraction, shared-report, and Punnett browser tests cover the updated exports. The AUD-02 acceptance record is maintained in [LAB_DESIGN_AUDIT.md](LAB_DESIGN_AUDIT.md).

## Saving and prediction timing (AUD-03 and AUD-04)

`completion-status.js` connects persistence results with nearby accessible completion feedback in the core, extended, extraction, and genetics apps. The save functions return a boolean. A completion attempt writes the requested state, then confirms success or restores the previous completion flag and shows a download alternative. Repeat clicks announce a fresh confirmation. Substantive edits clear completion immediately. Optional identity edits retain academic completion, and optional exploration remains separate. The shared helper retains each app's completion control and status IDs. Storage warnings clear after a successful write. Osmosis and card practice show storage errors alongside ordinary action feedback.

`planning.js` validates prediction and investigation design before core/extended collection or analysis. Navigation controls, transitions, collection handlers, restored stages, and virtual workspace entry points share the requirement. Detailed equipment lessons, procedures, and model interpretations become available after the plan is recorded. The optional Punnett checker also records the plan before showing feedback.

The optional `initialPlan` field stores the first prediction, design, timestamp, and timing provenance. Current writing stays editable. Human reports include the original wording when a revision differs from it, and JSON retains both versions. Students can compare their predictions with the evidence. Earlier attempts retain their observations. Missing required planning opens the planning screen, and existing work with unrecorded prediction timing is labeled accordingly. Existing save keys and scientific model versions continue to restore the recorded data. The shared report snapshot includes planning provenance in PDF, print, text, and JSON.

`tests/planning.test.js` verifies state transitions, retained predictions, reports, and older observations. `tests/browser/save-planning.spec.js` checks all 13 shared pathways, the three virtual workspaces, blocked navigation, optional Punnett feedback, save success/failure/retry, identity and substantive edits, exploration, reload, and export when storage is denied. Existing core, extended, extraction, genetics, and PDF/print tests exercise the updated behavior through normal entry points. Acceptance evidence is recorded in [LAB_DESIGN_AUDIT.md](LAB_DESIGN_AUDIT.md).
