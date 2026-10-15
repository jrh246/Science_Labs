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
| 11 | Observing Crossing Over | Classify 24 ordered asci and estimate gene-to-centromere distance | Prepared Sordaria cross specimens |
| 12 | Testing Inheritance Patterns | Classify 144 kernels; compare a stated 3:1 expectation | Documented monohybrid corn ears |
| 13 | Mapping Linked Genes | Classify 96 offspring; calculate recombination percentage | Optional advanced Drosophila testcross or labeled photograph/data route |
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
