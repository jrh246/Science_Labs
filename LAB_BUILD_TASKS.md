# Cell and genetics build tasks

The ten-lab release implements chapters 4, 6, 9 and 11–17. Existing stable IDs are preserved, including dna-replication and lac-operon; visible titles now describe extraction and arabinose-controlled expression accurately.

## Release tasks

- [x] Inventory assets, record source-PDF authorship confirmation, and preserve original supplied files.
- [x] Review current handouts and correct outdated photosynthesis teacher instructions.
- [x] Record dependency license metadata and include Vite notices.
- [x] Write original lab definitions, sources, classroom methods and limitations.
- [x] Implement guided equipment preparation, data collection, analysis, and separate exploration.
- [x] Provide classroom endpoint entry, browser persistence, CSV observations and text reports.
- [x] Connect ten labs to the catalog, search, and unit pages.
- [x] Generate ten student worksheets and ten teacher guides.
- [x] Render and inspect PDFs, including existing downloadable packets.
- [x] Complete browser regression and offline checks.
- [x] Record final release verification.

Verification: 35 unit tests, 52 browser tests, and 2 deployment/subpath tests passed. The final build verified 53 offline-cache URLs. All 20 new PDFs and the existing packets were rendered and visually inspected. Development publishes from codex/development to /Science_Labs/dev/; production remains on main. The live deployment.json identifies the deployed revision.

## Build list

| Chapter | Lab | Implemented observation task | Classroom route |
| --- | --- | --- | --- |
| 4 | Cells Under the Microscope | Calibrate, focus, select objective and measure cells in six fields | Plant wet mounts and a prepared animal slide |
| 6 | What Changes Enzyme Activity? | Prepare nine reactions; compare timed gas collection at three temperatures | Potato catalase with gas collection |
| 9 | How Plants Respond to Signals | Track six plants from initial height through seven days | Dwarf peas with GA3 and matched carrier |
| 11 | How Crossing Over Creates New Allele Combinations | Pair homologs, reciprocally exchange segments, separate cells and tally four gametes | Original printable strips; Sordaria retained as an optional extension |
| 12 | Testing Inheritance Patterns | Select ears, mark regions and manually tally 144 kernels; compare a stated 3:1 expectation | Documented monohybrid corn ears |
| 13 | Mapping Linked Genes | Inspect a sorting pad and magnifier; manually tally 96 offspring and calculate recombination percentage | Optional advanced Drosophila testcross or labeled photograph/data route |
| 14 | Extracting DNA from Fruit | Compare nine preparations using an ordinal visibility rubric | Fruit extraction with detergent and blank controls |
| 15 | From DNA to Protein | Compare nine reporter/control reactions using fluorescence | Optional cell-free expression kit with supported controls |
| 16 | Switching Gene Expression On and Off | Observe growth and fluorescence on four control/treatment plates | Optional approved educational reporter cultures or kit |
| 17 | Separating DNA Fragments | Load, run, stain and estimate three unknown bands in two gels | Prepared DNA and classroom electrophoresis equipment |

## Teacher pilot follow-up

These are operational software labs with illustrative models, not experimentally calibrated predictions. Teacher piloting is separate from software completion.

- [ ] Test catalase quantities and gas capacity with the school's extract and apparatus.
- [ ] Confirm microscope calibration, suitable Sordaria specimens and documented corn crosses.
- [ ] Confirm dwarf pea variety, treatment instructions and growth schedule.
- [ ] Choose kit variants, storage and viewing equipment for cell-free and reporter-expression work.
- [ ] Confirm electrophoresis buffer, voltage, staining and time against purchased equipment.
- [ ] Collect classroom feedback on timing, accessibility, worksheets and interpretation.

## Follow-up polish review

- [x] Compare the ten new labs with the original guided preparation, collection, review and exploration flow.
- [x] Add actionable preparation and collection prompts.
- [x] Add mean time-series comparison plots with colored line-style legends; keep classroom data separate and ordinal scores unconnected.
- [x] Summarize all three gel bands and include fluorescence alongside colony counts.
- [x] Align microscope ruler graduations with the selected objective.
- [x] Verify all ten complete workflows, mobile layout, restore/export, offline deployment and production/dev isolation.

Validation: 35 unit tests, 11 new-lab browser checks, 2 deployment checks; production build verifies 53 cached URLs.

## Interactive bench revision

- [x] Replace the primary chapter 11 activity with original chromosome manipulation and printable strips; preserve Sordaria and its saved work as an optional extension.
- [x] Make corn sampling an ear-selection and marked-region investigation, with manual counters and independent pencil marks.
- [x] Give the fly lab a sorting pad, magnifier, inspection marks and manual trait counters.
- [x] Add tool selection and equipment targets to microscope, catalase, plant response, extraction, cell-free expression, reporter plates and gels.
- [x] Animate tool use and preparation; require three mashing/spreading passes and separate loading of each gel lane.
- [x] Preserve keyboard/touch operation, reduced-motion behavior, source-separated data and original student counts.
- [x] Update and render the 22 student/teacher PDFs, including the optional extension.
- [x] Inspect all ten layouts at desktop and 390px width.

Equipment drawings remain original teaching illustrations. Preparation interactions are constrained to the assigned protocol; these are not unrestricted equipment simulators.

Interactive revision verification: 37 unit tests, 13 browser walkthrough/interaction checks, and 2 deployment checks passed. The build verifies 55 offline-cache URLs, including the optional Sordaria handouts. All 22 PDFs were rendered and inspected.

## Classroom pilot follow-up: corn and fermentation

- Corn artwork now uses original rounded, shaded kernels, a tapered cob and husked ear previews; phenotype assignments and tallies are unchanged.
- Rick reported balloon inflation taking longer than 30 minutes. Revised physical stocks use 20 g yeast / 500 mL water and 80 g of either sugar / 500 mL water, or double both masses and water volumes. The target is 20 g yeast + 80 g sugar per 1,000 mL water added, with an explicit distinction from final solution volume.
- Balloon worksheets now offer 0-60 minutes at 10-minute intervals. Volume collectors retain their capacity-limited 0-30 minute schedule. Longer or different schedules remain teacher-selected.
- Physical and virtual recipes are explicitly distinct; the virtual kinetic model was not recalibrated from this single classroom observation.
- All eight fermentation PDFs were regenerated and rendered; targeted corn and resource browser checks passed.
