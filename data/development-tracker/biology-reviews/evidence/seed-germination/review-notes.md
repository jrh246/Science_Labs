# Seed Germination - BIO-01 development review

Scope: English, virtual-only development acceptance. No production publication, standards approval, physical protocol validation, teacher/student comprehension acceptance, or Spanish delivery is implied. Retained names and responses are synthetic.

## Learning and science

Question: How does water affect the start of seed growth?

1. Design a fair test: student selects the damp/dry assignment, writes changed/measured/matched factors before setup, places the two samples, and preserves that first plan. The checker accepts any nonempty reasoned prediction rather than requiring the modeled outcome.
2. Identify germination: the student inspects and selects seeds with a visible emerged root on days 2 and 5, receives corrective feedback, and compares counts/percentages. A swollen seed without a root does not meet this investigation's observable criterion.
3. Interpret evidence: the student compares the prediction with both conditions and explains matched conditions, the control, and limits. Writing is preserved verbatim and remains ungraded.

Sources read during model design: University of Illinois Extension, https://web.extension.illinois.edu/gpe/case3/c3facts3.html and the joint Florida/Kentucky/Texas A&M teaching resource, https://propg.ifas.ufl.edu/04-seeds/03-germination/04-seedsgermination-germination.html. These support the roles of water, oxygen, temperature and root emergence, not the model's specific counts, 5 mL dose, or five-day schedule. Those choices are clearly synthetic. Swelling can precede emergence. The test does not compare light, seed species, or oxygen conditions.

Two dishes answer different conditions. Ten seeds in each are subsamples, not independent dishes. Two dates follow the same seeds, not two trials. No repeated preparation is required. Repeatability would need new independent dishes. Oxygen limitations, drying and mold are omitted; appropriate temperature and matched light/air are held fixed. Art is enlarged for inspection, not a biological scale measurement. All of these limits appear beside observations and in reports/resources.

## Interaction, visual and language review

Original SVG seeds have shaded coats, pale hila, emerging roots and shadows; dishes have translucent rims and textured dry/damp paper. The root, seed button and specimen number share the same relative container. Tool placement changes the actual destination dish. The same model objects persist across observations/reload. Classification starts empty; neither roots nor percentages silently fill student answers. Trait descriptions provide an observable alternative for assistive technology without labeling seeds as germinated.

Review setup-empty.png, setup-damp.png, day-2.png, day-5.png, phone-seeds.png, tablet-setup.png, mobile-explanation.png. Check dry/damp materials, plausible root origins, clear numbering, no hidden roots, target alignment, text contrast, and meaningful visible changes. Mouse dragging, touch dragging, select/place, keyboard and reduced-motion behavior are separate browser checks. Phone/tablet views are Chromium emulation, not physical-device approval.

The content bundle separates English authored copy and stable goal/question IDs from state and verbatim answers. Directions define germination and control; percentage and cumulative counts are explained beside the results. Student language was reviewed across planning, wrong actions, classification, checks, save/export messages, and handouts. Teacher/student comprehension remains pending. Only English is available; G18 preparation does not certify translated content or language switching.

## Reports, saving and access

PDF, native print and JSON use one immutable report snapshot. Predictions retain actual timing, data identify model-generated specimens and student classifications, corrections are summarized by concept, and complete/draft status follows recorded work. Original observations and attempts remain in the structured snapshot. Optional name and class persist; names are safely included in filenames and readable timestamps include time zone. No grade or submission is inferred.

Representative outputs: draft.pdf, complete.pdf, native-print.pdf, long-offline.pdf, long-native-print.pdf, complete-responses.json, plus the public worksheet and teacher guide. Every PDF page is rendered in the numbered page PNGs and contact sheets. Long responses must retain the final marker; accents and scientific symbols must survive PDF/print/JSON. Review pdf-inspection.json for counts and text checks. Normal line wrapping is normalized only for fidelity comparison, never in student responses.

Completion uses the existing write-result-aware status helper. Successful completion, repeated clicks, reload, identity changes, substantive edits, storage denial/retry and exports during incomplete work are exercised. Standalone registration uses the same root-scoped cache convention as existing labs and is disabled in immutable platform runtimes. The new lab does not change any existing save keys. Guest use and local reports need no account. Favorites, paid/trial teaching entitlements, enrolled assignments, private preview and publication continue through the existing platform policy and manifest; compilation is not authorization to publish.

## Findings retained

- Initial model regression: missing shared learning-rationale entry. Added the explicit dish/subsample/time-series rationale; full model suite rerun.
- Validation tooling: selected Python lacked the documented PDF libraries and Playwright expected a different browser revision. Installed the PDF libraries in the existing isolated validation environment and explicitly selected the already-installed Chromium binary.
- First offline path: missing standalone service-worker registration. Added the same platform-disabled/root-scoped registration as existing labs; first PDF export after offline reload rerun successfully.
- Touch review: generic duplicate-click suppression could swallow the next action. Restricted it to tool clicks and retested drag followed by a clock action.
- Setup rim labels initially obscured specimens. Moved them to the rim and reviewed the revised phone/desktop views.
- First mouse-drag test targeted a dish center outside the viewport. Corrected the test to scroll the target into view, preserving the real geometry check rather than bypassing placement.
- PDF review found a nearly empty page containing the last source. Replaced four repetitive per-observation log lines with one learning-focused correction summary; rerendered reports for review.

Actual command outcomes and source hashes are retained with the evidence and JSON review record. This development review is distinct from external classroom and production acceptance.

Final acceptance checks: 103/103 model/report tests, 24/24 browser tests (six Seed Germination plus library/original-lab regressions), 40/40 API protection tests, 41 resource PDFs verified, standalone cache build and immutable platform build passed. The six Seed Germination checks include ordinary touch, strict touch drag then day-2 tap, resized mouse placement, keyboard/select-place, long/offline PDFs, native print, save denial/retry and failure recovery. Deliberate touch activation now uses movement/cancel guards and duplicate-click prevention; capture is released on the stable root before rerender. All 25 current PDF pages were rendered and visually inspected; completed report is two pages. Production content was not published.
