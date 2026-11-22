# Existing lab design audit

Reviewed 2026-11-11 against the [lab design guide](LAB_DESIGN_GUIDE.md). This is an actionable review backlog, not a claim that every lab has passed a classroom or device evaluation.

## Core focus of every review

Every pathway must be reviewed separately for **meaningful interactivity, visual realism, and ninth-grade student language**, alongside its learning goals and reporting requirements. These are core design requirements for existing and future labs.

| Focus | What to check | Evidence to record |
| --- | --- | --- |
| Meaningful interactivity | Students use relevant tools or components, control a process, measure, classify, or make a decision that serves the learning goal. Their actions produce visible changes and useful feedback. | A complete student run showing the main actions and their consequences; check tap/select and keyboard alternatives too. |
| Visual realism | Apparatus, specimens, materials, and motion look convincing and remain scientifically plausible. Important features are visible at the intended scale; schematic simplifications are explained. | Screenshots of important starting, intermediate, and final states on desktop and phone, with specific realism or accuracy corrections listed. |
| Ninth-grade language | Directions, questions, choices, hints, feedback, labels, tooltips, report prompts, and student handouts use short, clear sentences and define new terms in context. | A wording review with terms explained and passages revised; use teacher/student comprehension review and diagnostic reading-level checks where useful. |

Track each focus independently in the pathway checklist below. Completing a functional or report-export task leaves these reviews open until their own evidence is recorded. Student-authored answers must remain verbatim.

## Scope and evidence

The baseline is the **local working tree in `C:\Projects\Science_Labs`**, including the ongoing, uncommitted lab redesigns. It is not a production-release certification or an audit of committed HEAD alone. The documentation commit does not include those implementation changes.

The catalog contains 48 entries: **15 available labs and 33 planned entries**. This audit covers all 15 available labs, the runnable Sordaria extension, and the matter-cycle card activity: **17 runnable pathways**. The 33 planned entries have no implemented student procedure to audit; use the guide when they are built.

Evidence reviewed: catalog and routing, core and extended content/models, shared learning-purpose rules, dedicated extraction and genetic-information implementations, report builders, persistence handlers, existing documentation, and test definitions. The initial audit ran the existing model/report tests and **`npm test` passed 64/64**. Later acceptance results are recorded under each implemented finding. The initial pass did not rerun the full browser/deployment suite or render all handouts. AUD-08/09 now record those software and resource checks; physical mobile-device and classroom reviews remain pending. Prior genetics/extraction UI work informs the guide; tests merely present in the repository are not counted as newly executed validation.

Labels:

- **Confirmed:** the current source directly establishes the gap.
- **Review:** a concrete question requiring a UI run, content review, report rendering, or classroom evidence. It is not yet a proven defect.
- **Scope decision:** establish the intended assessment/reporting role before implementing a change.

Priority **P0** means a required learning/reporting capability should be addressed before treating the lab as meeting the new standard. **P1** covers the next substantive design correction. **P2** covers consistency, polish, and outstanding validation. These priorities do not declare existing labs unusable.

## Shared findings and acceptance checks

### AUD-01 — Completed PDF reports and print views: implemented locally 2026-11-11

**Affected:** osmosis, the three core investigations (yeast, leaf disks, mitosis), and all ten investigations currently using the extended app (including Sordaria, excluding the dedicated extraction route).

- [x] Add a generated, completed-student PDF download to all 14 full investigations in this group. Keep existing useful CSV/text exports as additional formats.
- [x] Add a purpose-built student print view and print control wherever absent. The core three already have a print report; the extended app currently exports a `.txt` report without a dedicated student-report print control/view.
- [x] Add optional name/period to osmosis; preserve the identity fields already present in the core three, extended ten, extraction, and genetic-information labs.
- [x] Verify an incomplete and a completed named attempt, native printing, and the first PDF generated offline after caching.

Evidence: [core app](src/investigations/app.js), `analysis()` and `report`/`print` actions; [extended app](src/investigations/extended-app.js), export controls and `report` action; [osmosis app](src/main.js), results screen. Worksheet and teacher-guide PDFs are blank resources, not the student's completed report. Criteria: G13, G15.

Implementation: [shared response document and renderers](src/investigations/student-report.js), [core/extended report adapters](src/investigations/investigation-report.js), [osmosis report](src/osmosis-report.js), and [PDF/print controls](src/investigations/report-controls.js). Every affected lab offers PDF and print controls from each stage. Legacy text/CSV downloads remain. New reports include safe named filenames, readable local export times, explicit missing-work labels, source labels, and full student responses. Osmosis identity fields migrate into valid older saves without changing their measured data.

Acceptance evidence: `npm test` passed 70/70, including [six report-fidelity and compatibility tests](tests/student-reports.test.js). [Sixteen browser tests](tests/browser/student-reports.spec.js) cover all 14 routes with draft and named completed reports, first-use PDF generation offline, native print handling, mobile width, long answers, and export failure recovery. The export matrix uses restored attempt fixtures; three existing workflow regressions separately passed for osmosis completion/offline/reset, mitosis classification/classroom data, and corn prediction/text export. Forty-four generated/printed PDFs were checked for content fidelity and rendered for layout review. The build verified all 59 offline-cache URLs. Classroom and hardware reviews remain under AUD-09.

### AUD-02 — Reports must communicate learning — implemented locally 2026-11-11

**Affected** core three, extended ten, extraction, and osmosis.

- [x] Organize the extended text reports into readable results, units, sources, and evidence grouped by learning goal. Provide detailed recorded data through a separate structured export.
- [x] Add goal-specific evidence and meaningful correction summaries to the core reports while preserving their existing tables and verbatim written explanations.
- [x] Organize extraction's visible report around learning evidence and concepts revisited after feedback. Preserve preparation records and the full response history in structured data.
- [x] Apply sanitized student-name filenames and readable local export times with time zones to legacy text exports and extraction PDF/JSON exports.
- [x] Preserve actual responses, partial-work status, virtual/classroom labels, and evidence limits. State whether explanations or results are recorded and whether a checked response was correct or revised after feedback. Leave evaluation of written reasoning to the teacher.

Implementation uses a shared version-2 response snapshot for PDF, print, text, and JSON. Learning goals point to stable explanation IDs and actual collected work. Feedback summaries compare recorded responses from checks that displayed feedback, including mitosis classifications, Sordaria classifications, Punnett-square checks, and osmosis calculations. Missing history in earlier attempts is explicitly labeled unavailable. Data and writing remain exportable from those attempts. The original AUD-02 pass identified missing osmosis reasoning. AUD-05 now adds that writing to the shared report formats.

Extraction reports preserve checkpoint prompts, selected answers, explicit correctness, observations, recipes, and student writing. Classroom evidence labels reflect the observations and explanations collected on that route. The PDF retains its structured response attachment. Standalone JSON exports preserve recorded data and feedback for future assessment.

Implementation evidence appears in [goal/evidence adapters](src/investigations/report-evidence.js), [feedback summaries](src/investigations/report-feedback.js), [shared report renderers](src/investigations/student-report.js), [report controls](src/investigations/report-controls.js), [investigation reports](src/investigations/investigation-report.js), [extraction reports](src/investigations/extraction-report.js), and [osmosis reports](src/osmosis-report.js). Criteria G01 and G13–G15 apply.

Acceptance evidence includes **76/76 passing model/report tests**, including [six learning-evidence tests](tests/report-evidence.test.js), and **22/22 passing browser checks** across [the 14-route report matrix](tests/browser/student-reports.spec.js), [extraction reporting](tests/browser/extraction-report.spec.js), [normal feedback-and-correction workflows](tests/browser/report-evidence.spec.js), and [the Punnett workflow](tests/browser/extended.spec.js). The matrix covers draft/completed work, Unicode names, readable time zones, first offline PDF generation, native printing, phone-width controls, long writing, and export failure recovery. Validation checked 48 generated/printed PDFs containing 134 rendered pages, 13 text reports, and 14 structured exports. All rendered pages were visually reviewed. The production build passed and verified 59 offline-cache URLs. AUD-06, AUD-07, and AUD-09 retain the broader interaction, realism, language, classroom, and hardware reviews.

### AUD-03 — Truthful, nearby save confirmation — implemented locally 2026-11-11

**Affected** core three, extended ten, extraction, and the reference genetics lab. The osmosis and matter-cycle card save messages were also reviewed and corrected.

- [x] Return a success result from persistence and show completion confirmation after a successful write.
- [x] Show confirmation beside the completion button in an accessible live region. Repeated clicks announce confirmation again and briefly highlight it when motion is enabled.
- [x] Show a nearby save failure with a report-download alternative. A failed write removes the saved button label and restores the previous completion state.
- [x] Clear completion and its displayed confirmation immediately when substantive work changes. Preserve academic completion when optional identity fields change. Keep optional exploration separate from comparison completion.
- [x] Exercise success, denied storage, repeat clicks, reload, and edit-after-completion across the shared app families and the reference genetics lab.

The [shared completion feedback](src/investigations/completion-status.js) connects the actual write result to the button label and nearby message. It is used by [core](src/investigations/app.js), [extended](src/investigations/extended-app.js), [extraction](src/investigations/extraction-app.js), and [genetics](src/investigations/genetics-app.js) apps. Save warnings remain visible alongside ordinary action feedback and clear after a successful retry. [Osmosis](src/main.js) and the [card activity](src/activities/cycle.js) use separate storage warnings so action messages cannot hide a failed save. Written answers remain available for export when storage is denied.

Acceptance evidence includes the save scenarios in [23 targeted browser tests](tests/browser/save-planning.spec.js), plus the reference lab's [completion and failed repeat-save regression](tests/browser/genetics.spec.js). Checks cover phone-width feedback visibility, keyboard focus, repeated announcements, name and period edits, substantive edits, optional exploration, denied writes from both incomplete and previously completed states, export during failure, recovery, and reload. Core, extended, extraction, and genetics completed workflows also passed. The final validation batch passed **47/47 browser checks**, and `npm test` passed **79/79**. Broader hardware and classroom review remains under AUD-09. Criteria G11, G12, and G16 apply.

### AUD-04 — Predictions before collection and feedback — implemented locally 2026-11-11

**Affected** core three and extended ten. Extraction and genetics retain their dedicated prediction and checkpoint transitions.

- [x] Require a written prediction and investigation design before collection or analysis. Enforce the requirement in stage transitions and action handlers, including direct navigation, restore, and the separate virtual workspaces.
- [x] Identify both responses as required. The optional corn Punnett exercise remains optional. Completion checks the required planning, observations, and existing analysis responses.
- [x] Withhold detailed equipment lessons, procedure steps, model interpretations, and bench results until the first plan is recorded. General planning, materials, safety, and work exports remain accessible. The Punnett checker records the plan before displaying outcome feedback.
- [x] Retain the first recorded prediction and design when the current writing changes. Ask students to compare the prediction with their observations in the analysis. Predictions may be wrong.
- [x] Recheck extraction and genetics prediction/checkpoint gates through their completed workflows and report tests.

The [planning transitions](src/investigations/planning.js) record an optional `initialPlan` snapshot under the existing save keys. [Core](src/investigations/app.js) and [extended](src/investigations/extended-app.js) apps gate navigation and collection, and restore attempts with missing required planning to the planning screen. Existing observations and exports remain usable. Earlier work with unrecorded timing is labeled explicitly. Its prediction is never backdated. The [report evidence adapter](src/investigations/report-evidence.js) includes the first and current writing with timing provenance in PDF, print, text, and JSON.

Acceptance evidence includes [three planning model/report tests](tests/planning.test.js) and [browser checks](tests/browser/save-planning.spec.js) for all 13 shared investigations, bypassed disabled navigation, the three virtual workspaces, prediction revision/reload, earlier observations, and the Punnett feedback gate. Normal completed workflows passed for the core and extended investigations. Existing [extraction checkpoint/report tests](tests/browser/extraction-report.spec.js) and the [genetics workflow](tests/browser/genetics.spec.js) passed. The final **47/47 browser checks** also covered the 14-route PDF/print matrix, long writing, offline first export, and export failure recovery. A separate normal-navigation report check verified the first and revised prediction in PDF, native print, and JSON. Human reports show unchanged planning answers once. Layout review covered the changed planning sections and long answers, with short core model-limit notes kept together with their headings. The build passed and verified 59 offline-cache URLs. Criteria G09 and G10 apply.

### AUD-05 — Osmosis prediction and evidence — implemented locally 2026-11-12

- [x] Require and retain a prediction before beginning a new experiment. Keep the first recorded prediction when the writing changes.
- [x] Collect three explanations connecting inside/outside sugar concentration, signed mass change, net water movement, equal concentrations, controls, and evidence limits.
- [x] Include the actual measurements and verbatim writing in completed PDF, print, and JSON reports. Keep all five conditions.
- [x] Identify supplied observations and measurement variation beside the results and in reports. The water-movement diagram illustrates starting conditions. It does not generate the final masses.
- [x] Compare the configured concentrations with the old worksheet note. A and D have equal inside/outside concentrations. Publish new source-labeled, configuration-aligned worksheets and guides.
- [x] Resolve the A/C–A/D review item through teacher confirmation. The user confirmed that the latest corrections already addressed this issue and accepted the current lab. The current A/D conditions are accepted. This records teacher confirmation of the corrected lab.

Implementation appears in [learning prompts](src/data/osmosis-learning.js), [state and migration](src/state.js), [student interface](src/main.js), [water-movement illustration](src/components/equipment.js), [report adapter](src/osmosis-report.js), and [resource builder](scripts/build-osmosis-resources.py). Equal-concentration drawings show water moving both ways. Larger arrows indicate the inferred net direction for unequal concentrations. Dots represent many particles and carry no measured particle counts.

Earlier measured attempts retain their masses. They can add explanations without inventing a prediction made before the experiment. A prediction entered after results is labeled with its actual timing. New attempts require the prediction before procedure controls become available. Academic completion requires the measurements, correct signed calculations, and all three explanations. Saving reports the actual storage outcome.

Acceptance checks cover the normal complete experiment, wrong subtraction followed by correction, required writing, original prediction retention, older attempts, named exports, save denial/retry/reload, and first offline PDF download. The shared report matrix exercises current PDF, native print, and JSON exports. Targeted regressions are in [model tests](tests/audit-learning.test.js) and [browser checks](tests/browser/audit-learning.spec.js). The teacher accepted the current corrected lab and closed the A/C–A/D review item. The supplied-data provenance remains documented. Criteria G01, G03, G04, G09, and G13 apply.

### AUD-06 — Meaningful interaction and visual realism — software review completed locally 2026-11-12

- [x] Map each pathway's learning goal to a student-controlled action or decision and its visible consequence. The 17-pathway evidence table below records these separately from visual findings.
- [x] Review apparatus work sites, specimen traits, fluid/sample changes, magnification, process stages, and model boundaries.
- [x] Inspect starting, intermediate, and final process states at desktop and phone widths, including the reference genetics pathway.
- [x] Share apparatus coordinates with tool targets, animation tips, and individual gel wells. Preserve alignment through resize and reload.
- [x] Review microscopy, corn, flies, and Sordaria for visible evidence that supports measurement or classification. Keep the students' measurements and tallies.
- [x] Put the extended tool tray directly below the active apparatus. Retain select/place and keyboard alternatives alongside pointer dragging.
- [x] Keep justified samples and controls. Reuse preparation after students have practiced it. New samples retain their own observations.
- [x] Identify schematic scale, coding colors, accelerated time, supplied data, and inference limits next to the relevant work or results.

The [shared geometry](src/investigations/bench-geometry.js) uses the apparatus SVG viewBox. The [placement controller](src/investigations/bench-interaction.js) follows the tool tip and uses the existing state transitions. The [bench](src/investigations/bench.js) and [visuals](src/investigations/extended-visuals.js) add glass, metal, agar, soil, specimen detail, visible loading/spreading, and state-dependent equipment changes. Fixed aspect ratios eliminate overlay drift caused by artwork padding or letterboxing. Gel targets remain individually usable at phone width.

Microscope calibration now requires a calculation using a known line. The calibration slide appears in the eyepiece. After a correct check, the specimen returns for measurement. Eyepiece division spacing stays fixed as the objective changes. At 10× each division represents 8 µm, and at 40× it represents 2 µm. Later cells reuse calibration and require a fresh measurement. Earlier attempts retain their supplied scale. Reports distinguish student-calculated, reused, and earlier supplied calibration. Reference calibration methods use a known stage scale and an objective-specific eyepiece scale. [Idaho State microscopy training](https://www.isu.edu/biology/biolab/instructor-training/technology/microscopes/), [CDC calibration job aid](https://reach.cdc.gov/jobaid/basic-microscopy-ocular-micrometer-calibration)

Specific visual corrections include numeric tubing/port coordinates, plant treatment at the shoot tip, rulers appearing when placed, visible fly cross-record placement, clearer body/wing traits, ordered eight-spore sacs, corn-rack phone overflow, fly tally overlap, plate-label contrast, and eyepiece scale clipping. Card drawings now show bent water, a chlorophyll pigment symbol, and ATP's three phosphate groups. The paper packet explains its supplied chloroplast and battery symbols. The existing atom inventories and balancing requirements remain supported. [OpenStax ATP](https://openstax.org/books/biology-2e/pages/7-1-energy-in-living-systems), [OpenStax photosynthesis](https://openstax.org/books/biology-2e/pages/8-2-the-light-dependent-reactions-of-photosynthesis)

Visual evidence is stored locally under `tmp/aud05-07/`, with one desktop/phone contact sheet for each pathway in `visual-sheets/`. Normal workflow tests independently exercise the actions. Restored fixtures also supply stable states for visual comparison. Fixture screenshots establish layout and visible content. The full workflows establish working transitions. Hardware and classroom evaluation remain under AUD-09. Criteria G05–G07 and G16 apply.

### AUD-07 — Ninth-grade wording and contextual limits — authored-content pass completed locally 2026-11-12

- [x] Review authored core/extended content, shared instructions and feedback, dedicated extraction/genetics concept prompts, card directions, report prompts, and student resources.
- [x] Rewrite lengthy directions into short actions. Explain what students use, where they place or read it, and why the observation matters.
- [ ] Conduct a teacher/student comprehension review. Ask students to restate the next action and explain the science in their own words. No classroom comprehension review was performed in this software pass.
- [x] Preserve student-authored writing verbatim in state and reports.
- [x] Define ET50, interpolation, initial rate, carrier control, allele/genotype/phenotype, recombinant/testcross, chi-square, fluorescence/arbitrary units, selection/induction, base pairs/ladder, ascus/asci, and centromere in context.
- [x] State correctness explicitly with a scientific reason. Extraction checkpoints now say “Correct answer recorded” and use “Correct!” or “Try again.” Mitosis and Sordaria reviews identify correct classifications and the visible chromosome/spore basis. Manual corn/fly tally checks explain exactly what was checked.
- [x] Show essential interpretation limits beside collection/results while keeping detailed references available.
- [x] Review and regenerate the affected worksheet/guide PDFs. Add an osmosis worksheet and guide using the shared questions and configured conditions.

Examples include explaining ET50 as the time when half the leaf disks float, initial rate using the first 30 seconds, a carrier as the treatment liquid without the signal, recombinants as new combinations of the parents' alleles, and chi-square as a measure of the gap between observed and expected counts. Extraction now explains salt as helping nucleic acids clump together. Essential notes explain indirect gas/fluorescence evidence, limited samples, curated fields, and the differences between a gene-to-centromere estimate and gene order.

The diagnostic in `tmp/aud05-07/language-diagnostics.json` examines shared authored content, learning-purpose notes, extraction steps/checkpoints, and genetics concept prompts across all 17 pathways. Mean sentence lengths range from 7.3 to 9.6 words, with no sentence above 30 words in that corpus. The diagnostic does not cover every dynamically assembled sentence and does not establish a reading grade. Contextual term review and actual teacher/student comprehension remain important.

Resource review rendered all 38 public PDFs, totaling 157 pages. Visual sheets and text/margin checks are under `tmp/aud05-07/pdf-review/`. Checked line wrapping, response space, tables, headings, supplied paper-card notes, and page boundaries. Technical teacher protocols remain available in teacher guides. Student-facing classroom steps use the revised wording. Criteria G03, G04, and G08–G10 apply. AUD-07 remains open for its teacher/student acceptance check.

### AUD-08 — Resource and documentation consistency — implemented locally 2026-11-12

- [x] Correct the genetics version description in [ARCHITECTURE.md](ARCHITECTURE.md). Reports use schema 2 and activity revision 2. Saved attempts still use storage version 1 and the existing key.
- [x] Compare all 39 downloadable public worksheets and guides with the current sample counts, controls, terms, assessment prompts, and report instructions. Regenerate them, render all 153 pages, and visually inspect tables, response spaces, headings, and page boundaries.
- [x] Document the historic stable IDs: `dna-replication` is fruit extraction, `dna-protein` is the cell-free reporter comparison, and `lac-operon` is the arabinose-controlled reporter. Preserve URLs, save keys, and resource names.
- [x] Add a separate two-page [genetic-information teacher guide](public/resources/genetic-information-teacher-guide.pdf), linked from its catalog overview and lab reference panel. Include the learning evidence, molecular actions, current checks and explanation prompts, model limits, and completed report instructions.

Core and extended resource generators now read the live lab definitions directly. Extraction reads its shared checkpoint and explanation prompts; the new genetics guide reads its model and report versions. All worksheets explain how to keep the completed student PDF or print view, with optional name/period and honest unfinished status. Teacher guides explain the evidence to review. Detailed physical classroom sheets remain with the report when their collector units or time series differ from the online form.

The two legacy fermentation overview URLs now explain the three current classroom methods and link students back to the matching method packets in the app. The six method-specific handouts retain the current stock recipe, observation schedule, independent-mixture counts, and actual collector units. The osmosis resources retain the teacher-confirmed A/D conditions and supplied observations.

**Practice scope decision:** retain matter-cycle cards as optional practice and discussion, with their separate saved placements and paper response page. The app and companion handouts identify that role. This decision does not introduce a separately assigned full lab. G13 applies if that role changes.

[Resource verification](scripts/verify-resources.py) checks the current worksheet questions, analysis prompts, learning-purpose notes, condition names, dedicated prompts, classroom recipes, catalog PDF downloads, and inventory hashes. It passes for all 39 PDFs. All 46 inventoried assets match their files. The final production build verifies 62 offline-cache URLs. The new guide is available after caching, including during the first offline report workflow. Resource bytes participate in cache versioning so a handout-only revision updates the offline copy.

Criteria: G03, G08, G12–G15. Local evidence: `tmp/aud08-09/resource-review/`, including `checks.json` and rendered review sheets.

### AUD-09 — Cross-app validation — software checks complete; human acceptance pending

- [x] Run complete, partial, and corrected attempts across the core, extended, extraction, genetics, and osmosis app families, with all lab-specific browser regressions. Include the optional card practice pathway and earlier saved attempts.
- [x] Check short and long PDF/print exports, Unicode names, units, tables, local date/time zones, missing glyphs, clipping, and blank trailing pages. Render and visually inspect 52 generated/printed reports across 144 pages. Compare complete PDF/print content with all 14 shared structured-response exports.
- [x] Retain separate local interaction, visual, and authored-language evidence for all 17 pathways under AUD-06/07. This records software and wording review; student comprehension remains below.
- [x] Exercise mouse dragging, browser touch-event sequences followed by taps, select/place, keyboard/focus, reduced motion, resize/reload, and phone/tablet/desktop layouts. Touch emulation is identified separately from physical device validation.
- [x] Recheck cached offline routes and resources, first offline PDF generation, root/development separation, failed storage/recovery, and preservation of earlier attempts.
- [ ] Complete teacher/student comprehension and explanation review, then record physical Safari/iPad and Android results. No student participants, physical iPad, or Android device were available in this workspace. This acceptance item remains open; AUD-09 is not fully closed.

### AUD-09 validation evidence — 2026-11-12

| Check | Actual result and scope |
| --- | --- |
| Models, state, and reports | `npm test`: **84/84 passed**. Includes scientific calculations, source labels, evidence summaries, planning provenance, corrected checks, legacy attempts, and report snapshots. |
| Full installed Edge run | **136/137 passed initially**. The remaining six-PDF/offline navigation test timed out waiting for service-worker control; its isolated rerun against the final build passed **1/1**. Every test passed across these runs; the initial timeout is retained in the log. |
| Final Chromium cross-check | **33/33 passed** against the final build: genetics, extraction touch, the 16-check osmosis/bench interaction set, and core investigation workflows. Includes offline fetching of the new teacher guide. |
| Deployment assembly | **3/3 passed** using actual local `origin/main` revision `6a816aeee2f5089ca65c04534487baf7731cb656` for production and the current working tree for `/dev/`. Confirms separate attempts/cache scopes, preview offline reloads, and preview PDF generation without altering production work. |
| Completed work and printing | 42 draft/complete/print outputs for the 14 shared pathways, two shared long-answer outputs, three genetics outputs, four extraction outputs, and one normal-workflow osmosis report: **52 PDFs, 144 rendered pages**. All 28 complete PDF/print documents retain their structured sections, responses, table cells, units, identity, and status. Long-answer end markers survive; Unicode names, Greek symbols, °C, and PST render correctly. |
| Interaction and access | Full regressions cover meaningful placements and visible process changes, wrong placement/correction, moving enzyme targets, touch drag/release/tap, keyboard focus, reduced motion, and 390/768/1440-pixel views. Specific bench regressions cover desktop and phone alignment. These checks do not certify mobile hardware. |
| Resource parity and build | **39 public PDFs / 153 rendered pages**, current-source parity checks, **46 asset hashes**, and **62 offline-cache URLs** pass. The new genetics guide is fetched offline in its completed workflow. |

Logs, response exports, generated reports, screenshots, and rendered review sheets remain locally under `tmp/aud08-09/`, `tmp/aud02/`, `tmp/genetics-review/`, `tmp/dna-learning-revision/`, and `tmp/aud05-07/`. Software checks exercise the original controls and justified sampling. They do not establish classroom learning gains or validate physical protocols.

### Remaining human acceptance record

Use the existing 17-pathway checklist to record comprehension by pathway. A teacher should review each lab's question, controls, explanation evidence, graphics, and model limits. Have ninth-grade students restate the next action before acting, explain why the manipulation matters, make and correct an error, and explain their completed report in their own words. Record the exact confusing wording or graphic, the observed response, and any correction needed. Avoid marking comprehension passed from a reading diagnostic alone.

On physical iPad/Safari and Android/Chrome, repeat drag/release/tap and select/place at the main work sites, scroll and resize/rotate, check focus with an available keyboard, enable reduced motion, restore partial work, and download/print a named report. After initial caching, reload offline and generate the first PDF. Record the actual OS/browser versions and outcome for each device.

| Acceptance | Participants or device/version | Date | Result |
| --- | --- | --- | --- |
| Teacher content/explanation review across pathways | Pending | Pending | Open |
| Ninth-grade student comprehension across pathways | Pending | Pending | Open |
| Physical iPad / Safari | Pending | Pending | Open |
| Physical Android / Chrome | Pending | Pending | Open |

Criteria: G12, G15–G17. The previously recorded teacher confirmation of the corrected osmosis conditions remains accepted and does not need to be repeated.

## Lab-by-lab baseline review list

The questions below record the original review scope. AUD-05–07 software/content outcomes are recorded above and in the current evidence table below. The current osmosis conditions were accepted by the teacher. Classroom comprehension and hardware work retain their pending checks.

The required work below reflects the streamlining already implemented locally. Keep these decisions unless a new learning objective justifies a change. “Shared fixes” refer to the findings above; they are not additional repetitions to add.

| Pathway / stable ID | Keep and teach | Next review or correction | Priority |
| --- | --- | --- | --- |
| **Osmosis and Cell Homeostasis** / `osmosis-homeostasis` | Five conditions; zero and nonzero equal-concentration contrasts; signed mass change and water movement. | **Implemented:** PDF/print, optional identity, learning-evidence reports, and truthful save warnings (AUD-01–03). **Implemented:** AUD-05 prediction, recorded explanations, source-labeled worksheet, and learning-evidence reports. **Accepted by the teacher:** the current corrected concentrations and wording. The lab explains % w/v, the volume approximation, and supplied mass evidence. | P0 |
| **Cells Under the Microscope** / `cell-microscopy` | Two cells from each of three specimens; six student measurements; reuse calibrated setup after the first. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** ruler/scale alignment after objective changes; calibration versus magnification; what structures these schematics allow students to resolve; whether two selected cells support only a limited tissue claim. | P1 |
| **What Changes Enzyme Activity?** / `enzyme-activity` | One reaction at each of three temperatures; time series and initial rates; optional independent repeats. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** ask students to use the first 30 seconds, retain units, distinguish gas-collection faults from enzyme activity, and avoid claiming an optimum or denaturation from this modeled range. Review visible pipette/port/syringe actions. | P1 |
| **Yeast Fermentation and Fuel Sources** / `yeast-fermentation` | Three fresh mixtures per fuel, nine trials; compare rates, overlap, lag, and control; matched-preparation shortcut. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** preserve trial variation and early/late rate comparisons; explain why gas is indirect evidence; distinguish virtual and classroom recipes, time schedules, and collector units. Test shortcut with fresh observations. | P1 |
| **Light and Photosynthesis** / `light-photosynthesis` | Three cups per light level, nine trials; ten disks per cup; independent-cup variation and ET50; matched preparation. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** define ET50 and interpolation; retain “not reached” instead of zero; connect net gas accumulation with buoyancy and continued respiration; confirm syringe/cup/lamp interactions and independent-cup wording. | P1 |
| **How Plants Respond to Signals** / `cell-signaling` | One control and one treated plant; growth from starting height; daily repeated measures. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** explain carrier control and treatment response; distinguish whole-plant evidence from a receptor mechanism; label illustrative dose/time choices; keep independent-plant replication optional when reliability is the question. | P1 |
| **Measuring Mitosis** / `mitosis` | Two non-overlapping fields of 20 cells; all 40 classifications; compare fields before pooling; reuse settings. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** chromosome cues for adjacent stages; interphase versus mitosis; curated field proportions and possible zero counts; assumed cycle duration versus measured stage time. A third field is not automatically required. | P1 |
| **How Crossing Over Creates New Allele Combinations** / `meiosis-variation` | One egg and one sperm pathway; track exchanged DNA, separation, and different cell products. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** homologs begin within one precursor nucleus; distinguish homologs/sisters and egg/polar bodies; show the modeled sperm-entry signal accurately; explain simplified timing and omitted independent assortment. Review each placement for evidence beyond following highlights. | P1 |
| **Testing Inheritance Patterns** / `inheritance-ratios` | Three ears, 48 kernels per region; student tallies; per-ear versus pooled proportions and a documented 3:1 model. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** sampling-region visibility, phenotype clarity and tally feedback; ninth-grade explanation of chi-square; avoid treating a discrepancy statistic as a p-value, automatic disproof, or a universal corn-genetics rule. | P1 |
| **Mapping Linked Genes** / `linked-genes` | Three samples of 32 offspring; all trait counts; per-sample and pooled recombination; reuse preparation. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** fly traits at small sizes; parental/recombinant definitions and cross record; why parent sex matters in this example; limits of two-point mapping. Do not claim three-gene order from two markers. | P1 |
| **Extracting DNA from Fruit** / `dna-replication` | One hands-on extraction plus two matched model-prepared controls; release/separation/precipitation; evidence limits. | **Implemented:** learning-evidence reports, named exports, and truthful inline save confirmations (AUD-02/03), with completed PDF/print. **Review:** AUD-07 wording/status; check targets and fruit/masher/filter/alcohol actions on touch; retain some material without detergent; label crude visible material and model-prepared controls. Do not reintroduce three duplicate extractions. | P1 |
| **From DNA to Protein** / `dna-protein` | Three distinct reporter comparisons: DNA, no DNA, and translation blocked; retain time series. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** link controls to the conclusion without claiming fluorescence directly measures mRNA; explain arbitrary units; preserve numeric-versus-ordinal source distinctions. Keep its experimental purpose distinct from the molecular information-flow lab. | P1 |
| **Switching Gene Expression On and Off** / `lac-operon` | Four distinct plates; one spreading action per manually prepared plate; inspect growth and fluorescence separately. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** selection versus induction, plate labels, simulated incubation, and prepared-cell assumptions. Teach the actual arabinose-regulated reporter; do not imply this is a lac-operon mechanism because of its historic ID. | P1 |
| **Separating DNA Fragments** / `gel-electrophoresis` | One gel, four lanes; ladder, two references, unknown; staining/calibration and three unknown-band estimates. | **Implemented:** completed reports, save confirmations, and required predictions/design (AUD-01–04). **Review:** per-lane pipette targets, polarity/migration, stain/view action, ladder-based size reasoning and uncertainty. Matching patterns alone should not establish personal identity. A second identical gel remains optional. | P1 |
| **DNA to RNA to Protein — virtual only** / `genetic-information` | Short complementary DNA windows, first RNA codon, processing/export, three amino acids and stop; spatial enzyme placement and action. | **Reference features present:** moving targets, shuffled tRNAs, stop-codon label, explicit correctness, evidence-oriented PDF/print, named files, readable time, shared save confirmation with failure/retry handling (AUD-03). **Review:** both template directions and later-stage sites after resize/reload; simplification note placement; classroom comprehension; real-device access and long reports. Keep regression checks for replication not being required for every transcription. AUD-08 is resolved. AUD-09 software evidence is recorded; classroom comprehension and physical mobile-device acceptance remain open. | P2 |
| **Sordaria extension** / `sordaria-crossing-over` | Two non-overlapping fields of 12 asci; classify all 24; field estimates before pooling. | **Implemented:** completed reports, save confirmations, and required predictions/design through the extended app (AUD-01–04). **Review:** ordered-spore pattern visibility; explain second-division patterns and why the percentage is halved; distinguish gene-to-centromere mapping from gene order and same-slide fields from independent crosses. | P1 |
| **Photosynthesis/respiration matter-cycle cards** / `activity.html` | Repeated molecule copies represent coefficients and atom conservation; keep required copies and directional/energy annotations. | **Implemented:** truthful save-failure feedback (AUD-03). **Scope resolved (AUD-08):** retain optional practice/discussion, separate saved placements, and a paper response page. Apply G13 if promoted to a separately assigned full lab. **Review:** keyboard/touch placement, balancing feedback, energy versus matter, and the note that overall equations do not show one process simply running backward. | P1 decision; P2 review |

## Interaction, realism, and language checklist for every pathway

Checked columns record the local software interaction, visual, and authored-wording reviews under AUD-06/07. Teacher/student comprehension and physical device validation retain their open checks above and under AUD-09. Teacher confirmation resolves the osmosis concentration wording review.

| Lab / pathway | Interactivity reviewed | Visual realism reviewed | Ninth-grade language reviewed |
| --- | --- | --- | --- |
| Osmosis and Cell Homeostasis / `osmosis-homeostasis` | [x] | [x] | [x] |
| Cells Under the Microscope / `cell-microscopy` | [x] | [x] | [x] |
| What Changes Enzyme Activity? / `enzyme-activity` | [x] | [x] | [x] |
| Yeast Fermentation and Fuel Sources / `yeast-fermentation` | [x] | [x] | [x] |
| Light and Photosynthesis / `light-photosynthesis` | [x] | [x] | [x] |
| How Plants Respond to Signals / `cell-signaling` | [x] | [x] | [x] |
| Measuring Mitosis / `mitosis` | [x] | [x] | [x] |
| How Crossing Over Creates New Allele Combinations / `meiosis-variation` | [x] | [x] | [x] |
| Testing Inheritance Patterns / `inheritance-ratios` | [x] | [x] | [x] |
| Mapping Linked Genes / `linked-genes` | [x] | [x] | [x] |
| Extracting DNA from Fruit / `dna-replication` | [x] | [x] | [x] |
| From DNA to Protein / `dna-protein` | [x] | [x] | [x] |
| Switching Gene Expression On and Off / `lac-operon` | [x] | [x] | [x] |
| Separating DNA Fragments / `gel-electrophoresis` | [x] | [x] | [x] |
| DNA to RNA to Protein — virtual only / `genetic-information` | [x] | [x] | [x] |
| Sordaria extension / `sordaria-crossing-over` | [x] | [x] | [x] |
| Photosynthesis/respiration matter-cycle cards / `activity.html` | [x] | [x] | [x] |

### Current pathway evidence

| Pathway | Student action and visible consequence | Visual and wording review outcome |
| --- | --- | --- |
| Osmosis | Predict, prepare five environments, place tubes, measure, calculate signed changes, inspect water movement, and explain the evidence. | Added two-way flow model and three saved explanations. Defined net movement, isotonic, % w/v, and supplied-data limits. A/D matches the current configuration. |
| Cell microscopy | Place slide/light/calibration equipment, calculate the known scale, adjust focus/objective, and measure six selected cells. | Fixed scale spacing, limits, and chloroplast placement. Show calibration slide before restoring the specimen. Define objective, calibration, resolution, and µm. |
| Enzyme activity | Place extract, tube, and peroxide, then compare gas readings and starting rates at three temperatures. | Ports and syringe inlet align with tool tips. Stopper/tubing appear after connection. Explain initial rate and the limits of one reaction per temperature. |
| Yeast fermentation | Prepare/connect the first flask, select each fuel, reuse matched preparation, and observe nine fresh mixtures. | Reviewed liquid, tubing, movable syringe, and time-series states. Explain indirect gas evidence, controls, ATP/NAD+, lag, and classroom units. |
| Leaf photosynthesis | Pull/release the syringe, move prepared disks, choose assigned light, observe nine cups, and compare ET50. | Reviewed infiltration, lamp, disk placement/flotation, and unreached results. Define ET50 and estimating between readings. |
| Plant signaling | Place seedling, measure starting height, apply assigned liquid at the shoot, and follow growth. | Added material depth and state-dependent ruler. Explain carrier control, repeated readings of one plant, and limits on receptor claims. |
| Mitosis | Load/focus, inspect chromosome features, classify 40 cells in two fields, review and compare field counts. | Reviewed field-map agreement, stage drawings, and enlarged cells. Define chromatin and scoring rules. Explicit correct feedback explains the chromosome basis. |
| Meiosis | Pair homologs in one nucleus, choose chromatids/crossover, separate homologs, place final products, and compare egg/sperm pathways. | Reviewed cell boundaries, exchanged segments, one egg/polar bodies, and four sperm. Explain homologs, sister chromatids, simplified timing, and the sperm-entry signal. |
| Corn inheritance | Choose an ear/region, inspect 48 kernels, tally both phenotypes, and compare three ears with pooled counts. | Reviewed visible purple/yellow traits and region boundaries. Fixed initial rack overflow. Define allele, genotype, phenotype, chance variation, and chi-square. |
| Linked genes | Place/read cross record, load/focus sample, inspect body and wings, mark/tally 32 flies per sample, and compare percentages. | Added recognizable flies with distinct body/wing traits and a magnifier. Removed tally overlap. Define parental/recombinant and the two-marker mapping limit. |
| Fruit extraction | Place fruit, mash, add ingredients, answer required checkpoints, filter, layer alcohol, score three distinct conditions, and explain. | Reviewed material transfer, interface, and control comparisons. Retain some visible material without detergent. Explicit correctness and plain explanations of release, separate, precipitate, and clumping. |
| Reporter DNA/protein | Place cell-free mixture/template, incubate three distinct control reactions, use the viewer, and compare recorded signals. | Reviewed empty/filled/viewed tube states. Define translation, inhibitor, fluorescence, and arbitrary units. Explain that RNA requires its own measurement. |
| Arabinose reporter | Label, add prepared cells, spread each plate once, incubate four conditions, and inspect growth/fluorescence separately. | Added label, droplet, spreading, agar material, and readable viewer label. Explain selection/induction and supplied-cell assumptions. |
| Gel electrophoresis | Cast/buffer, load four actual wells, connect polarity, run/stain, and estimate three unknown bands from the ladder. | Shared well geometry and 44-pixel targets. Reviewed migration, stain visibility, scale, and reference patterns. Define bp, ladder, and curved size scale. |
| Genetic information | Place enzymes/nucleotides/RNA/tRNAs at moving sites, observe each process, check concepts, and explain locations/products. | Reviewed reference replication, RNA processing/export, translation, and report states. Full workflow retains shuffled tRNAs, stop-codon choices, explicit correctness, and replication simplification notes. |
| Sordaria | Prepare two fields, classify 24 ordered eight-spore sacs, review, and compare field estimates before pooling. | Added detailed spores with readable ordering. Define ascus/asci and centromere. Explain half the second-division percentage and shared-cross sampling. |
| Matter-cycle cards | Move all required molecule copies/symbols, check atom counts, and revise unbalanced equations. | Corrected water/pigment/ATP drawings and explained symbols. Reviewed keyboard/select placement, conservation, and energy-transfer wording. AUD-08 retains its optional practice/discussion role. Human/device acceptance remains under AUD-09. |

### Local validation record

`npm test` passed **84/84**. A complete browser run passed **137/137**, including the new 16-check osmosis/bench interaction set. After visual inspection, additional corrections refined eyepiece clipping, placed plant rulers, fly counter layout, and post-review directions. The final affected-workflow and 14-route PDF/print batch passed **45/45**. Seven generated/printed osmosis and microscopy reports were rendered and visually checked across 16 pages, including verbatim explanations, honest prediction timing, and calibration provenance. The final build verifies **61 offline-cache URLs**. Logs, rendered resources, generated reports, and screenshots are retained locally in `tmp/aud05-07*` and the report-test output directories.

The automated checks include mouse dragging, Chromium touch sequences, select/place, keyboard, calibration error/correction, reload, legacy attempts, required writing, source fidelity, storage denial/retry, named exports, long writing, native print, and first offline PDF generation. Teacher/student comprehension, Safari/iPad, Android hardware, and physical classroom protocols remain pending. The teacher accepted the current corrected osmosis lab. These checks cover the local implementation.

## Recommended implementation order

1. **Shared report foundation** AUD-01, AUD-02, and the AUD-05 osmosis writing/report implementation are complete locally. The teacher accepted the current corrected osmosis conditions and closed that wording review. Preserve each lab's evidence types, verbatim writing, learning-evidence summaries, and completed PDF/print support.
2. **Save and prediction contracts** AUD-03 and AUD-04 are implemented locally. Keep the save failure, edit, reload, and planning-transition checks as regressions when revising a pathway.
3. **Teaching and presentation acceptance** AUD-06 software review and the AUD-07 authored-content pass are recorded for all 17 pathways. Complete the teacher/student comprehension check and retain these regressions for future revisions.
4. **Consistency and acceptance:** AUD-08 resource/documentation work and the card practice scope decision are complete locally. AUD-09 software evidence is recorded above. Complete the remaining teacher/student and physical mobile-device acceptance before fully closing AUD-09.

Close a finding only when its acceptance checks have evidence. Record the affected lab IDs, what changed, tests actually run, rendered report checks where relevant, and remaining classroom/device review. A software pass does not automatically close scientific or reading-level questions.

## Development publication check — 2026-11-12

Reviewed the updated checkout at `C:\Projects\Science_Labs` for publication to `codex/development`. The production build and 79 unit/model/report tests passed. The full Edge/Playwright browser run passed 120 of 121 checks; the remaining legacy lamp test assumed collection could begin without the newly required plan. Updated that test to enter planning in each separate workspace, preserving its classroom-data assertions; its focused rerun passed.

All three deployment checks passed against an assembly of the actual `origin/main` production build and the updated development build. Corrected the new genetics deployment test, which had assumed the development-only genetics route already existed in production. It now checks preview offline PDF generation and preservation of the existing production osmosis attempt. All 43 inventoried asset hashes matched, and the runtime dependency audit reported zero vulnerabilities. The two new DNA landing pages were inspected visually. These publication checks do not close the broader classroom, hardware, language, or scientific review items above.


<a id="aud-10"></a>

### AUD-10 — App language selection and translated printing — planned 2026-11-14

**Status:** agreed future requirement; implementation and language acceptance remain open. This documentation update does not add translated app content or PDFs and does not reopen or relabel completed English-language findings.

**Affected:** the shared site, all full labs and assessed practice pathways, printable worksheets/collector sheets, teaching resources, completed reports, and private teaching copies. Criteria: G08, G13–G18.

- [ ] Inventory translatable UI/content, diagram labels, accessible names, questions, feedback, errors, report prompts, and printable resources. Separate app-language readiness from publisher/source-edition language metadata.
- [ ] Add a native selector and reviewed language content, using Spanish as the first complete acceptance example and allowing other published languages.
- [ ] Verify that guests and free accounts can choose the available language of a free lab without sign-in or starting a trial. Preserve course/unit/lab publication and private-content access rules.
- [ ] Switch language in a saved partial and completed attempt without resetting data, progress, choice order, feedback history, or completion. Preserve original student writing and stable IDs.
- [ ] Print/download Spanish worksheets and student materials from an English teacher interface. Validate selected-language completed PDFs and native print views, including identity, data, prompts, long writing, fonts, and page layout.
- [ ] Record language and translation/release versions in report/submission evidence. Keep the original prompts and student responses; identify any later translated copy explicitly.
- [ ] Review scientific equivalence, reading level, missing-translation behavior, accessible controls, responsive layout, and applicable offline/PDF behavior with qualified language/content reviewers and representative users/devices.

**Acceptance evidence:** pending. Source-language availability, software scaffolding, and machine-generated wording must not be counted as reviewed app/handout translation or course completion. See [G18](LAB_DESIGN_GUIDE.md#g18) and the future localization contract in ARCHITECTURE.md.
