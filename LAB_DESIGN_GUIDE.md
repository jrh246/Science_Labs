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

Long answers must flow across pages without clipping or losing text. Check tables, page breaks, footers, and extra blank pages by rendering representative short and long reports. Keep the PDF engine, fonts, and other required assets local so the first PDF download works offline after the app has been cached. Test failure recovery as well as successful export.

An optional practice activity needs an explicit reporting decision. If its evidence is assessed through a parent lab, identify how it reaches that report. If it becomes a separately assigned full lab, apply the same PDF and print requirements.

## Access and validation are part of the design

**G16 — Support more than dragging.** Offer mouse and touch placement, a select-then-place alternative, and keyboard access. Use clear focus, labeled controls, targets of at least 44 CSS pixels where practical, and feedback that does not depend on color or hovering. Keep the active target and component choices reachable together on a phone. Reduced motion must retain the visible result and all required functionality.

Test real interaction sequences: drag, release, then tap; wrong placement followed by correction; resize; scroll; reload; and continue. Artwork and targets must remain aligned at each stage. Avoid horizontal overflow, hidden required feedback, lost focus, and duplicate transitions from pointer and click events.

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

Reuse meaningful model, browser, and deployment tests. Do not add tests that merely repeat trivial implementation details. Chromium emulation does not certify Safari/iPad or Android hardware, and automated checks do not replace teacher or student review. Record what was actually tested and keep remaining review work explicit.

## How to use this guide

For a new lab, establish G01–G04 before building, apply the remaining criteria during implementation, and record any applicable scope decisions. For an existing lab, consult [the audit](LAB_DESIGN_AUDIT.md), address shared defects first, and use the lab-specific questions to plan its next revision.

The current reference implementations are the dedicated extraction files and `genetics-*` files under `src/investigations/`. The genetics lab demonstrates spatial enzyme placement, moving targets, concise instructions, explicit correctness feedback, evidence-based reports, named exports, and inline save confirmation. It still needs the same ongoing scientific, classroom, device, and regression review as every other lab.
