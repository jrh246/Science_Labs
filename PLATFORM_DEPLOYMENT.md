# Science Labs account platform

The platform uses **Amplify Hosting + a Node API on AWS Lambda/API Gateway + Neon PostgreSQL + Better Auth + Resend**. Stripe Checkout, billing portal, signed subscription webhooks, teacher trials, and owner-provided school licenses are implemented; online payment routes stay disabled until Stripe is configured. No live payments or real emails are used by local tests.

The existing standalone lab build and browser saves remain supported. The new portal is a separate build. It adds owner publishing, teacher workspaces/classes, email invitations, assignments, student cloud progress, authenticated submissions, teacher feedback/scores, PDF/print/JSON review, and school teacher-seat management.

## Run and review locally

Use Node 22 or newer. From the repository root:

```powershell
npm ci
npm ci --prefix server
npm run dev:platform
```

Open `http://localhost:4310/platform.html`. The local owner is `owner@example.test`, password `ScienceLabs!Local2026`. These deliberately public example credentials exist only in the local PostgreSQL database. The API and frontend bind to loopback. The local mode cannot start with a development/production environment name. Never use these credentials or the local secret in a hosted environment.

The local development command builds the current lab sources and registers the latest immutable release before starting the servers. Sign in as owner and open **Development labs** (`http://localhost:4310/platform.html#/development-labs`) to preview all built labs, including unpublished labs. Its build selector also allows review of older registered versions. This view appears only for an owner in local mode; it does not publish content, change access settings, or replace assigned versions.

The main **Lab library** (`/platform.html#/catalog`) has live text search and combined course, unit, lab-format, and sorting filters. Members with teaching access can also filter by access level. Search and filter choices stay in the URL for reloads and shared catalog links. Guests and free accounts see published free labs, while teaching members and owners can also see published member labs. Empty results offer a Clear filters action.

The completed Biology labs have been explicitly published in this working copy’s local database for catalog review. Local registration still does not auto-publish future builds or undo an owner’s publishing choices; hosted environments must be registered and published separately. Existing membership-only access settings and already assigned versions were retained.

Use **Manage publishing** to select a lab version, save its access setting, and publish its lab, unit, and course. All newly registered content starts unpublished. Create separate teacher/student accounts through the real signup forms. **Local email outbox** contains verification, reset, and invitation links; no Resend delivery occurs in local mode. A teacher creates a workspace and class, invites a student email, and assigns a published lab. Students accept with the same verified email, open the assignment, save progress, and submit the completed explanation. Teachers review the submitted snapshot and can provide a score or request revision.

Local mode uses PGlite, an embedded PostgreSQL implementation, with the same SQL migrations and Better Auth code as Neon. State persists under `.platform-local/`; releases are under `.platform-build/`. Stop the API before running local database CLI commands because the embedded database is owned by that process. After changing lab sources, stop and restart `npm run dev:platform` to build and register the new local release. The command refuses to start if either platform port is already occupied. Publication settings, existing accounts/work, and assigned versions are retained. For manual registration with the API stopped, `node server/scripts/local-setup.js --latest` registers only the latest local build; omitting `--latest` registers every local release.

The original `npm run dev` and `npm run build` continue to serve the standalone library. Its footer provides **Download device work**. Students can explicitly import that backup into a matching platform assignment. Importing replaces the cloud draft after confirmation; submitted snapshots are retained. Browser storage does not transfer automatically between domains.

## Environments and domains

Keep development and production separate in all of these places:

| Resource | Development | Production |
| --- | --- | --- |
| Git branch | `codex/development` | Reviewed `main` |
| Amplify branch | Protected development URL | Public site URL |
| API stack | `science-labs-development` | `science-labs-production` |
| Neon | Development project or isolated branch with synthetic accounts | Production database |
| Secrets Manager | Development secret | Production secret |
| Release bucket | Development stack bucket | Production stack bucket |
| Stripe | Test keys and webhook | Live keys only after billing acceptance |

The deployment domain is **prepdrawer.com**. Use `https://prepdrawer.com` for the production frontend and `https://api.prepdrawer.com` for its API. Development uses `https://dev.prepdrawer.com` and `https://api.dev.prepdrawer.com`. The non-secret values and Google callback URLs are recorded in `infrastructure/prepdrawer.environments.json`. Configure `www.prepdrawer.com` as a redirect to the apex if it is used; the application trusts one exact frontend origin per environment. These values prepare deployment; they do not change DNS or create a live site. For deployed cookie authentication, use frontend and API custom domains under the same owned domain, for example `labs.example.com` and `api.example.com`; use a separate development pair. This avoids depending on third-party cookies between an Amplify default domain and an unrelated API Gateway default domain. Set exactly those origins in configuration and CORS. Choose and configure the domain, API certificate, and DNS before treating production login as ready. Resend also requires a verified sending domain; an already verified Resend domain may be used for the sender.

## Neon and backend configuration

Create a separate Neon database/branch per environment. Use its TLS connection string (a pooled endpoint is suitable). The database is accessed only by the API, never with a privileged connection string in browser code. Application authorization checks verified sessions, owner status, teaching-workspace membership, class enrollment, publication state, and licensed access. Migration and owner commands need a trusted operator database connection.

Create an AWS Secrets Manager JSON secret per environment containing strings:

```json
{
  "DATABASE_URL": "postgresql://REPLACE_WITH_NEON_CONNECTION_STRING",
  "BETTER_AUTH_SECRET": "REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS",
  "RESEND_API_KEY": "REPLACE_WITH_RESEND_SENDING_KEY",
  "EMAIL_FROM": "Science Labs <labs@your-verified-domain.example>",
  "STRIPE_BILLING_ENABLED": "false"
}
```

Secret values are never committed. The deployed Lambda reads the secret through its scoped IAM permission. `APP_URL`, `API_URL`, `PLATFORM_ENV`, and the private release bucket are stack configuration. See `server/.env.example` for local settings and optional Stripe price variables. The default teacher trial lasts 14 days and requires no payment card.

Deploy the backend with AWS SAM after AWS credentials, region, origins, certificate, and secret exist:

```powershell
sam build --template-file infrastructure/template.yaml
sam deploy --guided
```

Supply the environment, frontend/API origins, secret ARN, API custom domain, and regional ACM certificate ARN. The template creates the API, Lambda, private/versioned release bucket, scoped permissions, throttling, and access logging without query strings or bodies. Keep the bucket and database when replacing infrastructure.

Export `PLATFORM_ENV`, `APP_URL`, `API_URL`, and `PLATFORM_SECRET_ARN` in your operator shell, then apply migrations:

```powershell
npm run migrate --prefix server
```

`deployment-config.js` reads the secret internally; do not print or paste its contents into command output. Sign up and verify your actual owner email through the hosted site, then elevate that verified account with:

```powershell
npm run owner --prefix server -- your-owner-email@example.com
```

Users cannot choose owner status during signup. Owner grants are environment-specific.

## Build, upload, register, then publish

1. Run `npm run build:platform`. It builds the original lab runtime with platform hooks enabled, computes hashes, and writes an immutable release manifest. The portal output is `dist-platform/`; it contains no standalone lab HTML or resource packets.
2. Set `RELEASE_BUCKET` to this environment's stack output. Run `node scripts/upload-platform-release.mjs` using an operator role with bucket upload/read and secret-read permissions. Uploads use conditional writes and verify existing hashes, then register the manifest in Neon.
3. Connect the Git repository and branch to Amplify Hosting. `amplify.yml` builds the portal. Set branch-specific `VITE_API_BASE_URL` to that environment's API origin. `customHttp.yml` supplies browser headers. The portal uses hash routes, so it needs no broad SPA rewrite that could expose private lab files.
4. Sign in as owner, preview the registered lab, select its production version/access level, and publish it. A lab appears only when its course, unit, and lab are published. New development releases do not change the production selection automatically.

`infrastructure/platform-deploy.yml.example` is a manual GitHub deployment workflow template. Configure AWS OIDC and protected development/production GitHub environments before copying it into `.github/workflows/`. The release bucket variable is populated from the first stack deployment. The actual `platform-checks.yml` workflow runs local model/API/browser checks without AWS credentials.

For later API updates, keep schema migrations additive and compatible with the running version. The example workflow applies those migrations before switching the API code and continues when the infrastructure has no changes, so a lab-only release can still upload and register. Database migrations do not rewrite earlier submissions.

Keep the existing Pages workflow available for the standalone release until the domain cutover is deliberate. If charging for exclusive access to a lab itself, remove its old public hosting/download copies as part of that cutover. An already delivered browser bundle or downloaded PDF cannot be recalled. Paid teaching features and authoritative records are protected by the API.

## Publication and assignment behavior

- Publication is independent of whether a lab is implemented. The existing available/planned catalog status is retained.
- Released files are identified by content hashes. A manifest cannot be overwritten under the same release ID. Source provenance records the base commit and whether the build used an uncommitted working tree.
- Assignments retain their original release. Unpublishing blocks catalog browsing/new assignment creation, while already assigned students retain their work and version. An explicit owner release-disable action stops launches/resources for that version, including assigned access.
- Owner publication changes, version changes, license changes, rollback, and release availability are audited. Publication history can restore a previous state.
- Student work is scoped to user + assignment. Cloud drafts use optimistic revision checks. A conflict keeps the local copy and asks the student to export it before replacing it.
- Submissions are immutable snapshots with a server timestamp, submitting account, assigned release, and late flag. Their readable report sections preserve the assigned version's prompts and model limits. Revising a draft never overwrites an earlier submission. Teacher HTML/PDF review adds the actual account receipt and separately recorded feedback/score. Completion is not an automatic grade.
- Creating an account is free and does not start a trial. An account can explicitly create one teaching workspace, which receives one introductory trial period. Creating another workspace cannot restart that trial. Joining a school uses that school's license. Trial/license expiration blocks creating new teaching work; existing assigned student work and teacher review remain available. School invitations enforce the teacher-seat limit when accepted. Students do not consume teacher seats.
- Private API responses and account pages are not placed in a service-worker cache. Existing standalone offline behavior is retained. In an open platform lab, local work and the warmed PDF engine remain usable after losing connectivity; cloud sync resumes online. Reloading an assigned runtime offline is not implemented, so keep the tab open or download work before disconnecting.

## Stripe activation when ready

Keep `STRIPE_BILLING_ENABLED=false` until products, prices, business policies, and test-mode acceptance are complete. Configure server-side `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the teacher monthly/annual and school annual price IDs. Stripe Checkout shows the actual configured prices; the application does not invent prices.

Register `/api/billing/webhook` with `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. The API verifies raw-body signatures, processes each event once transactionally, retrieves current subscription state, and prevents an older subscription from replacing a newer one. The return from Checkout never grants paid access on its own. Cancellations, active periods, teacher-seat quantities, and the hosted billing portal are handled. Failed payment states do not grant paid subscription access. Test renewal, cancellation, duplicate/out-of-order events, and billing portal changes with Stripe test mode before replacing test keys with live keys.

## Verification and remaining deployment acceptance

```powershell
npm test
npm test --prefix server
npm run build:platform
npm run test:platform:browser
```

API tests exercise actual Better Auth against embedded PostgreSQL, invitation ownership/reuse, publication inheritance, version pinning, access isolation, revision conflicts, immutable submissions, teacher review, closed assignments, expired licenses, and subscription events. API Gateway v2 simulations check login cookies, the subsequent authenticated request, and byte-for-byte binary resource delivery. Browser checks cover real owner/teacher/student sessions, publishing, invitation acceptance, importing existing work, cloud saving across all five lab app families, independent two-tab backups, named offline PDF export, submission, feedback, keyboard access, reduced motion, and phone/tablet/desktop views.

Local validation record (November 12, 2026): 84 model/report tests, 19 API integration tests, and five portal browser scenarios passed. The full existing lab browser suite passed all 137 checks; four targeted lab checks and all 16 standalone report checks were run again after the final report updates. Both builds pass, repeated unchanged platform builds retain the same release ID, the AWS template passes `cfn-lint`, and the production API dependency audit reports zero vulnerabilities. The backend package contains only its application, migrations, scripts, and package metadata. The assigned and submitted PDFs were rendered and inspected for names, verbatim responses, readable page layout, and text bounds.

Local execution does not certify the deployed services. After configuring the accounts/domains, verify Neon TLS/migrations, AWS deployment, same-site cookies/CORS, Resend delivery and reset/invitation links, private bucket access, production/development isolation, and Stripe test-mode checkout/webhook delivery. Retain the teacher/student comprehension and physical-device acceptance items in the lab design audit. No live cloud resources, DNS, real email, or charges were created by this local implementation.

Official references: [Better Auth Express integration](https://better-auth.com/docs/integrations/express), [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql), [cookie configuration](https://better-auth.com/docs/concepts/cookies), [Resend email API](https://resend.com/docs/api-reference/emails/send-email), [Amplify branch deployments](https://docs.aws.amazon.com/amplify/latest/userguide/multi-environments.html), [Amplify headers](https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html), [SAM dependency builds](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-build.html), [API Gateway v2 responses](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html), [Stripe subscription events](https://docs.stripe.com/billing/subscriptions/webhooks).

## Teacher authoring and PrepDrawer deployment — November 13, 2026

The backend uses **Node.js Lambda functions packaged as ZIP archives by AWS SAM**. A container service is not required. The web API handles sessions, drafts, publication, assignments, reports, and billing. A separate Node.js Lambda worker receives OpenAI drafting jobs from SQS, with a 150-second function timeout and a 120-second provider-request timeout. The API returns a job ID promptly; the editor polls its durable status. Queue messages contain a job ID, not teacher text or student work. The queue uses encryption, a dead-letter queue, bounded worker concurrency, and partial-batch failure reporting.

Python scripts in the source repository generate static classroom resources during development. Temporary Python files under `C:\Python_Workspace` are local editing/testing helpers. Neither kind is an HTTP backend dependency. Student report PDFs are generated by the existing bundled browser JavaScript. Amplify receives `dist-platform/`; Lambda receives the separately locked `server/` package. Do not deploy staging helpers, local databases, test output, or development credentials.

Apply migrations `004_teacher_authoring.sql` and `005_ai_suggestions.sql` before deploying the new API. Build/upload/register a runtime with `teacher-lab-overlays-v1`, then select it for a published base lab. Older runtime releases remain available for their existing assignments. The copy endpoint explicitly rejects an older base runtime that cannot render teacher additions.

Teachers use **My labs** to create private copies of published library investigations. This first authoring release supports a title, student directions, two to four learning goals, and up to eight additional questions. Questions have stable IDs and may be required or optional. Teachers can add, edit, or remove those additional questions. The original investigation's core questions, scientific checks, simulation, controls, and visuals remain intact. This release does not generate a new simulation, remove original core requirements, fetch OpenStax sections, or publish teacher content to a community catalog.

Draft saves use optimistic version checks. The teacher previews the saved draft and records a review of scientific meaning, ninth-grade wording, and interaction/visuals before publishing. These are teacher confirmations, not automated scientific or readability certification. Publication creates an immutable revision. Later draft edits or publication do not alter an earlier revision or an existing assignment. Assignment creation can save a private draft or publish immediately; private assignment drafts are hidden from students and cannot launch. The teacher can preview the exact assigned release before publishing it. Closing an assignment retains reports and prevents new student writes.

Teacher directions, goals, questions, verbatim responses, and revision metadata are included with the original learning evidence in PDF, native print, JSON, cloud drafts, and submissions. Required teacher questions must be answered before a complete report can be submitted. A local completion action for the original activity does not submit the combined assignment. Original lab save keys and standalone reports remain compatible.

**OpenAI:** keep `OPENAI_DRAFTING_ENABLED=false` until a server-side `OPENAI_API_KEY` and `OPENAI_MODEL` are configured in the environment's secret. `gpt-5-mini` is a documented example; model access and live response time must be checked with the intended account. Set `OPENAI_HOURLY_LIMIT` to bound requests per teacher (default 10). The hosted stack injects `AI_DRAFT_QUEUE_URL`; never put an API key in a `VITE_` variable. The request uses the Responses API with strict structured output and `store:false`. It sends the teacher's current draft, request, optional pasted reference excerpt, and the original lab's title/summary; the app does not send student progress or responses. The editor warns teachers not to paste student information. Suggestions remain separate from the saved draft until the teacher applies and saves them. Recent jobs can be reopened after leaving the editor. Provider failures leave the draft and published versions unchanged. Local mode uses an in-process development worker; hosted mode uses the durable SQS worker. Live OpenAI and hosted queue acceptance remain pending until credentials/deployment exist.

**Google:** optional sign-in is enabled only when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist on the server. Register the exact callback from the environment map, for example `https://api.prepdrawer.com/api/auth/callback/google`. Use separate development and production clients. The UI hides Google login when it is not configured. Class enrollment remains a separate server authorization check. A Google-only per-assignment policy, automatic roster import, and Classroom grade return are not implemented in this release.

**Sharing:** Copy student link uses the durable `platform.html#/assignment/<id>` route. It preserves the destination through sign-in and still requires enrollment. Do not share a teacher review URL or the temporary user-bound runtime grant URL. On the hosted HTTPS site, Share to Classroom loads Google's official share widget on demand so the teacher can review the post in Google. It does not post automatically or return grades. Localhost sharing is blocked with an explanation because students cannot reach another person's loopback address. Real Classroom posting has not been tested.

**Domain/email setup:** connect the apex and development frontend hosts in Amplify; configure API Gateway custom domains with regional ACM certificates and add the generated DNS records at the domain's DNS provider. Verify `mail.prepdrawer.com` with Resend before using the example sender `PrepDrawer <labs@mail.prepdrawer.com>`; use Resend's exact generated verification records. Domain ownership alone does not configure certificates, API origins, or email delivery. Neon, AWS/Secrets Manager, DNS/certificates, Resend, Google OAuth, OpenAI, and Stripe test-mode acceptance are separate deployment checks. No production resources or DNS were changed by this local work.

Primary references: [AWS Lambda Node.js ZIP deployment](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini), [Google sign-in with Better Auth](https://better-auth.com/docs/authentication/google), [Classroom share widget](https://developers.google.com/workspace/classroom/guides/sharebutton).

Local authoring acceptance: 88 model/report tests and 27 API integration tests passed, including private ownership, stale-draft rejection, immutable revisions, draft-assignment access, pinned teacher questions, and durable/idempotent AI jobs. Seven portal browser scenarios passed, including the complete teacher-to-student workflow, suggestion Apply/Discard/Save using explicit provider fixtures, existing account flows, and responsive views. All 137 existing standalone lab browser checks passed. Six authored PDFs were rendered and inspected across 16 pages after correcting original-lab attribution and the submission-receipt page break. The SAM template passes `cfn-lint`; the production dependency audit reports zero vulnerabilities. The API package dry run contains 27 files with zero Python files and no local environment, test, or database files. Live OpenAI, AWS queue delivery, Google sign-in/Classroom, Resend delivery, Neon, and DNS acceptance remain pending.

## Public labs and optional free accounts

Published labs marked **Free** open at `platform.html#/run?lab=<lab-id>` without an account. The public runtime checks the course, unit, lab, free-access setting, selected release, and release availability on every HTML/resource request. It uses the same immutable hashed files in the private S3 bucket through Lambda. It creates no account, session, runtime grant, teaching workspace, or trial. Private teacher overlays, assignments, rosters, and account work stay behind verified-session and ownership/enrollment checks.

**Copy public link** is available to guests and free accounts in the library. Paste it into a lesson plan, email, LMS, or parent message. Recipients need no sign-in. The link opens the original free lab and includes no answers, class details, private teacher questions, or submission tracking. Students/parents may complete the lab and manually return its named PDF report. Tracked **Copy student link** and Classroom assignment links still require sign-in and enrollment. A class can also copy the original public link when its base lab is currently free; this does not share a private teaching copy.

Free verified accounts can open free labs and keep favorites. Local saves, public links, and downloadable/printable reports remain part of lab access. Cloud practice, teaching copies, classes, tracked assignment management, and AI authoring require an active trial, paid membership, or dated school license. Their navigation and actions are hidden for inactive accounts. Owner administration remains a separate role. Enrolled students can open their sponsored assignments without buying a personal teacher membership. Normal sign-in opens the library; Membership settings provide explicit trial activation or renewal, and signing up never starts a trial.

Guest device work is scoped by lab and immutable release under `science-guest:`; account practice is scoped by user/lab/release, and class work by user/assignment. Reload keeps guest work. Account practice uses optimistic revision checks and retains readable/exportable saved reports after a public version changes or is unpublished. It is never submitted to a teacher automatically. Clearing browser data, using private browsing, or moving devices can remove guest work; download the completed PDF and device-work backup to keep it.

**Save to my account** appears in device-only work only for signed-in active members or the site owner, and explicitly stages that snapshot before importing it. Guest and free-account lab pages do not show account-saving controls. The portal accepts messages only from its active public iframe with a matching origin, source window, lab, version, and bounded payload. The server independently validates storage/report data. Existing account work requires a choice; it is never silently replaced. An older/different lab version is kept for download rather than merged into the current model. Device backups remain intact. Signed-in visitors can open device-only work to recover an earlier guest attempt.

Both public and private platform runtimes use no-store responses and do not register a service worker. An open lab warms its PDF engine for a connection loss. Offline reload is not supported by the platform runtime; the standalone library retains its existing offline behavior.

### Deploying the public-access update

Apply `006_personal_library.sql` before deploying this API. It adds favorites, personal practice drafts, and a practice flag on new runtime grants; existing assignments, reports, grants, and guest/standalone storage are preserved. Build/upload/register a release containing both `public-lab-runtime-v1` and `membership-features-v1`, then select that release for each public free lab under Manage publishing. Publish its course, unit, and lab and set Access to Free. Older releases do not claim guest compatibility. No DNS, provider secrets, Stripe settings, or package/container changes are required by this feature.

Hosted acceptance still requires checking prepdrawer.com / api.prepdrawer.com public iframe delivery, same-site login cookies, favorites across devices, Neon migrations, Resend verification, named guest PDF/print output, publication revocation, and classroom enrollment. Local browser tests do not certify school-managed devices or classroom reading/scientific acceptance.

Local public-access acceptance (2026-11-14): **88 model/report checks, 31 API integration checks, 10 portal browser scenarios, and 137 standalone browser scenarios passed.** Both builds passed; standalone cache verification covered 62 URLs. The initial public-access release was `64ad2bf5804238fef37ddbe6`; the membership-aware update below supersedes it. Browser checks used installed Microsoft Edge, including responsive layouts and keyboard actions, rather than physical school devices.

Guest checks covered all five report families, device reloads, fresh-recipient links without answer transfer, named PDF exports, print controls, first PDF generation in an open offline tab, and failed/repeated device saves with usable backups. Six guest PDFs (16 pages) were rendered and inspected for identity, completion, page bounds, and layout. The initial free-account cloud-save policy was superseded by the membership policy below. Favorites remain free; account practice now requires membership. API checks covered unauthenticated binary delivery through the Lambda adapter, publication inheritance, paid/private boundaries, favorite isolation, unpublished-metadata hiding, stale-save rejection, retained own records, and existing classroom/authoring workflows. No hosted deployment, real email delivery, Classroom posting, or payment was performed.


## Membership-based feature visibility

`server/src/membership.js` computes the authoritative feature projection returned by `/api/me`. Trial, paid subscription, and dated school licenses use the same server entitlement checks; an expired paid period does not count as active. Free accounts show Lab library and Favorites in the main menu. Active members additionally see Saved work, My classes, My labs, and Workspace & billing. My assignments appears only for enrolled students. Owner publishing/license controls remain restricted to platform owners. Membership activation/renewal stays in account settings, and payments remain disabled until configured.

The portal checks these features before rendering protected pages. The API independently gates teaching routes, non-assignment private runtime launches, and live practice reads/writes. Public free-lab requests remain open. Membership expiry retains all stored work. A read-only account archive lets the owner download earlier practice data and report PDFs from Membership settings without re-enabling cloud saving or teaching tools. Existing enrolled-student assignment/report access is retained. No data migration or deletion is part of this policy change; migration 006 is still required for the personal-library tables. Rebuild/upload/register the current runtime and select it for free labs so the iframe also hides inapplicable account-save controls.

Membership update acceptance (2026-11-14): **33 API checks, 10 portal browser scenarios, and 88 model/report checks passed.** Portal and standalone builds passed, including all 62 offline-cache URLs. The current release is `ca5b2786122bf6cba449c69f` with `membership-features-v1`. Older public runtimes are rejected before serving their obsolete free-account controls; assigned versions are retained. API tests used real trial, paid-period, school-license, and expiry dates in PostgreSQL. Browser checks covered actual free signup, favorites across separate browser contexts, explicit trial activation, teaching/account-save controls, student and owner workflows, and a simulated inactive `/api/me` projection to verify hidden menus, blocked pages, archive export, and retained PDF download. Live Stripe/Neon/AWS acceptance and physical school-device checks remain deployment work. No paid access, email, or hosted deployment was activated.


## Staff access and metrics

Staff sign-in is at `platform.html#/staff/login`. It uses the existing Better Auth verified-account session, password reset, trusted origins, and secure hosted cookies. It has no public staff signup or separate password store. Existing site owners have implicit staff access. Other staff first create/verify a normal account; an owner or authorized staff administrator then grants access under **Staff area → Staff & roles**. Staff access does not start a teaching trial or grant paid teacher features. Customer subscriptions do not grant staff access.

No job roles are seeded. Define named roles whenever needed and select technical permissions: `metrics.traffic.read`, `metrics.business.read`, `metrics.operations.read`, `staff.manage`, and `staff.audit.read`. A staff account can have several roles. The dashboard menu and APIs check their permission union. A role with no permissions grants no dashboard data. Archived roles stop contributing permissions; disabling staff access takes effect on the next request, including existing sessions. Role/account edits use revision checks and transactional audit records. A delegated manager can grant/change only permissions they already hold and cannot change their own account access. Platform-owner status remains managed separately through the existing verified-owner workflow. Publishing and license administration remain owner-only; future staff capabilities must be added to the catalog and protected with a server permission check.

Migration `007_staff_metrics.sql` adds separate staff, permission, audit, traffic, and payment-metric tables. It does not alter existing teaching memberships, student work, lab models, or reports. Apply it before updating the API or enabling the scheduled maintenance function. `/api/me` projects staff access separately from customer membership features. Staff dashboard routes live under `/api/staff`; permission checks run on the server independently of menu visibility.

**Traffic:** page views, estimated browser sessions, views per session, single-page session rate, daily UTC counts, popular labs, coarse source groups, and viewport classes. Reporting periods are 7, 30, or 90 UTC calendar days. Counts cover library, public lab, signup, and generic membership page categories. They do not measure learning completion or unique people. Private classroom, staff, invitation, login, and report pages are excluded. Signed-in staff/owners, known bots, opt-outs, Do Not Track, and Global Privacy Control are excluded. Bot filtering and anonymous counts are best-effort, not a trusted financial or assessment event stream.

The browser keeps a random per-tab identifier in session storage, resetting it after 30 minutes of inactivity. Only a daily HMAC is retained on the server. Events contain a category, optional public lab ID, coarse source group, and viewport class. They contain no account IDs, names, emails, raw IP addresses, full URLs, referral URLs, invitation tokens, report text, or student answers. Duplicate event IDs do not increase counts. Trusted-origin checks, schema validation, and rate limits protect ingestion. Short-lived IP rate-limit buckets use daily HMACs; existing authentication security records are separate. Collection failures never block lab access or saving. **Traffic privacy** in the footer provides an opt-out preference. Set `METRICS_ENABLED=false` in server configuration to disable collection; existing aggregate reports remain readable.

**Business:** current/new customer accounts and workspaces, verified accounts, active trials, active subscriptions, dated licenses, subscriptions needing payment attention, published labs, favorites, classes, assignments, and report submissions. Customer/workspace totals exclude owner and staff accounts. Learning totals cover the whole product. Access categories can overlap. These are explicitly labeled totals, period counts, or current states; the app does not infer MRR, profit, churn, or trial conversion from incomplete billing history.

**Payments:** recorded paid invoice amounts, succeeded refunds, and net recorded amounts are grouped by currency and Stripe test/live mode. Totals use integer minor units; currencies and modes are never summed together. Invoice totals use the confirmed paid timestamp; refunds use their creation timestamp and current succeeded status. Invoice adjustments/tax may be included; provider fees are not deducted. Values are payment records, not a full accounting ledger. The summary CSV identifies monetary values in minor units. No historical payments are invented or backfilled.

When Stripe is activated later, retain the existing subscription events and also configure `invoice.paid`, `invoice.payment_failed`, `refund.created`, `refund.updated`, and `refund.failed`. The existing SDK verifies raw-body signatures before metric processing. Payment resources are retrieved under a transaction lock, duplicate event IDs are ignored, and ledger updates are atomic. Resource requests have bounded timeouts. Payment-metric events never grant subscription access. Unknown workspace customers fail processing rather than being attributed to another account. Live billing remains disabled until explicitly configured. Primary references: [Stripe invoice objects](https://docs.stripe.com/api/invoices/object), [refund objects](https://docs.stripe.com/api/refunds/object), [subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), and [currency units](https://docs.stripe.com/currencies).

**Operations:** aggregate email-delivery states, AI drafting-job states, stalled running jobs, environment, and configured feature flags. No recipients, email bodies, draft contents, or student responses are returned. These states do not claim live provider uptime. Dashboard summaries can be exported as CSV.

The SAM template adds a Node.js 22 Lambda ZIP function, `MetricsMaintenance`, scheduled daily at 04:20 UTC. It reads the existing environment secret, connects to Neon, removes traffic older than the retained 90 UTC calendar days, and clears old traffic rate-limit buckets. It does not delete staff audit, financial, account, or lab records. No container service or additional analytics vendor is required. Local/test metrics are synthetic and labeled by environment. Hosted acceptance must verify secure staff sessions, allowed/denied roles, revocation, public collection and opt-out, the retention schedule, and signed Stripe test events before enabling payments.

Staff/metrics acceptance (2026-11-14): **40 backend integration checks, 12 portal browser scenarios, and 88 model/report checks passed.** Both production builds passed; the standalone build verified all 62 cache URLs. `cfn-lint` accepted the SAM template. Staff dashboard layouts were visually reviewed at 1440px and 390px, including readable chart dates. Tests used actual Better Auth sessions and PostgreSQL/PGlite for staff provisioning, privilege boundaries, revocation, role archiving/stale edits, aggregate isolation, traffic deduplication, DNT/GPC/internal-user exclusion, retention, and Stripe retry/out-of-order behavior. Stripe provider calls used fixtures; no live billing or external mail was activated. Existing student/teacher, public-link, named-PDF, print, offline-PDF, favorite, trial, and membership-expiry flows passed the portal regression. No lab runtime files changed; the compatible release remains `ca5b2786122bf6cba449c69f`.

Before hosted rollout: apply migration 007, deploy the API/SAM update (including the daily retention function), and publish the updated portal. Site-owner bootstrap stays unchanged. Verify production staff allow/deny and revocation, browser opt-out and privacy signals, Neon access, the scheduled cleanup, and signed Stripe test events before enabling live billing. No production deployment, real staff provisioning, real email, or charge was performed during local validation. Local test accounts/roles and traffic are synthetic development data.


## Planned language support and localized releases

The agreed future requirement is a native student language selector plus translated downloadable/printable materials, including an English teacher interface that can print Spanish student handouts. Other reviewed, published languages must use the same framework. Language selection is part of free-lab access and must not require sign-in or activate a membership trial. The selector, translated app content, and translated PDFs are not delivered by this documentation update.

Before declaring a language available, publish its reviewed interface/lab/resource coverage, package the matching content/fonts in the immutable release, preserve access checks and existing saves, and verify explicit missing-language fallback. Pin language/translation versions with report and submission evidence, retain original responses, and identify later translated copies. Check responsive/accessibility behavior, localized numeric input, PDF/native print fidelity, and the supported offline pathway. Keep standalone caching and platform offline-reload limitations explicit. New language versions must not silently replace earlier submitted prompts or change scientific behavior.

Use [G18](LAB_DESIGN_GUIDE.md#g18), the future localization contract in ARCHITECTURE.md, and AUD-10 for implementation and release acceptance. Publisher/source-language metadata and English-only validation do not establish translation readiness. No new provider, API key, migration, or deployment is required for this planning change; translation tooling and storage contracts remain future implementation work.
