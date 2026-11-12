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

Evidence reviewed: catalog and routing, core and extended content/models, shared learning-purpose rules, dedicated extraction and genetic-information implementations, report builders, persistence handlers, existing documentation, and test definitions. The initial audit ran the existing model/report tests and **`npm test` passed 64/64**. Later acceptance results are recorded under each implemented finding. This pass did not rerun the full browser/deployment suite, render all existing handouts, or test every lab on hardware. Prior genetics/extraction UI work informs the guide; tests merely present in the repository are not counted as newly executed validation.

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

Implementation uses a shared version-2 response snapshot for PDF, print, text, and JSON. Learning goals point to stable explanation IDs and actual collected work. Feedback summaries compare recorded responses from checks that displayed feedback, including mitosis classifications, Sordaria classifications, Punnett-square checks, and osmosis calculations. Missing history in earlier attempts is explicitly labeled unavailable. Data and writing remain exportable from those attempts. Osmosis reports identify the written reasoning still pending under AUD-05.

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

### AUD-05 — Osmosis collects procedure/calculation evidence, but no written reasoning: P0, confirmed

- [ ] Add a recorded prediction before the experiment and student explanations after the results.
- [ ] Capture evidence that students connect concentration differences, water movement, and signed mass change. Current end-screen explanation/questions are displayed text without student-response fields.
- [ ] Connect those responses and actual measurements to the completed report in AUD-01. Keep five concentration conditions.
- [ ] Retain the distinction between supplied observations and calculated predictions. Review the original worksheet's A/C wording against the configured A/D isotonic cases before redistributing resources.

Evidence: [osmosis app](src/main.js), seven `content()` stages and calculation handler; [configuration](src/data/labConfig.js); [README](README.md), “Experimental values — teacher review required.” The existing source explicitly documents the A/C versus A/D discrepancy; this audit does not independently verify the original dataset. Criteria: G01, G03, G04, G09, G13.

### AUD-06 — Meaningful interactivity and visual realism: P1, review

**Affected:** every pathway, with emphasis on the shared extended bench.

- [ ] Map the main learning goals to student-controlled actions or decisions and their visible consequences. Identify passive stretches that need meaningful interaction.
- [ ] Inspect each step: does the student use a relevant object at its actual work site, and does the visible change explain its role?
- [ ] Review visual realism explicitly: recognizable equipment/specimens, plausible shape and proportions, material appearance, fluid/sample changes, depth, lighting, texture, and process motion where appropriate.
- [ ] Check important starting, intermediate, and final states against the science. State the purpose of schematic scale, coding colors, or simplified motion.
- [ ] Check overlays against artwork during every state, resize, and reload. Extended bench sites use percentage positions; review their alignment instead of assuming the genetics geometry fix applies to them.
- [ ] Inspect microscopy, corn, flies, and Sordaria for visible evidence sufficient to make a classification or measurement without relying on an answer cue.
- [ ] Keep choices and the active work site close together; remove duplicate diagrams or highlights only where they add no learning.
- [ ] Improve schematic depth and motion where it helps understanding. Counting, calibrating, interpreting graphs, and comparing samples remain valid interactions; enzyme-style dragging is not required in every lab.

Acceptance evidence: record a complete interaction review, desktop/phone screenshots of the key process states, the specific visual improvements needed, and the checks used to verify that graphics and actions agree. Review interactivity and realism separately for every pathway, including the reference genetics lab.

Evidence: [bench](src/investigations/bench.js), [extended visuals](src/investigations/extended-visuals.js), dedicated simulator/art files, and [shared genetics geometry](src/investigations/genetics-geometry.js). Criteria: G05–G07, G16.

### AUD-07 — Ninth-grade student language, feedback, and contextual limitations: P1, review

- [ ] Review every authored student-facing direction, question, answer choice, hint, feedback message, label, tooltip, report prompt, and student handout for ninth-grade comprehension.
- [ ] Use short, concrete sentences, clear action words, and instructions that explain what to do, where, and why. Record passages that need rewriting.
- [ ] Check that a student can restate the next action and the scientific meaning in their own words. Reading-level scores are diagnostic; teacher/student review supplies comprehension evidence.
- [ ] Preserve students' own responses verbatim when revising the language supplied by the lab.
- [ ] Define new terms at use: e.g. ET50, initial rate, carrier control, recombinant, chi-square, induction, fluorescence, and gene-to-centromere distance.
- [ ] Make correct answers explicit and explain their scientific basis; preserve student observations when they differ from the model.
- [ ] Move any essential interpretation limit out of a collapsed reference panel and next to the relevant process/result. Keep the detailed references too.
- [ ] For extraction specifically, review the remaining “Checkpoint answered” / “Checkpoint passed” labels against the explicit correctness standard. The required gate and explanatory feedback already exist.

Acceptance evidence: retain the wording review, examples of revised passages and definitions, any diagnostic reading-level results, and the teacher/student comprehension review performed. Mark unperformed reviews as pending.

Evidence: [core content](src/investigations/content.js), [extended content](src/investigations/extended-content.js), and [extraction checkpoint/report labels](src/investigations/extraction-report.js). Text difficulty across the older labs has not been formally measured or classroom-tested in this audit. Criteria: G03, G04, G08–G10.

### AUD-08 — Resource and documentation consistency: P2, confirmed issue plus review

- [ ] Resolve the contradictory genetics report-version wording at the end of [ARCHITECTURE.md](ARCHITECTURE.md): it describes schema 2 and then says the response schema is unchanged. Align it with the implemented report schema and activity version.
- [ ] Compare every downloadable worksheet and teacher guide with the current sample counts, controls, terms, assessment prompts, and report instructions. Their presence does not prove current content parity; this audit did not render every handout.
- [ ] Document the historic stable IDs: `dna-replication` launches fruit extraction, `dna-protein` is the reporter comparison, and `lac-operon` launches an arabinose-regulated reporter activity. Current displayed titles/limits clarify these activities. Preserve route/save compatibility when improving metadata.
- [ ] Decide whether the virtual-only genetic-information lab also needs a separate teacher guide. Its catalog currently has no static resources; its completed-student PDF is already available.

Criteria: G03, G08, G12–G15.

### AUD-09 — Validate the revised standard across apps and devices: P2, review

- [ ] After shared fixes, run representative complete/partial/corrected attempts for every app family, followed by all affected lab-specific checks below.
- [ ] Check short and long PDF/print exports, Unicode names, units, tables, readable times, and absence of clipping or blank trailing pages.
- [ ] Verify meaningful interaction, visual realism, and ninth-grade wording independently, using the pathway checklist and AUD-06/07 acceptance evidence.
- [ ] Check mouse, actual touch sequences, select-then-place, keyboard, focus, reduced motion, and phone/tablet/desktop layouts.
- [ ] Recheck cached offline use, first offline PDF, root/development separation, and preservation of earlier attempts.
- [ ] Arrange teacher/student review of explanation quality and reading level; record actual Safari/iPad and Android results separately from Chromium emulation.

Existing tests under `tests/`, `tests/browser/`, and `tests/deployment/` are useful starting points. The passing automated checks leave these broader reviews pending until their own evidence is recorded. Criteria: G12, G15–G17.

## Lab-by-lab review list

The required work below reflects the streamlining already implemented locally. Keep these decisions unless a new learning objective justifies a change. “Shared fixes” refer to the findings above; they are not additional repetitions to add.

| Pathway / stable ID | Keep and teach | Next review or correction | Priority |
| --- | --- | --- | --- |
| **Osmosis and Cell Homeostasis** / `osmosis-homeostasis` | Five conditions; zero and nonzero equal-concentration contrasts; signed mass change and water movement. | **Implemented:** PDF/print, optional identity, learning-evidence reports, and truthful save warnings (AUD-01–03). **Remaining:** AUD-05; add prediction and recorded explanations. **Review:** supplied dataset/worksheet A–D agreement; explain % w/v and the volume approximation clearly; distinguish mass evidence from inferred movement. | P0 |
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
| **DNA to RNA to Protein — virtual only** / `genetic-information` | Short complementary DNA windows, first RNA codon, processing/export, three amino acids and stop; spatial enzyme placement and action. | **Reference features present:** moving targets, shuffled tRNAs, stop-codon label, explicit correctness, evidence-oriented PDF/print, named files, readable time, shared save confirmation with failure/retry handling (AUD-03). **Review:** both template directions and later-stage sites after resize/reload; simplification note placement; classroom comprehension; real-device access and long reports. Keep regression checks for replication not being required for every transcription. AUD-08, 09 remain open. | P2 |
| **Sordaria extension** / `sordaria-crossing-over` | Two non-overlapping fields of 12 asci; classify all 24; field estimates before pooling. | **Implemented:** completed reports, save confirmations, and required predictions/design through the extended app (AUD-01–04). **Review:** ordered-spore pattern visibility; explain second-division patterns and why the percentage is halved; distinguish gene-to-centromere mapping from gene order and same-slide fields from independent crosses. | P1 |
| **Photosynthesis/respiration matter-cycle cards** / `activity.html` | Repeated molecule copies represent coefficients and atom conservation; keep required copies and directional/energy annotations. | **Implemented:** truthful save-failure feedback (AUD-03). **Scope decision:** practice currently saves separately and has no completed-work export or parent-report integration. Decide how a teacher retains evidence if assigned for assessment; apply G13 if promoted to a full lab. **Review:** keyboard/touch placement, balancing feedback, energy versus matter, and the note that overall equations do not show one process simply running backward. | P1 decision; P2 review |

## Interaction, realism, and language checklist for every pathway

Each checkbox records a completed review with evidence under AUD-06 or AUD-07. Unchecked means that the full review remains pending; it does not declare the lab defective. Existing tested features and AUD-01–04 completion remain recorded above. List corrections found during a review in that lab's backlog before closing the relevant finding.

| Lab / pathway | Interactivity reviewed | Visual realism reviewed | Ninth-grade language reviewed |
| --- | --- | --- | --- |
| Osmosis and Cell Homeostasis / `osmosis-homeostasis` | [ ] | [ ] | [ ] |
| Cells Under the Microscope / `cell-microscopy` | [ ] | [ ] | [ ] |
| What Changes Enzyme Activity? / `enzyme-activity` | [ ] | [ ] | [ ] |
| Yeast Fermentation and Fuel Sources / `yeast-fermentation` | [ ] | [ ] | [ ] |
| Light and Photosynthesis / `light-photosynthesis` | [ ] | [ ] | [ ] |
| How Plants Respond to Signals / `cell-signaling` | [ ] | [ ] | [ ] |
| Measuring Mitosis / `mitosis` | [ ] | [ ] | [ ] |
| How Crossing Over Creates New Allele Combinations / `meiosis-variation` | [ ] | [ ] | [ ] |
| Testing Inheritance Patterns / `inheritance-ratios` | [ ] | [ ] | [ ] |
| Mapping Linked Genes / `linked-genes` | [ ] | [ ] | [ ] |
| Extracting DNA from Fruit / `dna-replication` | [ ] | [ ] | [ ] |
| From DNA to Protein / `dna-protein` | [ ] | [ ] | [ ] |
| Switching Gene Expression On and Off / `lac-operon` | [ ] | [ ] | [ ] |
| Separating DNA Fragments / `gel-electrophoresis` | [ ] | [ ] | [ ] |
| DNA to RNA to Protein — virtual only / `genetic-information` | [ ] | [ ] | [ ] |
| Sordaria extension / `sordaria-crossing-over` | [ ] | [ ] | [ ] |
| Photosynthesis/respiration matter-cycle cards / `activity.html` | [ ] | [ ] | [ ] |

## Recommended implementation order

1. **Shared report foundation** AUD-01 and AUD-02 are implemented locally. Add osmosis predictions and recorded reasoning under AUD-05. Preserve each lab's evidence types, verbatim writing, learning-evidence summaries, and completed PDF/print support.
2. **Save and prediction contracts** AUD-03 and AUD-04 are implemented locally. Keep the save failure, edit, reload, and planning-transition checks as regressions when revising a pathway.
3. **Targeted teaching, interaction, realism, and language passes:** apply AUD-06/07 lab by lab using both pathway tables. Keep justified samples and remove only motions that add no learning. Update worksheets and teacher guides with each pathway revision.
4. **Consistency and acceptance:** resolve AUD-08, record the card activity's scope decision, and complete AUD-09 for the revised pathways.

Close a finding only when its acceptance checks have evidence. Record the affected lab IDs, what changed, tests actually run, rendered report checks where relevant, and remaining classroom/device review. A software pass does not automatically close scientific or reading-level questions.

## Development publication check — 2026-11-12

Reviewed the updated checkout at `C:\Projects\Science_Labs` for publication to `codex/development`. The production build and 79 unit/model/report tests passed. The full Edge/Playwright browser run passed 120 of 121 checks; the remaining legacy lamp test assumed collection could begin without the newly required plan. Updated that test to enter planning in each separate workspace, preserving its classroom-data assertions; its focused rerun passed.

All three deployment checks passed against an assembly of the actual `origin/main` production build and the updated development build. Corrected the new genetics deployment test, which had assumed the development-only genetics route already existed in production. It now checks preview offline PDF generation and preservation of the existing production osmosis attempt. All 43 inventoried asset hashes matched, and the runtime dependency audit reported zero vulnerabilities. The two new DNA landing pages were inspected visually. These publication checks do not close the broader classroom, hardware, language, or scientific review items above.
