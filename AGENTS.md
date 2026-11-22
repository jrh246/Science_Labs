# Working on Science Labs

Before designing or changing a lab, read [LAB_DESIGN_GUIDE.md](LAB_DESIGN_GUIDE.md). It records the learning, scientific accuracy, meaningful interaction, visual realism, ninth-grade wording, feedback, saving, and completed-report requirements established during the lab redesigns.

Treat meaningful student interaction, visually realistic and scientifically plausible graphics, and ninth-grade student language as core requirements. Record separate audit evidence for each across the full student pathway.

For an existing lab, also consult [LAB_DESIGN_AUDIT.md](LAB_DESIGN_AUDIT.md). Preserve justified controls and sampling, distinguish confirmed defects from review questions, and update audit findings only when the applicable acceptance checks have evidence.

Preserve existing student attempts and unrelated working-tree changes. Report what was actually tested; do not treat a model test as classroom or real-device validation.

## Curriculum datasets and development checklist

Before planning new course coverage, read data/development-tracker/README.md and data/development-tracker/COURSE_CHECKLIST.md. Curriculum/resource/standards/language records live in data/curriculum/dataset.json. Keep candidate alignment distinct from approved alignment and full-course completion. After dataset changes regenerate the CSV/checklist outputs and use data/sync-project-data.mjs to refresh the shared copies in C:\Users\Rick\Documents\ChatGPT\Science Labs\PROJECT_DATA. Preserve unrelated changes.


## Future app languages and translated printing

Plan new shared UI, labs, and reports for native language selection and translated downloadable/printable materials. Spanish is the first acceptance example; the design must allow other reviewed, published languages. Follow [G18 in the lab design guide](LAB_DESIGN_GUIDE.md#g18) and the future localization contract in ARCHITECTURE.md. Language choice must preserve progress, original student responses, scientific meaning, and stable activity/question IDs. It is part of access to a free lab, not a trial or paid-account prerequisite. Source textbook language metadata does not establish app or PDF translation readiness. This is a required future capability; do not claim it is implemented or language-reviewed without the applicable evidence.


## Sequential Biology build queue

For the remaining planned Biology labs, follow [BIOLOGY_BUILD_TASKS.md](BIOLOGY_BUILD_TASKS.md) and run `npm run biology:queue` before starting or resuming work. Build one lab, perform its separate documented review, fix any failed checks, and record a passing review before starting the next lab. Do not batch-implement later labs, skip dependencies, or mark reviews passed just because tests or the catalog say available. Run `npm run biology:queue:check` and `npm run biology:queue:render` after queue/review changes. Keep external classroom/hardware acceptance and future AUD-10 translation delivery explicit; never convert pending evidence into approval. This process does not add a required user-confirmation pause after each lab.
