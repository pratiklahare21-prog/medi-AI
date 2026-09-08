SastaRx
Generic Medicine Price Comparison Platform
Product Requirements Document (PRD)
Version 1.0 · Draft for Stakeholder Review · September 2026
Prepared by: Product Management
Audience: Engineering, Design, QA, Operations, Business Stakeholders
 
1. Document Control
Field	Value
Product Name	SastaRx (working name — see Assumptions)
PRD Title	SastaRx Generic Medicine Finder — Product Requirements Document
Version	1.0
Status	Draft — Pending Stakeholder Sign-off
Document Owner	Product Manager
Date	September 8, 2026
Intended Audience	Engineering, Design (UX/UI), QA, Operations, Compliance, Business/Founders

Revision History
Version	Date	Author	Summary of Changes
1.0	2026-09-08	Product Manager	Initial draft PRD created from product brief

Stakeholders & Approvers
Role	Responsibility	Sign-off
Product Manager	Owns scope, priorities, and requirements	Pending
Engineering Lead	Owns technical feasibility, architecture, delivery	Pending
Design Lead	Owns UX flows, IA, accessibility of the search/compare experience	Pending
QA Lead	Owns test strategy and acceptance validation	Pending
Operations Lead	Owns pharmacy/data partner onboarding and catalog accuracy	Pending
Compliance/Legal	Owns regulatory review of drug-information and advertising claims	Pending
Business/Founder	Owns business model, budget, go-to-market	Pending

Reading Priorities
●	P0 — Required for MVP / launch.
●	P1 — Important; fast-follow after launch.
●	P2 — Desirable; future phase.
 
2. Introduction & Product Vision
2.1 Purpose
This PRD defines the problem, users, scope, requirements, and success criteria for SastaRx, a web application that helps patients find lower-cost generic equivalents of branded medicines. It is the shared reference for Product, Engineering, Design, QA, Operations, and Business teams to plan, build, and evaluate the MVP and subsequent releases.
2.2 Product Vision
Every patient should be able to see, in seconds, whether a cheaper generic version of their prescribed medicine exists and how much they can save — without needing medical or pharmacological expertise to make that comparison safely.
2.3 Product Summary
SastaRx is a web app where a user searches a branded medicine and instantly sees composition-matched generic alternatives, price comparisons across listed pharmacies, and an estimated savings amount.
2.4 Product Scope
This PRD covers product scope, functional and non-functional requirements, user flows, information architecture, data model at a conceptual level, roles/permissions, integrations, analytics, roadmap, and risks for the MVP and near-term releases.
This PRD does NOT cover:
●	Low-level implementation or system design
●	Source code
●	Detailed API contracts
●	Pixel-perfect UI design (wireframes/mockups are a Design deliverable)
●	Database schema, indexes, or query design
 
3. Problem Statement & Market Context
3.1 The Problem
Patients and caregivers: Doctors typically prescribe medicines by brand name. Patients have no easy way to know that a chemically identical generic exists at a fraction of the price, so they default to the prescribed brand at the pharmacy counter.
Caregivers of chronic-illness patients: Long-term medication (diabetes, hypertension, thyroid, cardiac) is a recurring household expense; small per-strip savings compound significantly over months and years.
Pharmacies/partners: Independent and generic-focused pharmacies struggle to reach price-sensitive customers who don't know such alternatives or stores exist.
3.2 Current Problems / Existing Alternatives
●	Asking the pharmacist directly, which depends on the pharmacist's willingness and stock of alternatives.
●	Government generic-medicine store networks (e.g., Jan Aushadhi Kendras in India), which have low public awareness of exact stock and pricing per outlet.
●	General web search, which returns inconsistent, unverified, or outdated pricing and composition information.
3.3 Pain Points
●	User pain: uncertainty about whether a generic is truly equivalent; distrust of unfamiliar brands; inconvenience of comparing across sources.
●	Business pain: keeping a composition and pricing catalog accurate and current is operationally heavy and requires reliable data partners.
3.4 Why Now
Rising out-of-pocket healthcare costs and growing consumer price sensitivity increase willingness to compare before purchase; however, no market-sizing data has been supplied for this PRD. Market validation (survey/pilot data on willingness to switch to generics and expected usage frequency) is required before scaling investment.
3.5 Competitive Landscape
No confirmed competitor research was provided as input, so specific competitor claims are not made here. Expected categories of alternatives include: general e-pharmacy apps with basic generic-alternative labels, government generic-store locator pages/apps, and manual pharmacist consultation. Expected table-stakes for this category: accurate composition matching, transparent pricing, and a simple search experience.
3.6 Product Differentiation
SastaRx's intended differentiation is a single-purpose, comparison-first experience: fast search, composition-verified matches only, and a clear savings figure — rather than a full e-commerce or e-pharmacy checkout flow.
 
4. Goals, Objectives & Non-Goals
4.1 Business Goals
ID	Goal	Target	Timeframe
BG-01	Validate demand for generic-medicine price comparison	1,000 monthly active searchers	Within 3 months of launch
BG-02	Generate initial affiliate/ad revenue	First revenue transaction	Within 6 months of launch
BG-03	Build a trustworthy, accurate medicine catalog	≥95% catalog accuracy (spot-audit)	Ongoing from launch
Assumption: Specific target numbers above are illustrative placeholders pending real market/business planning input; treat as directional, not committed targets.
4.2 Product Goals
●	Let a user find a verified generic alternative to a branded medicine in under 3 searches/clicks.
●	Present price comparisons in a way a non-expert user can understand and trust.
●	Keep the core comparison experience free and frictionless (no signup required to search).
4.3 Non-Goals (This Release)
●	SastaRx MVP will NOT process payments or fulfill medicine orders directly.
●	SastaRx MVP will NOT provide medical advice, dosage recommendations, or prescription verification.
●	SastaRx MVP will NOT offer a native mobile app (web app only, responsive for mobile browsers).
●	SastaRx MVP will NOT support real-time inventory checks at individual pharmacy branches.
 
5. Success Metrics & KPIs
5.1 North Star Metric
Weekly Completed Comparisons — the number of times a user completes a search and views a generic-vs-branded price comparison result. This is chosen because it directly represents the core value moment of the product (a user discovering a potential saving), independent of monetization or retention mechanics that come later.
5.2 Primary KPIs
KPI	Definition	Target	Measurement Method
Search Success Rate	% of searches returning at least one generic match	≥ 85%	Search event logs
Comparison Completion Rate	% of searches that reach the comparison result screen	≥ 70%	Funnel analytics
Avg. Estimated Savings Shown	Average savings amount displayed per comparison	Directional (tracked, no fixed target yet)	Product analytics
Affiliate Click-Through Rate	% of comparison views that click a partner pharmacy link	≥ 10%	Click event tracking
Returning Searcher Rate	% of users who search again within 30 days	≥ 20%	Cohort analysis
5.3 AARRR Framework
Stage	Definition for SastaRx
Acquisition	Visitor lands on SastaRx via search engine, social, or referral
Activation	Visitor completes first medicine search and views a comparison
Retention	User returns to search again within 30 days
Revenue	User clicks an affiliate pharmacy link or views a monetized ad placement
Referral	User shares a comparison result link with another person
5.4 Guardrail Metrics
●	Catalog Error Rate (incorrect composition match) — must stay near zero; this is a safety-relevant metric.
●	Page load / search latency — must not degrade as catalog grows.
●	User-reported inaccuracy complaints — tracked and triaged weekly.
●	Affiliate link failure rate — broken or outdated partner links.
 
6. Target Users & Personas
Persona A — Cost-Conscious Chronic Patient
Attribute	Details
Role/Age	55–70, retired or semi-retired, manages a chronic condition (e.g., hypertension, diabetes)
Context	Refills the same prescription monthly; cost is a recurring concern
Goals	Reduce monthly medicine spend without compromising treatment
Frustrations	Doesn't know which generics are equivalent; distrusts unfamiliar brand names
Needs	Simple, trustworthy comparison; clear explanation of "same composition"
Device/Environment	Mobile browser primarily, sometimes desktop; may need larger text/simple UI
Frequency of Use	Monthly, tied to refill cycle

Persona B — Caregiver for a Family Member
Attribute	Details
Role/Age	30–45, adult child or spouse managing medication for a parent/partner
Context	Manages multiple prescriptions for someone else; price-sensitive on household budget
Goals	Find savings across several medicines quickly; save/share a list
Frustrations	Time-poor; needs fast, mobile-friendly comparisons between errands
Needs	Ability to search multiple medicines and see a combined savings view
Device/Environment	Mobile browser, on the go
Frequency of Use	Weekly to monthly

Persona C — Operations/Catalog Admin (Internal)
Attribute	Details
Role	Internal Operations team member responsible for medicine and pricing data quality
Context	Reviews and updates the medicine catalog, composition matches, and partner pricing feeds
Goals	Keep catalog accurate and current with minimal manual effort
Frustrations	Manual data entry errors; inconsistent partner data formats
Needs	An admin console with search, edit, and audit-trail tools
Device/Environment	Desktop, internal admin web app
Frequency of Use	Daily
 
7. User Stories & Jobs To Be Done
Patient / Caregiver (Primary User)
●	As a patient, I want to search for a branded medicine by name, so that I can see if a generic alternative exists.
●	As a patient, I want to see the exact salt/composition match confirmation, so that I trust the alternative is medically equivalent.
●	As a patient, I want to see a price comparison across available options, so that I can choose the cheapest verified option.
●	As a patient, I want to see an estimated savings amount, so that I understand the value of switching.
●	As a caregiver, I want to save a list of medicines I regularly check, so that I don't have to re-search each time.
●	As a user, I want to share a comparison result with someone else, so that I can help them save money too.
●	As a user, I want to report incorrect information, so that I can help keep the catalog accurate.
Operations/Admin
●	As an admin, I want to add and edit medicine catalog entries, so that the data stays accurate.
●	As an admin, I want to manage partner pharmacy pricing feeds, so that comparisons reflect current prices.
●	As an admin, I want to view flagged/reported entries, so that I can correct catalog errors quickly.
●	As an admin, I want an audit trail of catalog changes, so that I can track who changed what and when.
Business/Partner (Pharmacy or Affiliate)
●	As a partner pharmacy, I want my pricing to be listed accurately, so that I receive qualified referral traffic.
●	As a business stakeholder, I want to see traffic and click-through reporting, so that I can evaluate partner value.
Jobs To Be Done
●	When I'm prescribed a new medicine, help me quickly know if a cheaper equivalent exists, so I can decide before I buy.
●	When I'm refilling a long-term prescription, help me re-check pricing without repeating research from scratch.
 
8. Scope, Assumptions, Constraints & Dependencies
8.1 In Scope (MVP)
●	Medicine search by brand name
●	Composition-based generic matching and display
●	Price comparison across listed partner sources
●	Estimated savings calculation and display
●	Guest usage (no login required to search)
●	Optional account creation to save a medicine list
●	User-submitted data-correction reports
●	Internal admin console for catalog management
8.2 Out of Scope (MVP)
●	Online ordering, checkout, or payment processing
●	Prescription upload or verification
●	Real-time per-branch pharmacy inventory
●	Native mobile apps (iOS/Android)
●	Doctor/clinician-facing tools
●	Telemedicine or consultation features
8.3 Assumptions
Assumption: Product name "SastaRx" is a placeholder pending branding decisions.
Assumption: Target market is assumed to be India, national in scope, given regulatory and generic-medicine terminology used; this should be confirmed.
Assumption: Freemium model assumed to monetize via affiliate commissions and/or display advertising, per stated business model input; exact partner commercial terms are undefined.
Assumption: Composition/pricing data is assumed to come from licensed data providers and/or manually onboarded pharmacy partners, not scraped without authorization.
Assumption: No user medical history or prescription data is assumed to be collected in the MVP.
8.4 Constraints
●	Compliance: Any display of drug information and price comparisons must be reviewed against local pharmaceutical advertising and information-display regulations before launch (jurisdiction-specific legal review required — not performed in this PRD).
●	Data: Product usefulness is directly dependent on the accuracy and freshness of third-party pricing/composition data.
●	Technical: Web-only at MVP; must be responsive across mobile and desktop browsers.
●	Business: Budget, timeline, and team size not specified — treated as open questions.
8.5 Dependencies
Dependency	Type	Description	Impact if Delayed
Medicine composition database	Data	Authoritative source mapping brands to active ingredients/salts	No reliable matching possible — blocks MVP
Partner pharmacy pricing feed(s)	Data/Partner	Pricing data from at least one partner or public source	No comparison values to display — blocks MVP
Legal/compliance review	Process	Review of drug-information display and advertising rules	Launch risk / potential relaunch delay
Hosting & analytics infrastructure	Technical	Web hosting, analytics, error tracking tooling	Delays launch readiness
 
9. Functional Requirements
9.1 Search
ID	Requirement	Priority	Acceptance Criteria
FR-SRCH-01	System shall let a user search for a medicine by brand name using a text input with autosuggest.	P0	Given the user types ≥2 characters of a valid brand name, the system displays matching suggestions within 500ms (network permitting).
FR-SRCH-02	System shall handle searches with no matching results.	P0	Given a search term with no catalog match, the system displays a clear "no results" state with a suggestion to check spelling or contact support.
FR-SRCH-03	System shall support search by partial name and common misspellings.	P1	Given a partial or near-match term, the system returns fuzzy-matched suggestions ranked by relevance.
FR-SRCH-04	System shall log every search query for analytics.	P0	Every submitted search generates an analytics event with query text, timestamp, and result count.
9.2 Generic Matching & Comparison
ID	Requirement	Priority	Acceptance Criteria
FR-CMPR-01	System shall display verified generic equivalents for a searched branded medicine, matched by active ingredient/composition and strength.	P0	Given a valid branded medicine with at least one catalogued generic equivalent, the system displays all equivalents with matching salt composition and dosage strength.
FR-CMPR-02	System shall clearly label the basis of equivalence (e.g., same active ingredient and strength) on the result screen.	P0	Every displayed alternative includes a visible composition/strength match statement.
FR-CMPR-03	System shall display price comparison across all listed sources for the branded medicine and its generic equivalents.	P0	Given at least one priced source exists, the system displays price per unit/pack for each option side by side.
FR-CMPR-04	System shall calculate and display estimated savings (amount and percentage) between the branded medicine and the lowest-priced verified equivalent.	P0	Given both a branded and generic price are available, the system computes savings = branded price − generic price, displayed as amount and %.
FR-CMPR-05	System shall display a disclaimer that users should consult a licensed pharmacist/doctor before switching medicines.	P0	The disclaimer is visible on every comparison result screen and cannot be dismissed permanently.
FR-CMPR-06	System shall handle medicines with no known generic equivalent.	P0	Given a branded medicine with zero catalogued equivalents, the system clearly states no equivalent is currently listed, without implying none exists.
9.3 User Account & Saved Lists
ID	Requirement	Priority	Acceptance Criteria
FR-USER-01	System shall allow account creation via email/password or supported OAuth provider.	P1	Given valid signup details, an account is created and a confirmation is sent to the user's email.
FR-USER-02	System shall allow a logged-in user to save a medicine to a personal list.	P1	Given a logged-in user views a comparison, a "Save" action adds it to their saved list, retrievable on return visits.
FR-USER-03	System shall allow guest (non-logged-in) use of core search and comparison features.	P0	A user can complete a full search-to-comparison flow without creating an account.
FR-USER-04	System shall allow account deletion and associated data removal on request.	P0	Given a user requests deletion, their account and saved data are removed within the stated retention/deletion policy window.
9.4 Data Reporting (User-Submitted Corrections)
ID	Requirement	Priority	Acceptance Criteria
FR-RPT-01	System shall allow any user to flag a comparison result as inaccurate.	P0	A "Report an issue" action is available on every comparison result and submits a ticket to the admin queue.
FR-RPT-02	System shall require a reason/category when a report is submitted.	P1	The report form requires selecting a category (e.g., wrong price, wrong composition, outdated) before submission.
9.5 Notifications
ID	Requirement	Priority	Acceptance Criteria
FR-NOTF-01	System shall send an email confirmation on account signup.	P1	A confirmation email is sent within 5 minutes of successful signup.
FR-NOTF-02	System shall optionally notify saved-list users of significant price changes on saved medicines.	P2	Given a price change exceeds a configurable threshold, an opted-in user receives an email notification within 24 hours.
9.6 Admin — Catalog Management
ID	Requirement	Priority	Acceptance Criteria
FR-ADM-01	System shall allow authorized admins to add, edit, and deactivate medicine catalog entries (brand, composition, strength, manufacturer).	P0	Given valid admin credentials, catalog CRUD actions succeed and are reflected in search within a defined sync window.
FR-ADM-02	System shall allow authorized admins to manage partner pricing entries per medicine.	P0	Given valid admin credentials, price entries can be added, edited, or marked stale, and reflect in comparisons after save.
FR-ADM-03	System shall present user-submitted reports in an admin queue with status tracking (open/in review/resolved).	P0	Reports are visible to admins with status filters and can be updated with a resolution note.
FR-ADM-04	System shall log all catalog and pricing changes with actor, timestamp, and before/after values.	P0	Every catalog/pricing change produces an immutable audit log entry.
9.7 Operations — Partner Onboarding
ID	Requirement	Priority	Acceptance Criteria
FR-OPS-01	System shall support bulk import of medicine and pricing data via a structured file format.	P1	Given a correctly formatted import file, valid rows are ingested and invalid rows are reported with specific errors.
FR-OPS-02	System shall validate imported composition/pricing data against basic sanity rules (non-negative price, known units, required fields).	P1	Rows failing validation are rejected individually with a reason, without blocking valid rows in the same file.
9.8 Reporting (Internal/Business)
ID	Requirement	Priority	Acceptance Criteria
FR-REP-01	System shall provide an internal dashboard showing search volume, comparison completion rate, and top-searched medicines.	P1	Authorized internal users can view aggregated metrics for a selected date range.
FR-REP-02	System shall provide affiliate click-through reporting by partner.	P1	Authorized internal users can view click counts per partner link for a selected date range.
 
10. Edge Cases & Exception Handling
Feature	Scenario	Expected System Behaviour
Search	Empty search submitted	Show inline validation prompting the user to enter a medicine name
Search	No matching results	Show a clear empty state with spelling suggestion and a feedback link
Search	Third-party data source unavailable	Show a service-degraded message; do not display stale prices as current without a "last updated" label
Comparison	Only branded price available, no generic price	Show branded info with an explicit "generic pricing not yet available" state instead of a blank or zero value
Comparison	Multiple generics with different prices	Sort by lowest price by default; allow re-sorting by name/manufacturer
Account	Duplicate signup with existing email	Reject with a clear "account already exists" message and a login prompt
Account	Session expired mid-action (e.g., saving a medicine)	Preserve the intended action, prompt re-login, and complete the action after successful re-authentication
Reporting	Duplicate issue report on the same entry	Accept the report but flag as duplicate in the admin queue rather than silently discarding it
Admin Import	Partial failure in a bulk import file	Import valid rows; return a per-row error report for invalid rows; no silent partial success without a report
Network	User loses connectivity mid-search	Show a retry-capable error state; do not lose the user's typed query
 
11. Key User Flows
Primary Patient/Caregiver Flow
Landing Page → Enter Medicine Name → View Autosuggest → Select Medicine → View Generic Matches & Price Comparison → View Estimated Savings → (Optional) Click Partner Pharmacy Link → (Optional) Save to List / Sign Up
Reporting an Error Flow
Comparison Result Screen → Click "Report an Issue" → Select Category → Add Optional Details → Submit → Confirmation Shown → Report Enters Admin Queue
Admin Catalog Update Flow
Admin Login → Catalog Dashboard → Search/Select Medicine Entry → Edit Composition/Price Fields → Save → Change Logged to Audit Trail → Update Reflected in Public Search (post-sync)
Failure Flow — No Verified Generic Found
Search → Medicine Found → No Catalogued Generic Match → System Displays "No verified generic listed yet" State → Offers "Notify me when available" (P2) or "Report if you know of one" action
Failure Flow — Pricing Data Unavailable
Search → Medicine Found → Composition Match Found → Pricing Feed Unavailable → System Displays Composition Match Without Price, Labeled "Pricing temporarily unavailable" → User Can Still See Equivalence Information
 
12. Non-Functional Requirements
ID	Category	Requirement	Target / Acceptance
NFR-01	Performance	Search results (autosuggest) shall render quickly after input	≤ 500ms server response at P95 under normal load
NFR-02	Performance	Comparison result page shall load within an acceptable time	≤ 2s full page load at P95 on 4G mobile connection
NFR-03	Scalability	System shall support concurrent search traffic at launch scale	≥ 500 concurrent users without degraded response time
NFR-04	Availability	Core search/comparison path shall be highly available	≥ 99.5% monthly uptime for the search and comparison path
NFR-05	Reliability	Catalog/pricing edits shall be applied consistently without partial writes	No partial-update states visible to end users after an admin save
NFR-06	Security	User authentication credentials shall be stored securely	Passwords hashed with a modern algorithm (e.g., bcrypt/argon2); no plaintext storage
NFR-07	Security	Admin actions shall require role-based authorization	Non-admin accounts cannot access catalog management endpoints (verified by access-control testing)
NFR-08	Privacy	User account deletion requests shall be honored within a defined window	Data deletion completed within 30 days of a verified request
NFR-09	Accessibility	Core search and comparison screens shall meet baseline accessibility standards	WCAG 2.1 AA for color contrast, keyboard navigation, and screen-reader labeling on core flows
NFR-10	Compatibility	Web app shall function on major modern browsers and mobile viewports	Latest 2 versions of Chrome, Safari, Firefox, Edge; responsive from 360px width up
NFR-11	Localization	System shall support display of local currency and units	Prices displayed in local currency with correct unit formatting for the launch market
NFR-12	Observability	System shall log errors and key events for monitoring	Centralized error tracking and analytics event logging in place before launch
NFR-13	Resilience	System shall degrade gracefully when a data source is unavailable	Users see a labeled degraded state rather than an application error or stale-as-current data
 
13. Information Architecture & Key Screens
Navigation
●	Home / Search
●	Comparison Result
●	Saved Medicines (account required)
●	Account (Sign up / Login / Settings)
●	About / How Matching Works / Disclaimer
●	Admin Console (internal): Catalog, Pricing, Reports Queue, Analytics Dashboard
Key Screens
Screen	User	Purpose	Primary Actions
Home / Search	Patient/Caregiver	Entry point to search a medicine	Type search, select autosuggest result
Comparison Result	Patient/Caregiver	Show equivalence, pricing, and savings	View details, save, share, report issue, click partner link
Saved Medicines	Registered user	Revisit previously saved comparisons	View, remove, re-check price
Account	Registered user	Manage login and profile	Sign up, log in, log out, delete account
Admin — Catalog	Admin	Manage medicine entries	Add, edit, deactivate entries
Admin — Reports Queue	Admin	Triage user-submitted issues	Filter by status, resolve, add notes
Each screen must define Loading, Empty, Error, Success, Unauthorized, and Offline states during design; detailed visual design is out of scope for this PRD.
 
14. High-Level Data Model
Conceptual relationship: User → SavedMedicine → MedicineEntry → GenericMatch → PriceListing → Partner
Entity	Purpose	Key Relationships	Ownership / Lifecycle
User	Represents a registered account holder	Has many SavedMedicines	Created at signup; deleted on account-deletion request
MedicineEntry	A catalogued medicine (branded or generic) with composition and strength	Has many PriceListings; linked to GenericMatch pairs	Created/edited by Admin; deactivated rather than hard-deleted for audit purposes
GenericMatch	A verified equivalence link between a branded MedicineEntry and one or more generic MedicineEntries	Links two or more MedicineEntry records	Created/edited by Admin, based on composition verification
PriceListing	A price for a MedicineEntry from a specific Partner	Belongs to MedicineEntry and Partner	Refreshed periodically via import/feed; marked stale if not updated within a defined window
Partner	A pharmacy or pricing data source	Has many PriceListings	Onboarded and managed by Operations
SavedMedicine	A user's saved reference to a MedicineEntry/comparison	Belongs to User and MedicineEntry	Created when a user saves; removed by user action or account deletion
Report	A user-submitted data-accuracy issue	Linked to a MedicineEntry or PriceListing	Created by any user; resolved/closed by Admin
Detailed database schema, field-level design, and indexing are intentionally excluded from this PRD.
 
15. Roles & Permissions
Role	Resource/Module	Permission
Guest	Search & Comparison	Read only (no account required)
Registered User	Saved Medicines	Create, Read, Update, Delete (own data only)
Registered User	Reports	Create
Admin	Medicine Catalog	Create, Read, Update, Deactivate
Admin	Pricing / Partner Data	Create, Read, Update, Manage
Admin	Reports Queue	Read, Update (resolve/reassign)
Admin	Internal Analytics Dashboard	Read, Export
Super Admin	Admin User Management	Create, Read, Update, Delete admin accounts; Configure system settings
Sensitive operations — deactivating catalog entries, editing live pricing, and managing admin accounts — are restricted to Admin/Super Admin roles and must be captured in the audit log (see Section 18).
 
16. Integrations & Third-Party Services
Integration	Purpose	Criticality	Failure Impact
Medicine composition/reference data provider	Source of truth for active ingredient and strength matching	Critical	Core comparison feature cannot function accurately
Partner pharmacy pricing feed(s)	Source of comparable pricing	Critical	No price comparison possible; falls back to composition-only display
Email delivery service	Account confirmation, notifications	High	Users don't receive confirmations/notifications; account flows degrade
Web analytics / product analytics tool	Usage tracking for KPIs	Medium	Loss of measurement visibility; product decisions less informed
Error tracking / monitoring tool	Operational reliability	Medium	Slower incident detection and response
Authentication provider (if OAuth used)	Simplified signup/login	Medium	Users fall back to email/password signup only
Assumption: No specific vendor has been named for any integration above; vendor selection is an open decision (see Section 22).
 
17. Analytics & Instrumentation
Event Name	Trigger	Key Properties	Purpose
search_submitted	User submits a medicine search	query_text, timestamp, result_count	Search Success Rate, volume tracking
comparison_viewed	User reaches a comparison result screen	medicine_id, has_generic_match, has_price	North Star metric, Comparison Completion Rate
savings_displayed	Savings amount is shown to user	medicine_id, savings_amount, savings_percent	Value-delivery tracking
partner_link_clicked	User clicks a partner pharmacy link	partner_id, medicine_id	Affiliate CTR, revenue-adjacent tracking
medicine_saved	User saves a medicine to their list	user_id, medicine_id	Retention/engagement tracking
issue_reported	User submits a data-accuracy report	medicine_id, report_category	Data quality monitoring
account_created	User completes signup	signup_method	Activation funnel tracking
Core Funnel
Landing → Search Submitted → Comparison Viewed → Savings Displayed → Partner Link Clicked / Medicine Saved
 
18. Audit & Operational Logging
The following actions require an auditable record capturing who performed the action, what changed, when, on which entity, and (where applicable) why:
●	Admin login
●	Catalog entry creation, edit, or deactivation
●	Pricing entry creation, edit, or removal
●	Generic-match creation or removal (equivalence linking)
●	Admin role/permission changes
●	User account deletion (system-initiated confirmation of completion)
●	Report status changes (open → in review → resolved)
 
19. Release Plan & Roadmap
Phase	Theme	Key Scope	Exit Criteria
Phase 0	Foundations	Data partnerships secured; core catalog seeded; compliance review initiated	At least one composition data source and one pricing source confirmed; legal review kicked off
Phase 1	MVP Launch	Search, composition matching, price comparison, savings display, guest usage, admin catalog management, basic reporting	All P0 requirements met and tested; compliance sign-off obtained; core flows pass QA
Phase 2	Trust & Growth	Accounts, saved lists, user reporting workflow, notifications, bulk data import tooling	P1 requirements delivered; retention and data-quality metrics tracked and reviewed
Phase 3	Scale & Optimization	Expanded partner network, notification-based price alerts, advanced admin/reporting tooling	P2 requirements evaluated and prioritized based on Phase 1–2 learnings
 
20. MVP Definition
The MVP is complete when a guest user can search for a branded medicine, see a composition-verified generic equivalent (if one is catalogued), view a side-by-side price comparison, and see an estimated savings amount — with an accurate, admin-managed catalog behind it and a working user-reporting channel for data corrections.
Must Have (P0)
●	Medicine search with autosuggest and no-results handling
●	Composition-verified generic matching and equivalence labeling
●	Price comparison and savings calculation
●	Medical disclaimer on every comparison
●	Guest usage without login
●	Admin catalog and pricing management with audit logging
●	User issue reporting
Should Have (P1)
●	User accounts and saved medicine lists
●	Fuzzy/misspelling-tolerant search
●	Bulk data import tooling for Operations
●	Internal analytics dashboard
Later (P2)
●	Price-change notifications
●	Expanded partner and geography coverage
 
21. Risks & Mitigations
Risk	Probability	Impact	Mitigation
Composition-matching error leads to incorrect generic equivalence shown	Medium	High	Require verified data sources, admin review before publishing new matches, prominent disclaimer, and a fast-path user-reporting/correction workflow
Regulatory/advertising compliance issue with drug-price display	Medium	High	Legal/compliance review before launch; avoid medical-advice framing; clear disclaimers
Pricing data becomes stale or inaccurate over time	High	Medium	Define data-refresh SLAs with partners; display "last updated" timestamps; flag stale listings
Low initial partner/pricing coverage limits usefulness	Medium	Medium	Prioritize onboarding a small number of reliable, high-coverage data sources before broad marketing push
Users distrust unfamiliar generic brand names	Medium	Medium	Clear, consistent equivalence explanation and trust-building content (e.g., "How matching works")
Affiliate/ad monetization underperforms freemium assumption	Medium	Medium	Track affiliate CTR early; validate monetization assumptions before scaling spend
Scaling search/catalog infrastructure as data volume grows	Low	Medium	Design catalog and search architecture for growth from the outset; monitor performance KPIs
 
22. Open Questions
#	Question	Owner	Needed By
1	What is the confirmed launch geography (single country/state vs. national)?	Business/Founder	Before Phase 0 exit
2	Which composition/reference data provider(s) will be used, and under what licensing terms?	Operations/Legal	Before Phase 0 exit
3	Which pharmacy/pricing partners will be onboarded first?	Operations/Business	Before Phase 0 exit
4	What are the exact affiliate/advertising commercial terms?	Business/Founder	Before Phase 1 launch
5	What legal disclaimers and regulatory approvals are required in the launch market?	Legal/Compliance	Before Phase 1 launch
6	What is the confirmed final product name and branding?	Business/Founder	Before Phase 1 launch
7	What is the data-refresh SLA expected from pricing partners?	Operations	Before Phase 1 launch
8	What budget and team size are allocated to this product?	Business/Founder	Before Phase 0 exit
 
23. Traceability Check
Internal review path: Business Goal → Product Goal → KPI → User Story → Functional Requirement → Acceptance Criteria → User Flow → MVP Phase.
●	BG-01 (validate demand) → Product Goal (fast, trustworthy comparison) → North Star & Search/Comparison KPIs → Patient user stories → FR-SRCH-*, FR-CMPR-* → Primary Patient Flow → Phase 1 MVP. No gap identified.
●	BG-03 (catalog accuracy) → Product Goal (trustworthy equivalence) → Guardrail: Catalog Error Rate → Admin/Reporting user stories → FR-ADM-*, FR-RPT-* → Admin Catalog Flow, Reporting Flow → Phase 1 MVP. No gap identified.
●	BG-02 (initial revenue) → Product Goal is not explicitly stated for monetization beyond KPI tracking — flagged as a minor gap; recommend adding an explicit product goal statement for monetization once affiliate terms (Open Question 4) are resolved.
●	All P0 functional requirements above include testable acceptance criteria and appear within Phase 1 of the roadmap — no priority/roadmap mismatch identified.
 
24. Glossary
Term	Definition
Branded medicine	A medicine sold under a manufacturer's trademarked name
Generic medicine	A medicine with the same active ingredient(s), strength, and intended use as a branded medicine, typically sold at lower cost
Composition / Salt	The active pharmaceutical ingredient(s) that determine a medicine's therapeutic effect
Generic Match	A verified equivalence link between a branded medicine and one or more generic alternatives
Partner	A pharmacy or data provider supplying pricing information to the platform
MVP	Minimum Viable Product — the smallest complete release that delivers the core user value
North Star Metric	The single primary metric best representing the product's core value delivery
P0 / P1 / P2	Priority levels: P0 = required for launch, P1 = important fast-follow, P2 = future/desirable

