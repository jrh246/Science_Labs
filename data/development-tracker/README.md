# Activity development tracking

Start with COURSE_CHECKLIST.md or course-checklist.csv. activity-checklist.csv lists individual activities.

Edit course-plan.json for course targets, owner, priority, scope definition, target count, and notes. Counts and checkboxes are derived from ../curriculum/dataset.json; do not edit generated outputs directly. A target count is not a denominator for percentage completion unless the scope is explicitly reviewed. The Biology target of 48 is the main catalog; two supplementary activities are tracked separately in the activity inventory.

Run node data/development-tracker/refresh.mjs from the repository root after updating the alignment dataset. The script validates unique course IDs and count/check consistency, and regenerates tracker.json, the Markdown checklist, and both CSVs.

Existing course activities require available content, a current course placement, and either an existing catalog association or approved alignment. Reuse candidates count built activities with tentative connections; they do not make a course ready. Planned counts refer to defined catalog entries, not unscoped future courses. Standards approval and whole-course completion are separate; whole-course completion is deliberately not inferred or awarded by this script. Deployment and classroom validation are not checked.

Coverage: all 84 live OpenStax title editions from the public catalog checked 2026-11-14; 37 Core Knowledge primary course rows (Science, Mathematics, Language Arts, History/Geography K-8 and Preschool Language Arts). Separate OpenStax volumes, translations, and editions stay separate to avoid false alignment inheritance. The 45 non-live catalog entries are retained in openstax-catalog-snapshot.json for provenance, not scheduled as build targets. Supplementary Core Knowledge music/art, Core Classics, and regional collections are outside this initial course list.

For future catalog refreshes, recheck the publisher catalog and merge additions/retirements into course-plan.json by stable ID, preserving owner and priority fields. Source availability is independent of our development status. Do not remove work records simply because a publisher retires an edition.

Shared project copies: run node data/sync-project-data.mjs with the project's PROJECT_DATA directory as its argument. The sync copies both datasets and verifies SHA-256 hashes; it does not delete unrelated files. See the project README for the exact local command.


App-language and printable-material readiness are separate from source-resource language/edition metadata. A Spanish publisher edition does not establish that our interface, lab, teacher handout, or completed report is available in Spanish. The planned student selector and independent teacher print-language choice are defined in [G18](../../LAB_DESIGN_GUIDE.md#g18) and AUD-10. Record reviewed implementation evidence before claiming language readiness or course completion. This documentation update does not change dataset statuses, counts, or generated checklist outputs.


## Sequential Biology lab builds

The authored `biology-build-queue.json` tracks the 33 remaining planned catalog labs and their 66 build/review tasks. It is separate from generated course/activity checklists and does not change availability counts by itself. `biology-reviews/template.json` supplies the per-lab evidence record. Run `npm run biology:queue` to see the next permitted task; `npm run biology:queue:check` validates sequence, catalog coverage, and recorded review evidence; `npm run biology:queue:render` refreshes the generated root BIOLOGY_BUILD_TASKS.md. Edit the queue/review sources, not the generated task table. Follow the full workflow and acceptance contract in [BIOLOGY_BUILD_TASKS.md](../../BIOLOGY_BUILD_TASKS.md).


## One-at-a-time user review

`biology-user-review.json` records the user’s own review of all 49 Biology labs, separately from the 33-lab development build queue. Run `npm run biology:user-review` to validate it and `npm run biology:user-review:render` to regenerate the root BIOLOGY_USER_REVIEW.md checklist. Keep at most one active user review; do not check a lab off based on software tests or an agent development review. DNA to RNA to Protein, Osmosis, and the corn inheritance lab were explicitly reported reviewed by the user on 2026-11-15. The bird natural-selection lab is awaiting the user’s recheck after PDF delivery correction.


## Delivery modes and classroom counterparts

`biology-lab-modes.json` is the authored planning assessment for all 49 Biology labs. Current delivery support is read from src/catalog.js (plus the Sordaria extension); candidate counterparts do not change app availability. Run `npm run biology:modes` to validate complete coverage and consistency, and `npm run biology:modes:render` to refresh the root BIOLOGY_LAB_MODES.md and biology-lab-modes.csv. The user review checklist also displays current support and classroom planning. Teacher-reviewed procedures, matching printable resources, actual data provenance and a pilot are required before describing a new variant as classroom-ready. Preserve the user’s three recorded reviews and the active bird-lab recheck.


## Ranked classroom activity shortlist

`biology-classroom-options.json` contains two or three proposed pairings for each of the 49 labs, checked publisher references, original-adaptation labels and virtual-redesign notes. No option is selected or approved. Run `npm run biology:classroom-options` to validate coverage and evidence labels; run `npm run biology:classroom-options:render` to generate BIOLOGY_CLASSROOM_OPTIONS.md, the source-repo CLASSROOM_ACTIVITY_OPTIONS.html review page, and the option-per-row CSV. Scientific background and digital resources may support an original adaptation but must never be labeled as a ready-made physical activity. Keep the existing three user reviews and active bird-lab recheck unchanged.
