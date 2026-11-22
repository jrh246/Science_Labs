# Lab design guide

Established 2026-11-11 from the fruit DNA extraction and DNA to RNA to Protein redesigns. These are the design requirements for new labs and the review criteria for existing labs. The companion [audit](LAB_DESIGN_AUDIT.md) applies them to the current local implementation.

## Three priorities in every lab

Apply these requirements to every new lab and every revision of an existing lab:

- **Meaningful interactivity:** students manipulate tools, specimens, molecules, or investigation settings; make observations or measurements; and see the consequences of their actions. Tie the main interactions to the learning goals (G01, G05–G07, G16).
- **Visual realism:** equipment, specimens, materials, and processes should look convincing and behave plausibly. Show appropriate shape, scale relationships, depth, lighting, texture, and movement where they help students understand the science (G03–G06).
- **Ninth-grade student language:** write student directions, questions, feedback, labels, tooltips, report prompts, and student handouts for ninth-grade comprehension. Explain necessary scientific terms where students use them (G08–G10).

Record separate review evidence for each priority. Carry these checks through the full student pathway, including intermediate states, errors, and the report. Preserve students' own written responses verbatim when checking the reading level of authored prompts and directions.

## Learning comes before the procedure

**G01 — Define the evidence of learning.** Before building an apparatus or animation, write:

- The question students will investigate.
- The two to four concepts they should be able to explain afterward.
- The observation, decision, calculation, placement, or written explanation that demonstrates each concept.
- The misconception each important comparison or checkpoint addresses.

A student should do more than complete a recipe. For example, extracting visible material is an experience; explaining why detergent changes recovery, what the controls test, and why visible material does not establish purity is evidence of learning. Placing polymerase and extending a complementary strand connects an enzyme's location with its function.

Do not claim understanding solely because a student clicked the required controls. Preserve the student's reasoning so a teacher can assess it.

**G02 — Require repetition for a stated reason.** Each additional action or sample must add evidence, a distinct control, a different biological outcome, necessary measurement practice, or information about variation. Three trials are not a default.

- Keep independent samples when comparing variation or estimating proportions. Examples include mitosis fields, offspring samples, and fresh leaf-disk cups.
- Keep different controls even when preparation looks similar. A no-detergent control and a no-fruit blank answer different questions.
- After a student demonstrates preparation, offer a fresh matched preparation when repeating those motions adds no learning. The shortcut must not copy measurements, classifications, counts, or answers from the previous sample.
- Shorten repetitive sequence building after students demonstrate the pairing rule. Label the remaining extension as model-provided.
- Distinguish independent samples from repeated measurements and subsamples. Ten disks in one cup are not ten independent cups; two fields from one slide are not two independent biological crosses.
- One modeled sample per condition can illustrate a mechanism or comparison. It cannot estimate within-condition variation or establish a population effect. Offer further investigation when reliability becomes the question.

## Scientific meaning must survive simplification

**G03 — Check molecules, mechanisms, locations, and conclusions.** Directions, illustrations, choices, feedback, reports, and handouts must agree. A distractor can express a misconception when the question asks students to evaluate it and feedback corrects it; the question must provide a scientifically valid answer.

The reference genetics lab establishes these examples:

- DNA stores information. In the modeled nuclear eukaryotic cell, DNA stays in the nucleus; an mRNA message carries information to a ribosome in the cytoplasm. DNA does not turn into a protein.
- Replication copies DNA. It is not required each time a cell transcribes an mRNA. Ask students to explain that relationship explicitly.
- Enzymes act at particular molecular sites. Distinguish an enzyme from the DNA or RNA it acts on.
- A short amino-acid chain in the activity is a peptide fragment, rather than a complete functional protein.
- The modeled release factor recognizes the stop codons UAA, UAG, and UGA at the ribosome. It does not bring an amino acid like a tRNA.

For extraction, mechanical disruption can rupture some membranes and release some DNA without detergent. Detergent helps disrupt lipid membranes. Filtering removes larger debris; alcohol makes DNA less soluble so it can precipitate. Visible crude material alone does not establish DNA identity, concentration, or purity. Preserve unexpected classroom observations instead of forcing agreement with a simulated result.

Use relevant primary scientific or institutional teaching sources when changing a biological model or a physical procedure. A passing software test verifies the implemented rule; it does not independently validate the science.

**G04 — Explain the limits where they matter.** Place a short model note immediately after a simplified process or beside a potentially misleading result. Keep a fuller reference section available as well.

After replication, explain that the activity shows the general process. The actual process includes more components: the lagging strand forms short Okazaki fragments, RNA primers are replaced with DNA, and DNA ligase seals the joins. Do not imply that a simplified continuous animation shows every part of replication.

Identify model-supplied primers, automatic extension, schematic sizes, accelerated clocks, and generated observations. Distinguish measured results from assumptions and inference. Describe a control's actual purpose rather than treating it as proof of every proposed mechanism. Keep implementation details out of student directions unless they affect interpretation.

## Make an interaction show cause and effect

**G05 — Put tools and components at their work sites.** Students should use the object that performs the action, place or use it where the action happens, and see the resulting change. A meaningful microscope measurement or specimen classification is just as valid as a molecular placement; the interaction should fit the learning goal.

Plan the main student actions before choosing artwork. For each learning goal, identify what the student controls, what changes visibly, and what observation or explanation provides evidence of learning. Navigation buttons and a running animation alone do not establish meaningful interaction. Use direct manipulation where it fits the task, with accessible tap/select and keyboard alternatives. Measurement, classification, graph interpretation, and balancing a model also count when the student makes the relevant decisions.

For a molecular model, use sites such as a DNA fork, primer's 3′ end, promoter, RNA end, intron, nuclear pore, or current ribosome codon. For a bench lab, use the bag, tube, pipette destination, microscope control, gel well, or other actual apparatus feature. Avoid a generic drop box when the relevant work site is visible.

Show the consequence: DNA opening or extension, an intron removed and exons joined, mRNA crossing a pore, an amino acid delivered, liquid added, a sample mashed, or a band revealed. Animation illustrates the transition; it must not silently add student responses or erase mistakes.

**G06 — Make visuals realistic and keep artwork, targets, and choices aligned.** Use shared geometry for the drawn component and its interaction target. A growing strand's next-nucleotide target must move with polymerase and point to the next available site, rather than the last completed base. Check both template directions and RNA synthesis, not just the first DNA frame.

Keep the component tray immediately below or beside the active drawing. Remove a second highlighted matching diagram when the same information is already clear on the molecule. Use scientifically plausible shapes, proportions, depth, labels, and motion where useful. Original SVG or other code-based artwork is suitable when it supports accurate, responsive interaction.

Treat visual realism as a core design requirement. Use recognizable apparatus and specimens, plausible materials and proportions, visible fluid levels or sample changes, and motion that matches the action. For example, fruit should visibly change when mashed, liquid should enter the selected container, and an enzyme should act where it is placed. Microscopy views must provide visible structures consistent with the model's stated resolution. Review the initial, intermediate, and final states of each important process.

Molecular and microscopic scenes may use clear scientific schematics to show otherwise invisible processes. Explain exaggerated scale, artificial colors, omitted details, and accelerated movement where these affect interpretation. Keep labels, contrast, and interaction targets readable while improving detail, depth, lighting, and texture. The visual result must communicate the science accurately.

**G07 — Avoid answers supplied by position or decoration.** Shuffle answer banks when fixed order reveals the answer, as with tRNA choices. Keep the shuffled order stable within an attempt, including corrections and reload. Preserve molecule identity, correct base sequences, direction labels, lane identity, and other scientifically meaningful order. Do not randomize the biology to randomize the choices.

A target highlight may teach where to practice an action. Decide separately whether an assessment should supply that hint. Remove redundant cues and displays that add visual work without adding information.

## Write for ninth-grade readers

**G08 — Write all student-facing language at a ninth-grade level and define terms at first use.** Use short sentences, concrete verbs, and one action per instruction where practical. Keep necessary scientific vocabulary and explain it in context. Apply the same reading target to directions, questions, answer choices, hints, feedback, labels, tooltips, report prompts, and student handouts. Students should be able to explain what to do next and why the action matters.

Examples:

- **Release:** let material out of a cell or compartment.
- **Separate:** move parts of a mixture apart; state which parts and how.
- **Precipitate:** come out of a liquid as solid material; explain the role of alcohol in this lab.
- **Lipid membrane:** a barrier made mostly of lipid molecules. Explain why detergent can disrupt it before asking students to connect detergent with DNA recovery.
- **Template:** a strand used as a guide for building a matching strand.
- **Codon:** three RNA bases that specify an amino acid or a stop signal.

Define primer, promoter, intron, exon, anticodon, and other new terms where students need them. Explain what to do, where to do it, and why it matters. Review the entire pathway, including error messages, graph labels, report prompts, and handouts. A reading score alone does not establish that ninth graders understand the task; use teacher and student review.

## Predict before revealing the result

**G09 — Make required thinking explicit and enforce its timing.** Say that a required response must be answered before continuing. Gate the relevant controls and navigation in the state model as well as the interface. Do not reveal the next action instructions or the predicted result before the response is recorded.

A prediction records what the student expects and why; it may be wrong. Do not require a prediction to match the modeled outcome. A required knowledge check can ask for revision with feedback before continuation. Preserve the initial response and revisions when recorded, and mark older attempts without that history as unrecorded. Retain the first recorded prediction when students revise their current writing. Label prediction timing as unrecorded when earlier observations already exist. Optional checkers that reveal expected results must respect the prediction gate too.

When a prerequisite response changes, disable its dependent controls immediately in both the interface and state model. Do not wait for reload or another action. Keep the raw edit and prior evidence; re-enable the controls after the current required check succeeds.

**G10 — Give clear, useful feedback.** Correct answers should say **“Correct!”** and explain why. Wrong answers should name the relevant misconception or suggest what to reconsider. “Check passed” alone is insufficient. Pair color with text or an icon. Keep feedback near the question or action and announce important updates to assistive technology.

After students collect evidence, ask them to compare it with their prediction and explain what supports their conclusion. Do not replace their observation or explanation with the model's preferred response.

## Completion must mean work was saved

**G11 — Make persistence truthful and visible.** Clicking a completion control must give immediate confirmation beside that control, such as “✓ Saved just now. Your completed work is saved on this device.” Use an accessible status region and bring the message into view without moving the student away from the work. Clicking it again should confirm again.

Show a successful save only after the storage write succeeds. If storage fails, show an inline failure and offer a report download; do not claim that completion was persisted. A completion label is not a grade or a submission receipt.

Retain confirmation appropriately after reload. Editing substantive responses or observations must invalidate stale completion and its visible confirmation. Editing optional name or period should update report identity without invalidating the student's academic work. Keep guided comparison data separate from optional exploration.

**G12 — Preserve existing student work.** Keep stable lab and question IDs. Restore valid partial work and recorded corrections. When scientific or workflow changes affect prior observations, retain the original version or provide an explicit migration and export path. Do not silently regenerate an observed sample, discard older responses, or reset an attempt as part of a feature update. Keep development and production storage/cache scopes separate.

## A completed student report is required

**G13 — Provide both a completed PDF download and printing.** Every full lab must produce a downloadable PDF containing the student's actual work and offer a print view, including native browser printing. A blank worksheet, text file, CSV, or browser “Save as PDF” alone does not satisfy the completed PDF-download requirement. Reports may also be exported while work is incomplete, with a clear status.

Provide optional **Name** and **Class / period** fields. Include the supplied student name in a safely sanitized filename. Use a neutral filename when no name is provided. Human reports must show a readable export date, local time, and time zone, for example “Nov 11, 2026, 1:49 PM PST.” Retain an ISO timestamp separately in structured data. Do not infer a student's identity from other sources.

**G14 — Report learning evidence, rather than a chronological action log.** Organize the student and teacher report around:

1. Lab question, identity, export time, and completion status.
2. The student's prediction and relevant investigation design.
3. Actual observations, measurements, classifications, calculations, or student-built products, with units and data sources.
4. Evidence grouped by learning goal, including meaningful revisions after feedback.
5. Concept-check prompts, selected responses, and explicit answer status.
6. The student's written explanations, preserved verbatim.
7. Relevant model limitations and uncertainty.

For example, “Built a complementary DNA excerpt after feedback on base pairing” is useful when supported by the recorded attempt. A list of every click, navigation event, and tool action is not a substitute for evidence. Distinguish work shown independently, work revised after feedback, incomplete work, and work not recorded. Do not infer mastery, a numerical grade, or a result the student never produced.

Keep raw attempts and action history in a separate structured export or PDF attachment when needed for future assessment. Use versioned schemas, stable question/condition IDs, attempt IDs, explicit sources, and a clear grading status. Existing locally editable records are not authenticated submissions.

**G15 — Keep all report formats faithful and readable.** Build PDF, print, and structured exports from the same response snapshot. Preserve full written answers, Unicode names and scientific symbols, source labels, and partial-work status. Clearly label automatic extension or model-prepared controls. Human summaries must not replace the underlying student response.

Long answers must flow across pages without clipping or losing text. Keep each question with the start of its answer, even when a long answer continues onto later pages. Inspect the actual rendered page boundary; a character-count grouping rule alone does not prevent an orphaned question. Check tables, page breaks, footers, and extra blank pages by rendering representative short and long reports. Inspect actual glyphs for names and scientific symbols, including arrows: a character can survive in JSON while the PDF font renders a box. Use locally bundled, licensed fallback glyphs without replacing original student text, and verify their first-offline output. Keep the PDF engine, fonts, and other required assets local so the first PDF download works offline after the app has been cached. Test failure recovery as well as successful export.

An optional practice activity needs an explicit reporting decision. If its evidence is assessed through a parent lab, identify how it reaches that report. If it becomes a separately assigned full lab, apply the same PDF and print requirements.

## Access and validation are part of the design

**G16 — Support more than dragging.** Offer mouse and touch placement, a select-then-place alternative, and keyboard access. Use clear focus, labeled controls, targets of at least 44 CSS pixels where practical, and feedback that does not depend on color or hovering. Keep the active target and component choices reachable together on a phone. Reduced motion must retain the visible result and all required functionality.

Test real interaction sequences: drag, release, then tap; wrong placement followed by correction; resize; scroll; reload; and continue. Artwork and targets must remain aligned at each stage. Avoid horizontal overflow, hidden required feedback, lost focus, and duplicate transitions from pointer and click events.

Compatibility mouse events can move focus after a touch action replaces the interface, before duplicate-click suppression runs. Check the newly focused field as well as action counts. Preserve the next deliberate tap and native mouse/keyboard behavior; verify drag, release, tap, focus and continued entry in one real browser sequence. For a timed press control, capture the measurement at the intended event (such as press-down). If replacing that control would break touch release or steal focus, defer the redraw until release without moving the measurement endpoint.

**G17 — Validate the learning contract with appropriate checks.** Match checks to the change. For a new or substantially redesigned interactive lab, review:

- Meaningful student interaction for each main learning goal, including a visible response to manipulation or a decision.
- Visual realism and scientific plausibility in the key starting, intermediate, and final states; inspect desktop and phone views.
- Ninth-grade language across all authored student text; use a reading-level screen as a diagnostic and teacher/student review to check understanding.
- Scientific rules, controls, units, and limits; use a qualified content review where needed.
- A complete student attempt, wrong answers and placements, required gates, and saved partial attempts.
- Evidence and reports for an unfinished attempt, a corrected attempt, and a completed attempt.
- Save success, denied storage, reload, response editing, and old-save compatibility.
- PDF and native print content, named and unnamed exports, readable timestamps, and long answers.
- First offline PDF generation after caching, plus root/development deployment isolation.
- Mouse, touch, keyboard, reduced motion, and representative phone/tablet/desktop widths.
- For localized releases, the G18 language-switch, translated-resource, report-fidelity, accessibility, and language-review checks. English acceptance alone does not establish translation readiness.

Reuse meaningful model, browser, and deployment tests. Do not add tests that merely repeat trivial implementation details. Chromium emulation does not certify Safari/iPad or Android hardware, and automated checks do not replace teacher or student review. Record what was actually tested and keep remaining review work explicit.

## How to use this guide

For a new lab, establish G01–G04 before building, apply the remaining criteria during implementation, and record any applicable scope decisions. For an existing lab, consult [the audit](LAB_DESIGN_AUDIT.md), address shared defects first, and use the lab-specific questions to plan its next revision.

The current reference implementations are the dedicated extraction files and `genetics-*` files under `src/investigations/`. The genetics lab demonstrates spatial enzyme placement, moving targets, concise instructions, explicit correctness feedback, evidence-based reports, named exports, and inline save confirmation. It still needs the same ongoing scientific, classroom, device, and regression review as every other lab.

## Patterns verified in AUD-05–07

- Keep apparatus artwork, work targets, tool-tip anchors, and measurement overlays in a shared coordinate system. Match the drawing's aspect ratio at every viewport size. Check actual placement after scroll, resize, reload, and touch release.
- Let preparation change the visible equipment or sample. Show a placed ruler, connected tube, loaded well, labeled plate, or transferred specimen when that action occurs. Keep counters and controls clear of the material being inspected.
- Teach calibration with a known reference and an objective-specific scale. Reuse the calibration for later samples while requiring each new measurement. Identify supplied calibration in earlier work and preserve its data.
- Place brief evidence limits beside the active process or results. Explain unfamiliar terms in the directions and prompts where students first need them. Give explicit correctness and a scientific reason after a checked response.
- Save predictions with honest timing. Earlier measured work can add reasoning without a backdated prediction. Include verbatim explanations with the actual measurements in every completed report format.
- Review wording and reading diagnostics independently from classroom comprehension. Record actual teacher/student and hardware validation when performed.

## Resource consistency and acceptance evidence (AUD-08/09)

- Read shared prompts, conditions, and model limits directly from current definitions when generating handouts. Check all downloadable legacy URLs as well as visible catalog links. Preserve historical route/save/resource IDs when displayed titles become more precise.
- Explain where students keep completed work: generated PDF, native print, optional identity, and honest progress status. Keep physical collector sheets alongside reports when their units or observation series differ from the online entry form.
- Render updated resources and short/long student reports, compare report content with structured responses, and inspect every changed page. Update resource hashes and rebuild offline caches after handout-only changes.
- Record software checks, human comprehension, and physical device results separately. Keep an initial test failure and its rerun in the evidence. A passing rerun supports that check; it does not erase the earlier result or establish classroom acceptance.


<a id="g18"></a>

## Plan for app translation and translated printing

**G18 — Support native app language selection and translated print/PDF output.** This is an agreed future requirement, recorded 2026-11-14. This documentation change does not implement a language selector or translated resources. Use Spanish as the first acceptance example and keep the design open to other available languages.

- A student can select **Español** or another reviewed, published language in the app. Translate navigation, directions, questions, choices, hints, feedback, errors, save messages, tooltips, accessible names, diagram labels, graph labels, and report controls. Language access for a free lab must work for guests and free accounts without sign-in, an upgrade, or a trial.
- A teacher can choose a language for worksheets, collector sheets, teaching resources, and PDF/native-print output independently of the teacher's app language. For example, a teacher using the English interface can print Spanish student materials. A completed student report must also support the selected output language for authored labels and prompts while preserving student-authored writing verbatim.
- Switching languages during an attempt must keep the student's step, observations, measurements, seeded results, choice order, corrections, completion state, and saved work. Stable activity, question, condition, molecule, and rubric IDs must not depend on translated display text. Change the display language without creating a new attempt or implying new learning evidence.
- Preserve scientific meaning and the intended reading level. Current labs target ninth-grade comprehension; translations need appropriate language-specific review and explanations of necessary terms. Keep scientifically meaningful sequences, symbols, units, and values intact. Translated sentences can use different grammar and length without changing what a question asks or what counts as correct.
- Keep names, class/period entries, student responses, teacher-authored text, and recorded evidence in their original form. Teacher-owned directions/questions need their own translation/review status; a translated base lab does not automatically translate or approve a private teaching copy. Machine-assisted translations remain drafts until reviewed. Do not send student work to a translation service as an automatic side effect of changing the app language.
- Show which languages are actually available for the site, lab, and requested resource. Give a clear notice and an explicit fallback when a translation is missing. Keep incomplete translations from being presented as a fully supported language. Language names should be recognizable in their own language; selecting a language must not change the lab's publication or access rules.

Before approving a localized pathway, check a complete and partial attempt, a mid-attempt language change, reload and save recovery, mouse/touch/keyboard use, accessible labels, longer text at phone widths, and layout for each supported writing direction. Render and inspect translated blank resources and short/long completed PDF and native-print reports, including accents, scientific notation, student names, correct fonts, page breaks, and the final response. Confirm that the English teacher interface can produce a Spanish handout. Verify the supported offline pathway with the required translated content/fonts; platform offline reload limitations still apply.

Record the displayed language and reviewed translation/release version with report and submission snapshots. Retain the originally displayed prompts and original student answers. A later translated copy must be labeled and must not silently rewrite the original submitted evidence. Future grading must use stable rubric/question IDs and account for the student's response language. A passing English test, a reading-level formula, or the existence of a Spanish source textbook is not language acceptance evidence. Track implementation under [AUD-10](LAB_DESIGN_AUDIT.md#aud-10).


## Patterns checked during BIO-01 through BIO-03

- Keep a wrong or unchecked current observation in PDF, print and structured reports, with an explicit unconfirmed/needs-review label. Do not turn an entered response into “Not recorded” because its correctness check failed. Keep confirmed results distinguishable from current edits.
- After an academic edit, clear stale completion and correctness messages, and block the relevant next action until the new response is checked. Confirming an already correct response again is not evidence that an error was corrected.
- Suppress only a drag's generated compatibility click. Reset suppression at the next physical pointerdown; keyboard clicks remain usable. A fixed post-drag timeout can ignore the student's next genuine tool choice.
- Keep tools adjacent to the active diagram without covering the specimen, target, or measurement. Size the workbench so its active site and choices fit together at phone widths. Anchor a dragged tool's working tip, not an arbitrary icon center, at its work site.
- Label supplied controls and reference explanations separately from student evidence. Keep completed reports focused on predictions, actual observations, explanations and meaningful feedback; the teacher guide can carry the full teaching notes.
- Include a wrong unfinished export and edit-after-correct workflow in review, alongside draft, corrected, completed, long-answer, saved/reloaded and offline cases. Routine regressions must write temporary artifacts; an explicit active-lab capture records retained review evidence.

Evidence: the BIO-01/BIO-02 follow-up artifacts and BIO-03 review under data/development-tracker/biology-reviews. These are development checks; teacher/student comprehension, physical devices, physical protocols and translated delivery remain separate.

A touch follow-up in BIO-07 found that a native compatibility click can land on a replacement button after the first tap redraws the interface. Suppress that pending click by gesture, then reset at the next physical pointerdown; checking only the old DOM element is insufficient. Verify exact single increments, toggles and navigation, alongside drag-release-next-tap. Preserve existing recorded samples and observed states when applying the fix.

A BIO-31 native-print follow-up found that `break-after: avoid` alone allowed a long question heading itself to split across pages. Keep response headings internally together as well, and verify actual native-print question/answer starts separately from the downloadable PDF. The retained failure and corrected normal/long reports are under `data/development-tracker/biology-reviews/evidence/population-estimates/`. This CSS regression review does not establish classroom, device or translated acceptance.

A BIO-32 report follow-up found an isolated PDF table header at a page bottom. Keep the header with at least the first data row, and verify long downloadable and native reports against their own response snapshots. Retained before/after evidence is under `data/development-tracker/biology-reviews/evidence/food-web-energy/`. A supplied reference previously observed must stay distinguishable from a current edited/unconfirmed answer.

A BIO-33 PDF follow-up found a section title left behind when its first long response moved to the next page. Keep the title with that response’s prompt and first answer words; allow the remaining long answer to flow. The real failure and corrected short/long downloaded/native reports are under `data/development-tracker/biology-reviews/evidence/reserve-design/`. Blank handout questions should also stay with their answer space; remove duplicated collector entries before adding pages.


A 2026-11-15 user download check found that valid handouts on disk could still download as HTML from a local preview. Verify the actual student/teacher download URLs in standalone, public, and authorized runtime modes: require PDF content type, PDF bytes, and matching resource hashes; a missing PDF must return an error rather than a successful HTML fallback. Keep local public-resource serving separate from hosted portal packaging. Check extracted glyphs and rendered scientific notation in handouts as well as generated reports; a default system font can omit subscripts or superscripts. Record user review independently from software/development acceptance. Evidence: data/development-tracker/pdf-audits/2026-11-15/.
