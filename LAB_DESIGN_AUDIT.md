# Existing lab design audit

Reviewed 2026-11-11 against the [lab design guide](LAB_DESIGN_GUIDE.md). This is an actionable review backlog, not a claim that every lab has passed a classroom or device evaluation.

## Scope and evidence

The baseline is the **local working tree in `C:\Projects\Science_Labs`**, including the ongoing, uncommitted lab redesigns. It is not a production-release certification or an audit of committed HEAD alone. The documentation commit does not include those implementation changes.

The catalog contains 48 entries: **15 available labs and 33 planned entries**. This audit covers all 15 available labs, the runnable Sordaria extension, and the matter-cycle card activity: **17 runnable pathways**. The 33 planned entries have no implemented student procedure to audit; use the guide when they are built.

Evidence reviewed: catalog and routing, core and extended content/models, shared learning-purpose rules, dedicated extraction and genetic-information implementations, report builders, persistence handlers, existing documentation, and test definitions. Existing model/report tests were run for this audit: **`npm test` passed 64/64**. This pass did not rerun the full browser/deployment suite, render all existing handouts, or test every lab on hardware. Prior genetics/extraction UI work informs the guide; tests merely present in the repository are not counted as newly executed validation.

Labels:

- **Confirmed:** the current source directly establishes the gap.
- **Review:** a concrete question requiring a UI run, content review, report rendering, or classroom evidence. It is not yet a proven defect.
- **Scope decision:** establish the intended assessment/reporting role before implementing a change.

Priority **P0** means a required learning/reporting capability should be addressed before treating the lab as meeting the new standard. **P1** covers the next substantive design correction. **P2** covers consistency, polish, and outstanding validation. These priorities do not declare existing labs unusable.

## Shared findings and acceptance checks

### AUD-01 — Completed PDF reports and print views: P0, confirmed

**Affected:** osmosis, the three core investigations (yeast, leaf disks, mitosis), and all ten investigations currently using the extended app (including Sordaria, excluding the dedicated extraction route).

- [ ] Add a generated, completed-student PDF download to all 14 full investigations in this group. Keep existing useful CSV/text exports as additional formats.
- [ ] Add a purpose-built student print view and print control wherever absent. The core three already have a print report; the extended app currently exports a `.txt` report without a dedicated student-report print control/view.
- [ ] Add optional name/period to osmosis; preserve the identity fields already present in the core three, extended ten, extraction, and genetic-information labs.
- [ ] Verify an incomplete and a completed named attempt, native printing, and the first PDF generated offline after caching.

Evidence: [core app](src/investigations/app.js), `analysis()` and `report`/`print` actions; [extended app](src/investigations/extended-app.js), export controls and `report` action; [osmosis app](src/main.js), results screen. Worksheet and teacher-guide PDFs are blank resources, not the student's completed report. Criteria: G13, G15.

### AUD-02 — Reports must communicate learning: P1, confirmed

**Affected:** core three, extended ten, extraction; apply to the new osmosis report too.

- [ ] Replace the extended text report's raw JSON observation block with readable results, units, sources, and evidence grouped by the lab's learning goals. Keep detailed records in a separate structured export.
- [ ] Add goal-specific evidence and meaningful correction summaries to the core reports without losing their existing tables and written explanations.
- [ ] Revise extraction's visible report: preparation counts and “Responses in order” are process records; summarize what the responses demonstrate and which concepts were revisited. Keep the full response history in structured data.
- [ ] Add sanitized student names to exported report filenames and readable local export date/time with a time zone. Core/extended report filenames are fixed; extraction also uses a fixed filename and displays the raw ISO timestamp.
- [ ] Preserve actual responses, partial-work status, virtual/classroom labels, and evidence limits. Do not infer a grade or independent mastery from completion.

Evidence: [extended app](src/investigations/extended-app.js), `report` action; [core app](src/investigations/app.js), report/print builders; [extraction report](src/investigations/extraction-report.js), `reportHtml()` and `reportDefinition()`; [extraction export](src/investigations/extraction-app.js), PDF/JSON filenames. Reference: [genetics report](src/investigations/genetics-report.js). Criteria: G01, G13–G15.

### AUD-03 — Truthful, nearby save confirmation: P1, confirmed

**Affected:** core three, extended ten, extraction; review osmosis and the card activity's general save messages as well.

- [ ] Make persistence return a success result and show completion confirmation only after a successful write.
- [ ] Show confirmation beside the completion button and announce it accessibly. Repeat clicks must visibly confirm again.
- [ ] On storage failure, show a nearby failure with an export alternative; avoid simultaneously claiming that work was saved.
- [ ] Editing substantive work must clear both completion and its displayed message immediately. Identity edits should preserve academic completion.
- [ ] Exercise success, denied storage, repeat click, reload, and edit-after-completion in each shared app family.

Evidence: the `save` functions in [core](src/investigations/app.js), [extended](src/investigations/extended-app.js), and [extraction](src/investigations/extraction-app.js) catch write failures without returning success; completion handlers independently claim completion/saving. Core/extended text can also remain stale when input handlers update state without rerendering that message. Reference: [genetics app](src/investigations/genetics-app.js), completion handler and `gi-complete-feedback`. Criteria: G11, G12, G16.

### AUD-04 — Predictions can be skipped or written after results: P1, confirmed

**Affected:** core three and extended ten.

- [ ] Require the intended prediction before starting evidence collection; enforce this in transitions and navigation, not only in a disabled button.
- [ ] Decide which design responses are required and clearly label them. The extended completion handler currently checks analysis responses, but not prediction/design; the core app checks prediction/design only at completion.
- [ ] Withhold outcome-revealing instructions/results until the prediction is recorded. General planning information may remain available.
- [ ] Preserve a wrong prediction and ask students to reconsider it using evidence; do not require it to be correct.
- [ ] Recheck extraction and genetics as regressions: they already have gated predictions/checkpoints, so they do not need a duplicate gating system.

Evidence: [core app](src/investigations/app.js), `plan()`, tab handling, `next`, and `complete`; [extended app](src/investigations/extended-app.js), Predict and plan controls, unrestricted `step-*` handler, and `complete`. Criteria: G09, G10.

### AUD-05 — Osmosis collects procedure/calculation evidence, but no written reasoning: P0, confirmed

- [ ] Add a recorded prediction before the experiment and student explanations after the results.
- [ ] Capture evidence that students connect concentration differences, water movement, and signed mass change. Current end-screen explanation/questions are displayed text without student-response fields.
- [ ] Connect those responses and actual measurements to the completed report in AUD-01. Keep five concentration conditions.
- [ ] Retain the distinction between supplied observations and calculated predictions. Review the original worksheet's A/C wording against the configured A/D isotonic cases before redistributing resources.

Evidence: [osmosis app](src/main.js), seven `content()` stages and calculation handler; [configuration](src/data/labConfig.js); [README](README.md), “Experimental values — teacher review required.” The existing source explicitly documents the A/C versus A/D discrepancy; this audit does not independently verify the original dataset. Criteria: G01, G03, G04, G09, G13.

### AUD-06 — Interactions and graphics need a mechanism-focused review: P1, review

**Affected:** every pathway, with emphasis on the shared extended bench.

- [ ] Inspect each step: does the student use a relevant object at its actual work site, and does the visible change explain its role?
- [ ] Check overlays against artwork during every state, resize, and reload. Extended bench sites use percentage positions; review their alignment instead of assuming the genetics geometry fix applies to them.
- [ ] Inspect microscopy, corn, flies, and Sordaria for visible evidence sufficient to make a classification or measurement without relying on an answer cue.
- [ ] Keep choices and the active work site close together; remove duplicate diagrams or highlights only where they add no learning.
- [ ] Improve schematic depth and motion where it helps understanding. Counting, calibrating, interpreting graphs, and comparing samples remain valid interactions; enzyme-style dragging is not required in every lab.

Evidence: [bench](src/investigations/bench.js), [extended visuals](src/investigations/extended-visuals.js), dedicated simulator/art files, and [shared genetics geometry](src/investigations/genetics-geometry.js). Criteria: G05–G07, G16.

### AUD-07 — Reading level, feedback, and contextual limitations: P1, review

- [ ] Read directions, choices, correction feedback, graph/report labels, and handouts as one ninth-grade student pathway.
- [ ] Define new terms at use: e.g. ET50, initial rate, carrier control, recombinant, chi-square, induction, fluorescence, and gene-to-centromere distance.
- [ ] Make correct answers explicit and explain their scientific basis; preserve student observations when they differ from the model.
- [ ] Move any essential interpretation limit out of a collapsed reference panel and next to the relevant process/result. Keep the detailed references too.
- [ ] For extraction specifically, review the remaining “Checkpoint answered” / “Checkpoint passed” labels against the explicit correctness standard. The required gate and explanatory feedback already exist.

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
- [ ] Check mouse, actual touch sequences, select-then-place, keyboard, focus, reduced motion, and phone/tablet/desktop layouts.
- [ ] Recheck cached offline use, first offline PDF, root/development separation, and preservation of earlier attempts.
- [ ] Arrange teacher/student review of explanation quality and reading level; record actual Safari/iPad and Android results separately from Chromium emulation.

Existing tests under `tests/`, `tests/browser/`, and `tests/deployment/` are useful starting points. The 64 passing model/report tests do not resolve these unexecuted reviews. Criteria: G12, G15–G17.

## Lab-by-lab review list

The required work below reflects the streamlining already implemented locally. Keep these decisions unless a new learning objective justifies a change. “Shared fixes” refer to the findings above; they are not additional repetitions to add.

| Pathway / stable ID | Keep and teach | Next review or correction | Priority |
| --- | --- | --- | --- |
| **Osmosis and Cell Homeostasis** / `osmosis-homeostasis` | Five conditions; zero and nonzero equal-concentration contrasts; signed mass change and water movement. | **Confirmed:** AUD-01, 03, 05. Add prediction, recorded explanations, optional identity, completed PDF/print. **Review:** supplied dataset/worksheet A–D agreement; explain % w/v and the volume approximation clearly; distinguish mass evidence from inferred movement. | P0 |
| **Cells Under the Microscope** / `cell-microscopy` | Two cells from each of three specimens; six student measurements; reuse calibrated setup after the first. | **Confirmed:** AUD-01–04. **Review:** ruler/scale alignment after objective changes; calibration versus magnification; what structures these schematics allow students to resolve; whether two selected cells support only a limited tissue claim. | P0 |
| **What Changes Enzyme Activity?** / `enzyme-activity` | One reaction at each of three temperatures; time series and initial rates; optional independent repeats. | **Confirmed:** AUD-01–04. **Review:** ask students to use the first 30 seconds, retain units, distinguish gas-collection faults from enzyme activity, and avoid claiming an optimum or denaturation from this modeled range. Review visible pipette/port/syringe actions. | P0 |
| **Yeast Fermentation and Fuel Sources** / `yeast-fermentation` | Three fresh mixtures per fuel, nine trials; compare rates, overlap, lag, and control; matched-preparation shortcut. | **Confirmed:** AUD-01–04. **Review:** preserve trial variation and early/late rate comparisons; explain why gas is indirect evidence; distinguish virtual and classroom recipes, time schedules, and collector units. Test shortcut with fresh observations. | P0 |
| **Light and Photosynthesis** / `light-photosynthesis` | Three cups per light level, nine trials; ten disks per cup; independent-cup variation and ET50; matched preparation. | **Confirmed:** AUD-01–04. **Review:** define ET50 and interpolation; retain “not reached” instead of zero; connect net gas accumulation with buoyancy and continued respiration; confirm syringe/cup/lamp interactions and independent-cup wording. | P0 |
| **How Plants Respond to Signals** / `cell-signaling` | One control and one treated plant; growth from starting height; daily repeated measures. | **Confirmed:** AUD-01–04. **Review:** explain carrier control and treatment response; distinguish whole-plant evidence from a receptor mechanism; label illustrative dose/time choices; keep independent-plant replication optional when reliability is the question. | P0 |
| **Measuring Mitosis** / `mitosis` | Two non-overlapping fields of 20 cells; all 40 classifications; compare fields before pooling; reuse settings. | **Confirmed:** AUD-01–04. **Review:** chromosome cues for adjacent stages; interphase versus mitosis; curated field proportions and possible zero counts; assumed cycle duration versus measured stage time. A third field is not automatically required. | P0 |
| **How Crossing Over Creates New Allele Combinations** / `meiosis-variation` | One egg and one sperm pathway; track exchanged DNA, separation, and different cell products. | **Confirmed:** AUD-01–04. **Review:** homologs begin within one precursor nucleus; distinguish homologs/sisters and egg/polar bodies; show the modeled sperm-entry signal accurately; explain simplified timing and omitted independent assortment. Review each placement for evidence beyond following highlights. | P0 |
| **Testing Inheritance Patterns** / `inheritance-ratios` | Three ears, 48 kernels per region; student tallies; per-ear versus pooled proportions and a documented 3:1 model. | **Confirmed:** AUD-01–04. **Review:** sampling-region visibility, phenotype clarity and tally feedback; ninth-grade explanation of chi-square; avoid treating a discrepancy statistic as a p-value, automatic disproof, or a universal corn-genetics rule. | P0 |
| **Mapping Linked Genes** / `linked-genes` | Three samples of 32 offspring; all trait counts; per-sample and pooled recombination; reuse preparation. | **Confirmed:** AUD-01–04. **Review:** fly traits at small sizes; parental/recombinant definitions and cross record; why parent sex matters in this example; limits of two-point mapping. Do not claim three-gene order from two markers. | P0 |
| **Extracting DNA from Fruit** / `dna-replication` | One hands-on extraction plus two matched model-prepared controls; release/separation/precipitation; evidence limits. | **Confirmed:** AUD-02, 03; completed PDF/print already exist. **Review:** AUD-07 wording/status; check targets and fruit/masher/filter/alcohol actions on touch; retain some material without detergent; label crude visible material and model-prepared controls. Do not reintroduce three duplicate extractions. | P1 |
| **From DNA to Protein** / `dna-protein` | Three distinct reporter comparisons: DNA, no DNA, and translation blocked; retain time series. | **Confirmed:** AUD-01–04. **Review:** link controls to the conclusion without claiming fluorescence directly measures mRNA; explain arbitrary units; preserve numeric-versus-ordinal source distinctions. Keep its experimental purpose distinct from the molecular information-flow lab. | P0 |
| **Switching Gene Expression On and Off** / `lac-operon` | Four distinct plates; one spreading action per manually prepared plate; inspect growth and fluorescence separately. | **Confirmed:** AUD-01–04. **Review:** selection versus induction, plate labels, simulated incubation, and prepared-cell assumptions. Teach the actual arabinose-regulated reporter; do not imply this is a lac-operon mechanism because of its historic ID. | P0 |
| **Separating DNA Fragments** / `gel-electrophoresis` | One gel, four lanes; ladder, two references, unknown; staining/calibration and three unknown-band estimates. | **Confirmed:** AUD-01–04. **Review:** per-lane pipette targets, polarity/migration, stain/view action, ladder-based size reasoning and uncertainty. Matching patterns alone should not establish personal identity. A second identical gel remains optional. | P0 |
| **DNA to RNA to Protein — virtual only** / `genetic-information` | Short complementary DNA windows, first RNA codon, processing/export, three amino acids and stop; spatial enzyme placement and action. | **Reference features present:** moving targets, shuffled tRNAs, stop-codon label, explicit correctness, evidence-oriented PDF/print, named files, readable time, inline save confirmation. **Review:** both template directions and later-stage sites after resize/reload; simplification note placement; classroom comprehension; real-device access and long reports. Keep regression checks for replication not being required for every transcription. AUD-08, 09 remain open. | P2 |
| **Sordaria extension** / `sordaria-crossing-over` | Two non-overlapping fields of 12 asci; classify all 24; field estimates before pooling. | **Confirmed:** AUD-01–04 via the extended app. **Review:** ordered-spore pattern visibility; explain second-division patterns and why the percentage is halved; distinguish gene-to-centromere mapping from gene order and same-slide fields from independent crosses. | P0 |
| **Photosynthesis/respiration matter-cycle cards** / `activity.html` | Repeated molecule copies represent coefficients and atom conservation; keep required copies and directional/energy annotations. | **Scope decision:** practice currently saves separately and has no completed-work export or parent-report integration. Decide how a teacher retains evidence if assigned for assessment; apply G13 if promoted to a full lab. **Review:** keyboard/touch placement, balancing feedback, energy versus matter, and the note that overall equations do not show one process simply running backward. | P1 decision; P2 review |

## Recommended implementation order

1. **Shared report foundation:** implement AUD-01/02 across core and extended app families, and add osmosis reasoning/reporting. Reuse the local PDF engine and common report conventions while retaining each lab's evidence types.
2. **Save and prediction contracts:** implement AUD-03/04 in shared handlers; verify completion cannot falsely claim persistence or leave stale confirmation after editing.
3. **Targeted teaching and interaction passes:** apply AUD-06/07 lab by lab using the table. Keep justified samples and remove only motions that add no learning. Update worksheets and teacher guides with each pathway revision.
4. **Consistency and acceptance:** resolve AUD-08, record the card activity's scope decision, and complete AUD-09 for the revised pathways.

Close a finding only when its acceptance checks have evidence. Record the affected lab IDs, what changed, tests actually run, rendered report checks where relevant, and remaining classroom/device review. A software pass does not automatically close scientific or reading-level questions.
