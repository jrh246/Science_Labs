# Next labs and downloadable resources

Implementation order: **8. Light and Photosynthesis → 7. Yeast Fermentation and Fuel Sources → 10. Measuring Mitosis**. Numbers are textbook references, not lab titles.

## Initial development release

Each lab includes a prediction/design stage, virtual or classroom data collection selected per treatment/field, common analysis questions, browser progress, a shareable setup link, CSV export, plain-text report download, and print-to-PDF reporting. Original model values and schematic cells are identified as simulated; classroom data remain measured observations. There is no login, protected answer key, automatic grade, or server submission.

| Lab | Virtual investigation | Classroom counterpart | Resources |
| --- | --- | --- | --- |
| Light and Photosynthesis | Three light treatments, three independent trials, 0–20 min observations, ET50 and mean curves | Floating leaf disks using matched preparation and light treatments | Three-page student worksheet; two-page teacher guide |
| Yeast Fermentation and Fuel Sources | Water control, glucose, sucrose; three trials; 0–30 min gas collection and average rates | Matched yeast cultures with gas syringes | Three-page student worksheet; two-page teacher guide |
| Measuring Mitosis | Two original schematic fields, 20 cells each; classification review, tally, percent, assumed duration | Counts from two non-overlapping prepared-slide fields | Three-page student worksheet; two-page teacher guide |

## Worksheet requirements

Student worksheets use the app's questions and treatment names. Include student/date/class fields; hypothesis and design spaces; raw observations; units; virtual/classroom provenance; replicate or sample counts; calculations; graph instructions; evidence-based explanations; limitations. Never embed teacher answers in the student worksheet. The current PDFs are printable, not fillable forms.

## Teacher-guide requirements

Include objectives, preparation/time, materials and relevant safety, classroom procedures, all-virtual and hybrid routes, substitute/absence instructions, model limitations, expected reasoning, troubleshooting, a suggested rubric, reading connections, and public-access disclosure. The guide's example results apply only to the model, not classroom grading targets.

## Resource lifecycle and next steps

1. Publish version-1 PDFs alongside the development labs. Generate them from shared content with `scripts/build-resources.py`; retain the generator and explicit version labels.
2. Teacher pilot: confirm equipment, age level, accessibility, observation times, and class-period fit. Check whether laboratory quantities need adapting locally.
3. Add editable DOCX versions and accessible, fillable PDF worksheets after the pilot stabilizes content; preserve the same activity IDs and table units.
4. Add bilingual or scaffolded versions if requested; track language and support level in resource metadata.
5. When assignments and tracking are built, store content/rubric versions and data provenance with each attempt. Add authenticated teacher resources only when a backend exists; static download URLs are public.

## Verification

Check all six downloads return PDFs, rendered pages have no clipping, student pages omit model keys, names and units match the app, hybrid sources survive refresh/export, and offline downloads work after initial site caching. Scientific models are instructional rather than empirically calibrated. Clinical interpretations of reaction rates or cell counts are outside these labs.

## Student entry and future teacher workspace

Photosynthesis opens directly to the student prediction/design activity; its teacher customization panel and assignment-link builder are removed. The default route is all virtual. Existing hybrid links and saved attempts remain supported so this UI change does not discard classroom work. Other labs retain their current setup pending review of this pattern.

For now, teachers can use the downloadable guide and worksheet to assign classroom components outside the website. No new setup page or login is implied. A separate public Teacher resources page would be an inexpensive interim option, but it would not provide teacher-only access; defer implementing it until requested.

When teacher accounts are introduced, add a Teacher dashboard → Lab library → Customize assignment flow. Teachers select activity modes, instructions, due dates, and assessment settings there, then preview the student view and publish an assignment link. Students open that assignment directly without teacher controls. Persist an assignment ID and content version, enforce teacher authorization on the backend, and preserve virtual/classroom data provenance. Migrate existing URL-based configurations into saved assignments rather than treating URL parameters as access control.
