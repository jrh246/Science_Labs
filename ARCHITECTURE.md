# Science Labs library

## Navigation

The Vite build has two entry points. `index.html` hosts the catalog; `lab.html` hosts the existing osmosis investigation. Hash routes work on static hosting and GitHub Pages repository subpaths without server rewrite rules:

- `#/` — landing page
- `#/science` — discipline selection
- `#/science/biology` — eight Biology units
- `#/science/biology/:unitId` — unit investigations
- `#/science/biology/:unitId/:labId` — lab overview
- `#/search?q=...&available=1` — shareable search results

All catalog pages have global search and breadcrumbs. The working lab has return navigation and library search. The service worker caches both HTML entries independently, including offline navigation. The existing lab retains its `cell-lab` browser-storage key so previously saved experiments remain usable on the same origin.

## Content

`src/catalog.js` is the content source: eight units and 47 proposed investigations aligned to Biology 2e. Titles describe investigations; chapter references are descriptive metadata. Only osmosis is available. Planned entries have overview pages but no launch control. Hybrid mode selection is future work, not an existing capability.

Records have stable IDs, subject/unit relationships, type, version, status, supported modes, and launch URL. Add another lab or interactive by adding a record and its standalone entry point; register the entry with Vite. Add subject-level routes when another discipline has real content. Current search indexes lab titles, summaries, units, subjects, and chapter references. Search is browser-side and needs no service.

## Future assignments and reporting

Keep content IDs separate from teacher, assignment, learner, and attempt IDs. An eventual assignment should reference a lab ID and content version, plus teacher-selected activity modes. Each activity will need a stable ID and evidence/assessment definition before hybrid assignments are implemented. An attempt should record activity responses, data provenance (measured, simulated, or supplied), timestamps, and rubric version.

Authentication, authorization, persistent submissions, grading, and reports belong behind a future service interface. Browser localStorage is temporary device progress, not an authoritative student record or grade store. No identity or grade collection is implemented in this branch. Avoid adding fake login controls until the account service exists.

## Validation

Run `npm ci`, `npm test`, `npm run build`, then `npm run test:e2e`. Install Chromium with `npx playwright install chromium` if needed. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an existing Chromium installation. Tests cover catalog integrity, hierarchy, search, planned states, progress preservation, responsive layouts, offline entry separation, and the original lab workflow.
