# Remaining Biology build tasks

Generated from [biology-build-queue.json](data/development-tracker/biology-build-queue.json). Edit queue/review sources and run `npm run biology:queue:render`; do not hand-check this generated table.

Initial scope (2026-11-14): **33 planned labs**, **66 linked build/review tasks**, and one lab at a time. The original 15 available catalog labs and supplementary pathways are outside this new-build queue. Order follows the existing chapter/unit catalog; chapter numbers are developer reading references, not student-facing lab names.

**Current next task:** None; all development reviews passed.
**Development reviews passed:** 33/33. This is not whole-course, translation, classroom, or production-release approval.

## Your one-at-a-time review

The build/review marks below are development checks. Your lab reviews are tracked separately in [BIOLOGY_USER_REVIEW.md](BIOLOGY_USER_REVIEW.md); only your stated reviews are checked off there.

## Required sequence

1. Run `npm run biology:queue` and read the current [design guide](LAB_DESIGN_GUIDE.md), [audit](LAB_DESIGN_AUDIT.md), [architecture](ARCHITECTURE.md), and [resource plan](LAB_RESOURCES_PLAN.md). Resume the current lab rather than starting another.
2. Mark only the ready build `in-progress`. Confirm the learning question and two to four goals, research the science, plan meaningful interactions and realistic visuals, justify controls/repetition, choose modes, and define the evidence/report before implementation. Add only the shared scaffolding needed for this lab.
3. Build its model, interface, feedback/gates, accessible interactions, persistence, completed PDF/native print, and matching student/teacher materials. Preserve existing attempts and other labs. Prepare authored content for future translation; do not claim Spanish support without reviewed app and print coverage.
4. Run applicable checks and capture evidence. When the implementation is ready for review, set its build to `done`; its review becomes the next ready task. Copy [the review template](data/development-tracker/biology-reviews/template.json) to the exact lab-specific path listed in the queue.
5. Perform a **separate development-review pass** against every requirement below. Record source/build identity, reviewer/date, findings, actual test results, screenshots, rendered PDFs/native-print evidence, and resource checks. A successful build, a catalog label, or test results alone do not pass this review.
6. If any applicable requirement fails, record the blocker, set review to `changes-required` and reopen the same build as `in-progress`. Fix it and rerun the affected review checks before returning to review. Keep initial failures and their corrections in the review record's history. Do not start the next lab.
7. Set review to `passed` only after its evidence record has decision `pass`, every required development check passes, and blockers are empty. Run `npm run biology:queue:check` and render the updated task list. Only then may the following lab start. The validator checks record/dependency integrity; it does not independently judge teaching quality.

Update actual catalog/resource/dataset records as implementation becomes real. When dataset sources change, regenerate and sync their outputs using the existing development-tracker instructions. Do not award standards approval or whole-course completion from task completion. Keep production publication off until its separate release decision; development review does not publish a course/unit/lab.

This workflow does not require a new user-confirmation pause after every lab. Required expert input or unresolved scientific/content questions are blockers. Teacher/student comprehension, physical devices, and classroom protocol validation remain explicitly recorded as pending unless actually performed; development acceptance must not claim those outcomes. If a specific external review is necessary to resolve a scientific or procedural uncertainty, it must be resolved before the development gate passes.

G18 is a **localization-readiness** check for these builds. Full native language selection and Spanish/other-language printable delivery remain future [AUD-10](LAB_DESIGN_AUDIT.md#aud-10) work unless explicitly implemented and validated. English acceptance does not establish translated readiness.

## Ordered build and review tasks

| Order | Lab | Unit · reading chapter | Build task | Required review | Build dependency |
| --- | --- | --- | --- | --- | --- |
| 1 | Seed Germination | The Chemistry of Life · 1 | [x] BIO-01-BUILD (done) | [x] BIO-01-REVIEW (passed) | Start |
| 2 | Water and Surface Tension | The Chemistry of Life · 2 | [x] BIO-02-BUILD (done) | [x] BIO-02-REVIEW (passed) | BIO-01-REVIEW |
| 3 | Identify an Unknown Food Sample | The Chemistry of Life · 3 | [x] BIO-03-BUILD (done) | [x] BIO-03-REVIEW (passed) | BIO-02-REVIEW |
| 4 | Natural Selection in Changing Habitats | Evolutionary Processes · 18 | [x] BIO-04-BUILD (done) | [x] BIO-04-REVIEW (passed) | BIO-03-REVIEW |
| 5 | Genetic Drift and Natural Selection | Evolutionary Processes · 19 | [x] BIO-05-BUILD (done) | [x] BIO-05-REVIEW (passed) | BIO-04-REVIEW |
| 6 | Build a Phylogenetic Tree | Evolutionary Processes · 20 | [x] BIO-06-BUILD (done) | [x] BIO-06-REVIEW (passed) | BIO-05-REVIEW |
| 7 | Modeling Viral Spread | Biological Diversity · 21 | [x] BIO-07-BUILD (done) | [x] BIO-07-REVIEW (passed) | BIO-06-REVIEW |
| 8 | Investigate an Unknown Prokaryote | Biological Diversity · 22 | [x] BIO-08-BUILD (done) | [x] BIO-08-REVIEW (passed) | BIO-07-REVIEW |
| 9 | Protist Structure and Movement | Biological Diversity · 23 | [x] BIO-09-BUILD (done) | [x] BIO-09-REVIEW (passed) | BIO-08-REVIEW |
| 10 | Fungal Structures and Reproduction | Biological Diversity · 24 | [x] BIO-10-BUILD (done) | [x] BIO-10-REVIEW (passed) | BIO-09-REVIEW |
| 11 | Moss and Fern Life Cycles | Biological Diversity · 25 | [x] BIO-11-BUILD (done) | [x] BIO-11-REVIEW (passed) | BIO-10-REVIEW |
| 12 | Seed Dispersal Designs | Biological Diversity · 26 | [x] BIO-12-BUILD (done) | [x] BIO-12-REVIEW (passed) | BIO-11-REVIEW |
| 13 | Classifying Animal Body Plans | Biological Diversity · 27 | [x] BIO-13-BUILD (done) | [x] BIO-13-REVIEW (passed) | BIO-12-REVIEW |
| 14 | Build an Invertebrate Identification Key | Biological Diversity · 28 | [x] BIO-14-BUILD (done) | [x] BIO-14-REVIEW (passed) | BIO-13-REVIEW |
| 15 | Vertebrate Limb Adaptations | Biological Diversity · 29 | [x] BIO-15-BUILD (done) | [x] BIO-15-REVIEW (passed) | BIO-14-REVIEW |
| 16 | What Affects Transpiration? | Plant Structure and Function · 30 | [x] BIO-16-BUILD (done) | [x] BIO-16-REVIEW (passed) | BIO-15-REVIEW |
| 17 | Which Soils Retain Water? | Plant Structure and Function · 31 | [x] BIO-17-BUILD (done) | [x] BIO-17-REVIEW (passed) | BIO-16-REVIEW |
| 18 | Flower Structure and Pollination | Plant Structure and Function · 32 | [x] BIO-18-BUILD (done) | [x] BIO-18-REVIEW (passed) | BIO-17-REVIEW |
| 19 | Body Size and Heat Exchange | Animal Structure and Function · 33 | [x] BIO-19-BUILD (done) | [x] BIO-19-REVIEW (passed) | BIO-18-REVIEW |
| 20 | Investigating Starch Digestion | Animal Structure and Function · 34 | [x] BIO-20-BUILD (done) | [x] BIO-20-REVIEW (passed) | BIO-19-REVIEW |
| 21 | Investigating Reaction Time | Animal Structure and Function · 35 | [x] BIO-21-BUILD (done) | [x] BIO-21-REVIEW (passed) | BIO-20-REVIEW |
| 22 | Map Your Visual Blind Spot | Animal Structure and Function · 36 | [x] BIO-22-BUILD (done) | [x] BIO-22-REVIEW (passed) | BIO-21-REVIEW |
| 23 | Modeling Blood Glucose Feedback | Animal Structure and Function · 37 | [x] BIO-23-BUILD (done) | [x] BIO-23-REVIEW (passed) | BIO-22-REVIEW |
| 24 | Muscles, Levers, and Movement | Animal Structure and Function · 38 | [x] BIO-24-BUILD (done) | [x] BIO-24-REVIEW (passed) | BIO-23-REVIEW |
| 25 | Pressure, Volume, and Breathing | Animal Structure and Function · 39 | [x] BIO-25-BUILD (done) | [x] BIO-25-REVIEW (passed) | BIO-24-REVIEW |
| 26 | Vessel Diameter and Flow | Animal Structure and Function · 40 | [x] BIO-26-BUILD (done) | [x] BIO-26-REVIEW (passed) | BIO-25-REVIEW |
| 27 | Modeling the Nephron | Animal Structure and Function · 41 | [x] BIO-27-BUILD (done) | [x] BIO-27-REVIEW (passed) | BIO-26-REVIEW |
| 28 | Investigating Immune Memory | Animal Structure and Function · 42 | [x] BIO-28-BUILD (done) | [x] BIO-28-REVIEW (passed) | BIO-27-REVIEW |
| 29 | Early Embryonic Development | Animal Structure and Function · 43 | [x] BIO-29-BUILD (done) | [x] BIO-29-REVIEW (passed) | BIO-28-REVIEW |
| 30 | Investigating Microhabitats | Ecology · 44 | [x] BIO-30-BUILD (done) | [x] BIO-30-REVIEW (passed) | BIO-29-REVIEW |
| 31 | Estimating Population Size | Ecology · 45 | [x] BIO-31-BUILD (done) | [x] BIO-31-REVIEW (passed) | BIO-30-REVIEW |
| 32 | Energy Through a Food Web | Ecology · 46 | [x] BIO-32-BUILD (done) | [x] BIO-32-REVIEW (passed) | BIO-31-REVIEW |
| 33 | Design a Biodiversity Reserve | Ecology · 47 | [x] BIO-33-BUILD (done) | [x] BIO-33-REVIEW (passed) | BIO-32-REVIEW |

## Required review checklist

- **G01 — Learning evidence:** Define the question, two to four learning goals, misconceptions, and observable/written evidence for each goal.
- **G02 — Purposeful controls and repetition:** Justify every condition, control, sample, and trial. Streamline repeated preparation without copying observations or inventing independence.
- **G03 — Scientific accuracy:** Check mechanisms, quantities, locations, conclusions, questions, and model rules against relevant primary/institutional sources. Resolve disputed claims.
- **G04 — Model limits:** Explain simplifications, supplied data, accelerated time, uncertainty, and the limits of conclusions where they matter.
- **G05 — Meaningful interaction:** Students manipulate, measure, classify, or make decisions that cause visible changes and provide evidence of learning. Navigation clicks alone do not pass.
- **G06 — Realistic visuals and geometry:** Review convincing apparatus/specimens and plausible motion at starting, intermediate, and final states. Verify target alignment after resize, scroll, and reload.
- **G07 — Fair choices and hints:** Avoid answers given by order or decoration; preserve biological order and stable per-attempt choices.
- **G08 — Ninth-grade wording:** Review all authored directions, vocabulary, questions, labels, hints, errors, feedback, and handouts. Explain necessary terms. Keep student answers verbatim.
- **G09 — Prediction and checkpoint gates:** Required thinking is explicitly labeled and enforced before the relevant action. Do not reveal the next-step instruction before its prediction/checkpoint.
- **G10 — Correctness and corrective feedback:** Show explicit correct/incorrect status, a scientific explanation, and a usable correction path. Preserve meaningful revisions.
- **G11 — Truthful saving:** Show nearby confirmation only after a successful save; verify repeated completion clicks, denied storage, failure/retry, and honest device/account messages.
- **G12 — Work preservation:** Restore partial/completed attempts, keep stable IDs, preserve prior work, and invalidate stale completion after substantive edits.
- **G13 — Required PDF and print:** Provide completed student PDF download and native print, optional name/period, safe named/unnamed filenames, and readable export date/time/time zone.
- **G14 — Learning-focused reports:** Include actual predictions, data and units/sources, goal-level evidence, corrections, checked answers, original explanations, and model limits rather than a click log.
- **G15 — Report/resource fidelity:** Compare PDF, native print, and structured snapshots. Render short/long, draft/completed reports and handouts; inspect Unicode, fonts, tables, page breaks, and applicable first-offline PDF output.
- **G16 — Accessible interaction:** Check mouse, touch, select/place, keyboard, focus, contrast, reduced motion, target sizes, and phone/tablet/desktop layout. Keep hardware testing separate from emulation.
- **G17 — Meaningful validation:** Run appropriate model, workflow, build, resource/cache, and relevant regression checks. Record actual commands, outcomes, failures/fixes, and artifact paths.
- **G18 — Localization readiness:** Keep authored content translatable with stable IDs and original responses. Document app/report/resource locale needs and actual language availability. Full Spanish/other-language delivery remains future AUD-10 work unless explicitly included and validated.
- **RESOURCES — Student and teacher materials:** Supply matching student worksheets/collector sheets and teacher guidance where appropriate, with reviewed modes, prompts, controls, units, source notes, and limitations. Explain any virtual-only scope.
- **ACCESS — Platform access and release behavior:** Verify guest/free lab access and reports, manual public sharing/favorites, trial/paid teaching features, enrolled-student assignment access, owner previews, immutable versions, and publication controls as applicable. Do not publish production content as a side effect of acceptance.
- **TRACKING — Catalog and curriculum integrity:** Preserve stable IDs and correct units/modes/routes. Update actual implementation/resource records and regenerate/sync dataset outputs only when their sources change. Do not infer standards approval, translated readiness, or whole-course completion.

Review evidence must identify the actual lab/review task, source snapshot, reviewer and date. Each check needs findings and existing artifact/source references. Keep separate workflow, visual, PDF, native-print, test, and resource artifacts. Use synthetic student identities/work for retained evidence; do not commit real student records. Use stable/versioned artifact locations or review records with retained supporting files, rather than an unrecorded live preview.

## Per-lab build briefs

### BIO-01-BUILD / BIO-01-REVIEW — Seed Germination

Stable ID: `seed-germination`. Unit: The Chemistry of Life. Reading reference: 1 — The Study of Life.

Starting purpose from the current catalog: Design a controlled investigation of the conditions seeds need to germinate. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-02-BUILD / BIO-02-REVIEW — Water and Surface Tension

Stable ID: `water-surface-tension`. Unit: The Chemistry of Life. Reading reference: 2 — The Chemical Foundation of Life.

Starting purpose from the current catalog: Compare water droplets and investigate cohesion and molecular interactions. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-03-BUILD / BIO-03-REVIEW — Identify an Unknown Food Sample

Stable ID: `food-macromolecules`. Unit: The Chemistry of Life. Reading reference: 3 — Biological Macromolecules.

Starting purpose from the current catalog: Use indicator tests and controls to investigate biological macromolecules. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-04-BUILD / BIO-04-REVIEW — Natural Selection in Changing Habitats

Stable ID: `natural-selection`. Unit: Evolutionary Processes. Reading reference: 18 — Evolution and the Origin of Species.

Starting purpose from the current catalog: Investigate how food availability affects inherited traits across generations. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-05-BUILD / BIO-05-REVIEW — Genetic Drift and Natural Selection

Stable ID: `genetic-drift`. Unit: Evolutionary Processes. Reading reference: 19 — The Evolution of Populations.

Starting purpose from the current catalog: Compare allele frequencies in populations of different sizes. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-06-BUILD / BIO-06-REVIEW — Build a Phylogenetic Tree

Stable ID: `phylogenetic-trees`. Unit: Evolutionary Processes. Reading reference: 20 — Phylogenies and the History of Life.

Starting purpose from the current catalog: Use morphological and sequence evidence to infer evolutionary relationships. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-07-BUILD / BIO-07-REVIEW — Modeling Viral Spread

Stable ID: `viral-spread`. Unit: Biological Diversity. Reading reference: 21 — Viruses.

Starting purpose from the current catalog: Investigate contact networks and transmission using a model outbreak. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-08-BUILD / BIO-08-REVIEW — Investigate an Unknown Prokaryote

Stable ID: `unknown-prokaryote`. Unit: Biological Diversity. Reading reference: 22 — Prokaryotes: Bacteria and Archaea.

Starting purpose from the current catalog: Combine microscopy and metabolic evidence to classify unknown samples. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-09-BUILD / BIO-09-REVIEW — Protist Structure and Movement

Stable ID: `protist-movement`. Unit: Biological Diversity. Reading reference: 23 — Protists.

Starting purpose from the current catalog: Compare locomotion and cellular structures in microscopic organisms. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-10-BUILD / BIO-10-REVIEW — Fungal Structures and Reproduction

Stable ID: `fungal-structures`. Unit: Biological Diversity. Reading reference: 24 — Fungi.

Starting purpose from the current catalog: Examine fungi and compare their reproductive structures. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-11-BUILD / BIO-11-REVIEW — Moss and Fern Life Cycles

Stable ID: `moss-fern`. Unit: Biological Diversity. Reading reference: 25 — Seedless Plants.

Starting purpose from the current catalog: Trace gametophyte and sporophyte stages in seedless plants. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-12-BUILD / BIO-12-REVIEW — Seed Dispersal Designs

Stable ID: `seed-dispersal`. Unit: Biological Diversity. Reading reference: 26 — Seed Plants.

Starting purpose from the current catalog: Test how seed structures and wind affect dispersal distance. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-13-BUILD / BIO-13-REVIEW — Classifying Animal Body Plans

Stable ID: `animal-body-plans`. Unit: Biological Diversity. Reading reference: 27 — Introduction to Animal Diversity.

Starting purpose from the current catalog: Compare symmetry, tissues, and body cavities using evidence. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-14-BUILD / BIO-14-REVIEW — Build an Invertebrate Identification Key

Stable ID: `invertebrate-key`. Unit: Biological Diversity. Reading reference: 28 — Invertebrates.

Starting purpose from the current catalog: Create and test a branching key using observable traits. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-15-BUILD / BIO-15-REVIEW — Vertebrate Limb Adaptations

Stable ID: `vertebrate-limbs`. Unit: Biological Diversity. Reading reference: 29 — Vertebrates.

Starting purpose from the current catalog: Measure homologous structures and investigate form and function. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-16-BUILD / BIO-16-REVIEW — What Affects Transpiration?

Stable ID: `transpiration`. Unit: Plant Structure and Function. Reading reference: 30 — Plant Form and Physiology.

Starting purpose from the current catalog: Compare plant water loss under different environmental conditions. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-17-BUILD / BIO-17-REVIEW — Which Soils Retain Water?

Stable ID: `soil-water`. Unit: Plant Structure and Function. Reading reference: 31 — Soil and Plant Nutrition.

Starting purpose from the current catalog: Compare drainage and water retention across soil compositions. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-18-BUILD / BIO-18-REVIEW — Flower Structure and Pollination

Stable ID: `flower-pollination`. Unit: Plant Structure and Function. Reading reference: 32 — Plant Reproduction.

Starting purpose from the current catalog: Explore reproductive structures and trace pollination through fertilization. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-19-BUILD / BIO-19-REVIEW — Body Size and Heat Exchange

Stable ID: `body-heat`. Unit: Animal Structure and Function. Reading reference: 33 — The Animal Body: Basic Form and Function.

Starting purpose from the current catalog: Use physical models to relate surface area and volume to cooling. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-20-BUILD / BIO-20-REVIEW — Investigating Starch Digestion

Stable ID: `starch-digestion`. Unit: Animal Structure and Function. Reading reference: 34 — Animal Nutrition and the Digestive System.

Starting purpose from the current catalog: Explore how digestive conditions affect starch breakdown. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-21-BUILD / BIO-21-REVIEW — Investigating Reaction Time

Stable ID: `reaction-time`. Unit: Animal Structure and Function. Reading reference: 35 — The Nervous System.

Starting purpose from the current catalog: Analyze repeated measurements of response time and variability. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-22-BUILD / BIO-22-REVIEW — Map Your Visual Blind Spot

Stable ID: `blind-spot`. Unit: Animal Structure and Function. Reading reference: 36 — Sensory Systems.

Starting purpose from the current catalog: Use visual targets to investigate sensory perception. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-23-BUILD / BIO-23-REVIEW — Modeling Blood Glucose Feedback

Stable ID: `glucose-feedback`. Unit: Animal Structure and Function. Reading reference: 37 — The Endocrine System.

Starting purpose from the current catalog: Track glucose and hormone responses in a feedback model. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-24-BUILD / BIO-24-REVIEW — Muscles, Levers, and Movement

Stable ID: `muscle-levers`. Unit: Animal Structure and Function. Reading reference: 38 — The Musculoskeletal System.

Starting purpose from the current catalog: Investigate how attachment points change the force needed to lift a load. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-25-BUILD / BIO-25-REVIEW — Pressure, Volume, and Breathing

Stable ID: `breathing`. Unit: Animal Structure and Function. Reading reference: 39 — The Respiratory System.

Starting purpose from the current catalog: Use a lung model to connect pressure changes with airflow. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-26-BUILD / BIO-26-REVIEW — Vessel Diameter and Flow

Stable ID: `blood-flow`. Unit: Animal Structure and Function. Reading reference: 40 — The Circulatory System.

Starting purpose from the current catalog: Investigate how vessel size and pressure affect fluid flow. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-27-BUILD / BIO-27-REVIEW — Modeling the Nephron

Stable ID: `nephron`. Unit: Animal Structure and Function. Reading reference: 41 — Osmotic Regulation and Excretion.

Starting purpose from the current catalog: Track filtration, reabsorption, and secretion to explain urine composition. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-28-BUILD / BIO-28-REVIEW — Investigating Immune Memory

Stable ID: `immune-memory`. Unit: Animal Structure and Function. Reading reference: 42 — The Immune System.

Starting purpose from the current catalog: Compare primary and secondary immune responses. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-29-BUILD / BIO-29-REVIEW — Early Embryonic Development

Stable ID: `embryonic-development`. Unit: Animal Structure and Function. Reading reference: 43 — Animal Reproduction and Development.

Starting purpose from the current catalog: Identify cleavage, gastrulation, and germ-layer formation. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-30-BUILD / BIO-30-REVIEW — Investigating Microhabitats

Stable ID: `microhabitats`. Unit: Ecology. Reading reference: 44 — Ecology and the Biosphere.

Starting purpose from the current catalog: Compare environmental conditions and organism distributions. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-31-BUILD / BIO-31-REVIEW — Estimating Population Size

Stable ID: `population-estimates`. Unit: Ecology. Reading reference: 45 — Population and Community Ecology.

Starting purpose from the current catalog: Test mark–recapture estimates and their sampling assumptions. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-32-BUILD / BIO-32-REVIEW — Energy Through a Food Web

Stable ID: `food-web-energy`. Unit: Ecology. Reading reference: 46 — Ecosystems.

Starting purpose from the current catalog: Track energy budgets and compare transfer between trophic levels. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

### BIO-33-BUILD / BIO-33-REVIEW — Design a Biodiversity Reserve

Stable ID: `reserve-design`. Unit: Ecology. Reading reference: 47 — Conservation Biology and Biodiversity.

Starting purpose from the current catalog: Compare habitat protection and connectivity under a fixed budget. Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.

