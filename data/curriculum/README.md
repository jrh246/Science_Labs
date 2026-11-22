# Curriculum alignment dataset

Start with **csv/alignment-view.csv** in Excel for a readable course → activity → resource → chapter/unit → standards view. **dataset.json** is the editable source of truth. The CSV tables are derived exports, not independent copies to maintain.

This is a starter crosswalk, not a complete K–12 curriculum inventory or a certification of alignment. It includes all 48 entries from the current local Biology catalog (15 available, 33 planned), plus two supplementary activities. Other courses are explicitly expansion plans. No new labs or website routes are created by this dataset.

## Coverage

- OpenStax: Biology 2e, 47 chapter records and all local catalog placements. Chapter titles/numbers are transcribed from the local catalog. All 47 direct chapter introduction URLs were fetched and checked for the expected numbered Biology 2e page. Chapter-title verification and section-level connections remain a review task.
- Core Knowledge: selected elementary/middle-school science units; candidate grade 6–8 adaptations of existing biology activities.
- OpenSciEd: four middle-school life-science units, with candidate connections. Choose an insertion point in the storyline before using a supplemental lab.
- Illustrative Mathematics: v.360 grade 7 Probability and Sampling; a proposed corn-inheritance probability connection. Other mathematics courses are shells.
- CommonLit: Edition 2.0 grade 6 units are resource inventory examples. No biology lab is claimed to align with those ELA units. ELA activities and standards mappings remain to be developed.
- Standards: selected NGSS and Common Core mathematics references with partial-support candidates. Washington and Utah have separate placeholders; they have no asserted state-standard matches.

The first snapshot uses the **working tree in C:\Projects\Science_Labs**, including unpublished changes, on 2026-11-14. Availability is catalog status, not a new browser or classroom test. Auxiliary activities were identified in source files and their route/handout inventory needs confirmation before exposing them in new navigation.

## How to interpret status

`source-confirmed` describes resource metadata seen on the provider's official page. It does **not** approve our educational alignment. `catalog-transcribed` means the metadata came from our existing catalog and needs source checking.

`catalog-association` records existing chapter placement. `candidate` means a proposed connection requiring teacher review. `approved` requires a named reviewer and approval date. All standards mappings start as `candidate` and `partial-support`. Read `remainingEvidence` before presenting a match to teachers. A DNA extraction is not a demonstration of DNA replication; fermentation is not interchangeable with aerobic respiration.

The 33 planned catalog labs do not yet receive automatic standards matches based on their titles. Blank standards mean **not mapped**, not “no relevant standard exists.” CommonLit and IM links are not endorsements or claims of certified integration.

## Tables and keys

| Table | Purpose and relationships |
| --- | --- |
| providers | Source organizations and official URLs. |
| courses | Our offerings or expansion shells; subject, grades, status. Grade 0 means kindergarten. |
| activities | Stable local ID, title, current status, mode, source file, route, handouts. |
| courseActivities | Many-to-many placement, including grade-specific adaptation notes. |
| resources | A named textbook/curriculum edition, provider ID, access and reuse notes. |
| courseResources | Candidate/current resource choices for each course. |
| resourceNodes | Chapter/unit/lesson hierarchy through parentId; resource ID, title, number, URL, metadata status. No artificial textbook chapters for unit-based curricula. |
| resourceAlignments | Activity + course + resource node; rationale, scope, status and adaptations. |
| frameworks | Jurisdiction and version; effective dates may be null when not confirmed. State frameworks are distinct from national models. |
| standards | Exact code within a framework, grade range, original short summary and official reference. |
| standardAlignments | Activity + course + standard; evidence rationale and what is still needed. |
| reviewQueue | Explicit omissions, verification work, and expansion tasks. |

`catalog-units.json` preserves the site's eight Biology unit groupings. These IDs belong to the website; they are separate from external textbook/curriculum units.

Array fields in normalized CSVs contain JSON arrays. The readable alignment view uses semicolon-separated grades and standard codes. Source URLs and snapshot dates are preserved in JSON. Null dates mean unknown, not current forever.

## Expand and maintain

1. Add a course or activity using a stable ID. Keep the same activity ID when adding a grade-specific course placement; record scaffolding in courseActivities.
2. Add a provider/resource edition and its chapter, unit, lesson, or text node. Use a new resource ID when the edition changes. A node can have a parent for nested chapters/lessons.
3. Add resource and standard mappings independently. Sharing a textbook topic does not prove coverage of a performance expectation. Verify source metadata, task demands, and student assessment evidence separately.
4. For state standards, create a versioned framework with jurisdiction and effective dates, then add exact state codes. Do not silently substitute NGSS codes for Utah or Washington codes.
5. To approve a mapping, set status to `approved`, add `approvedBy` and `approvedOn` (YYYY-MM-DD), and document the evidence. Update remainingEvidence honestly. Keep edition and framework versions distinct.
6. Update the snapshot date and provenance when refreshing the catalog. Add explicit review items for unverified or obsolete records.
7. Run the commands below after editing JSON; commit JSON and CSV changes together. CSV-only edits will be overwritten.

From the repository root:

```powershell
node data/curriculum/manage.mjs --self-test --export
```

The validator checks unique IDs, foreign keys, course placements, grade ranges, source URL syntax, hierarchy cycles, status values, and approval evidence. Its six negative tests verify that malformed examples are rejected. It does not certify teaching quality, fetch live URLs, or verify standards adoption.

## Sources and reuse

Official reference URLs are embedded in each record. Resource inventories were checked against OpenStax, Core Knowledge, OpenSciEd's scope and sequence and unit pages, AccessIM's v.360 grade 7 scope and sequence, and CommonLit's November 2026 scope and sequence. Standards references point to NGSS and the Common Core standards site. Short standards labels and mapping rationales are original summaries, not copied performance-expectation text.

This dataset links to readings; it does not redistribute textbook pages, illustrations, novels, assessment items, or provider logos. Free access is not the same as permission for commercial reuse. Edition-specific permissions must be checked before importing any source content. CommonLit novel titles do not imply a free copy of the novel is supplied.

## Supported languages (schema 1.1.0)

The readable alignment CSV now places activity language status beside the activity and source language status beside the source link. **csv/language-options.csv** has one row per entity and language, including scope, evidence, review dates, and language-specific links.

Every activity, resource, and resource node has explicit languageOptions; nodes do not silently inherit a provider-wide promise. The languages registry uses BCP 47 identifiers (currently en and es; add regional identifiers such as es-MX when appropriate). Add new languages without duplicating the activity or its alignments.

Statuses: available = linked content available in that language; partial = only the specified components/supports; unverified = availability unknown; planned = future work; draft = unpublished translation; retired = no longer offered. An English planned activity is still planned, not published. A Spanish source does not make our corresponding activity Spanish.

Local activities currently have English content (or planned English content) and planned Spanish localization. translationWorkflow records the future teacher preview/export plan; it does not implement a translation button or service. Future machine-assisted output must remain labeled as a draft until teacher review. Review instructions, scientific terminology, labels, feedback, handouts, and accessibility text; keep stable activity IDs and standards codes unchanged. Record reviewedBy/reviewedOn and an actual language URL before marking a translation available.

OpenSciEd's publisher reports Spanish student materials; teacher-guide coverage is not assumed. AccessIM's grade 7 Spanish selector is recorded with limited scope. CommonLit has Spanish vocabulary supports; its separate Spanish library retired July 1, 2026, so a complete Spanish 360 curriculum is not claimed. The Spanish availability of the exact OpenStax Biology 2e and Core Knowledge units remains unverified. Evidence URLs and checks are in languageOptions.

Regenerate with the same manage.mjs command. Ten negative tests now include unknown/duplicate languages, missing published links, and unreviewed translated releases. No third-party content is translated or republished by this metadata change.
