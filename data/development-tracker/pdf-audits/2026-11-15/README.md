# PDF delivery audit and correction

Recorded 2026-11-15 after the user reported unreadable student and teacher bird-lab downloads. Status: fixed and verified locally.

## Confirmed cause and correction

Both bird PDFs were valid source files, but source-page downloads from port 4310 returned a 436-byte HTML page with a .pdf filename. The portal Vite configuration had disabled its public directory even during local serving. Local previews now serve the public resources, while hosted portal builds still exclude them and retain authorized API delivery. Missing PDF URLs now return 404 instead of index.html. Previously downloaded HTML files need to be downloaded again.

The source and rendered-text check also found four handouts with unsupported glyphs: body heat (worksheet and teacher guide), nephron (worksheet), and surface tension (teacher guide). The generator now uses the pinned licensed DejaVu font for unsupported characters, preserving the science and original wording. Both files in each affected pair were regenerated, hashes updated, and the corrected immutable release selected locally for those three labs. Other publication/access/version choices and assigned releases were retained.

## Actual checks

- 105 static handout PDFs checked through HTTP, including PDF MIME type, signature, and exact source bytes. Missing-file behavior checked separately.
- 103 public-runtime and 105 signed-in runtime PDF responses checked against their selected immutable-release hashes. The enzyme lab retains its existing member-only setting.
- 49 generated report exports checked: 47 fresh drafts and two existing synthetic completed-attempt fixtures for the dedicated genetics/extraction report stages. Initial control-location timeouts were audit-harness assumptions; no change was made to those reviewed lab flows.
- All 154 distinct current PDFs opened in two parsers; all 441 pages were rasterized with installed MuPDF, with no malformed files, unsupported extracted characters, repair warnings, blank text pages, or out-of-page text warnings. Full local renders/contact sheets remain under .platform-build/pdf-audit/. Bird handouts and corrected scientific-notation pages were visually checked and retained here. This is not a claim that every page received a new educational/content review.
- 303 unit/model checks and six focused platform browser checks passed. Standalone and platform builds passed; the hosted portal contains no standalone PDF files.

## Evidence and recurrence checks

See [summary.json](summary.json), [delivery records](delivery-audit.json), [final PDF inspection](pdf-inspection.json), [initial glyph findings](pdf-inspection-initial.json), and [local version changes](corrected-release-selection.json). Actual static-download regressions live in tests/platform/pdf-downloads.spec.js; serve/build isolation is tested in tests/platform-resource-config.test.js. scripts/verify-resources.py now also rejects unsupported extracted glyphs.

Run npm test, the focused platform PDF browser checks, and the resource verifier when changing serving or printable resources. Check downloads through source, public-runtime, and authorized runtime URLs, not only the source files on disk.

## User review remains separate

The user stated that DNA to RNA to Protein, Osmosis, and the genetic corn lab have been reviewed. Only those three are marked reviewed in BIOLOGY_USER_REVIEW.md. The bird lab is still in review, awaiting the user's recheck of the corrected downloads. No additional classroom, hardware, standards, translation, or full-lab user approval was inferred.
