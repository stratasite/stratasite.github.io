# Strata — Product, Market & Competitive Brief

> **Purpose of this document.** A reusable ground-truth context file for building the marketing site, generating sales decks, and seeding fresh AI conversations. It separates **confirmed product facts** from **strategic opinions** (clearly labeled), and ends with **claims to handle carefully** so nothing here becomes marketing copy that can't be defended. Capabilities reflect the competitive landscape as of mid-2026; competitor features evolve, so re-verify before publishing comparisons.
>
> **Terminology note:** Strata uses **"measure"** (never "metric"). This document follows that convention throughout.

---

## 1. One-line positioning

**Strata is a high-performance, AI-safe self-service analytics platform** — a governed semantic layer fused with a beautiful-by-default dashboarding experience — that lets non-technical users and AI agents ask broad, cross-domain questions over a messy data warehouse and get fast, correct answers, while routing queries across multiple engines (Snowflake, ClickHouse, Druid, Databricks) and aggregate tables for speed and cost.

**Elevator pitch.** Most semantic layers force data engineers to hand-configure every queryable combination, and most break or return silently wrong numbers when you blend measures from different fact domains at different grains. Strata makes the semantic model emerge from a registry of freely-named fields instead of heavy configuration, blends across fact domains automatically and safely, federates queries to fast OLAP "hot tiers" and aggregate tables, and ships its own opinionated, beautiful self-service dashboards — so users and agents self-serve without a BI tool in the middle. The architecture has run in production at Netflix scale for 4+ years.

---

## 2. The problems Strata solves

1. **Grain mismatch breaks cross-domain analytics.** Measures live at different granularities across fact domains. Naive tools either refuse valid cross-domain questions or silently join facts and double-count, producing confident wrong numbers. This is the #1 reason "AI agent over the warehouse" projects fail.
2. **AI agents can't safely write their own SQL.** Against a messy 100+ table warehouse with inconsistent modeling, an LLM guessing joins and tables produces plausible, wrong results. Accuracy has to be a structural property of the system, not a hope about the model.
3. **Configuration burden.** Incumbent semantic layers (Cube views, Looker explores) require engineers to author every blendable combination and every dashboard, creating a combinatorial maintenance load.
4. **Performance & cost as AI adoption deepens.** Every dashboard refresh and every agent turn hits warehouse compute. Agents fire many queries per task, so multi-second query latency compounds and kills adoption — while warehouse credits burn on repetitive hot-data queries.
5. **Messy warehouse onboarding.** Inconsistent dimensional modeling, partial conformed dimensions, ~100 tables in a core domain — expensive and slow to model by hand.
6. **Self-service that's neither self-service nor beautiful.** Traditional BI either overwhelms users with configuration or produces inconsistent, ugly output. Strata makes good-looking, correct self-service the default.

---

## 3. How Strata works (confirmed product facts)

### 3.1 Semantic field registry & modeling by naming
- Strata has a **semantic field registry** containing **both dimensions and measures** (collectively, "fields").
- Fields **can be derived from physical column names, but the modeler is free to choose any name they want.** Strata is **not** tied to native column names — the registered semantic name is the modeler's choice and is decoupled from the underlying schema.
- Blending across facts works through **consistent naming of conformed fields**: when the same business concept is given the same registered name across fact domains, Strata treats those fields as conformed and blendable. The convention is about *consistent semantic naming*, not about matching raw column names.
- **Distinct concepts get distinct names** (e.g. "Caller Country" vs "Ship Country") so they are treated separately and never silently merged. This is where the human modeler applies prior knowledge.

### 3.2 Automatic cross-fact blending (drill-across)
- For a valid multi-measure request across conformed dimensions, Strata decomposes into one subquery per fact, **aggregates each fact independently to the common grain, then stitches results with a full outer join on the conformed dimension keys** (never row-level fact-to-fact joins, which would fan out and double-count).
- **Compatibility is derived, not configured.** Each measure resolves to a source fact, that fact's grain, and reachable dimensions; from these Strata derives a compatibility matrix that determines what is answerable.
- Invalid combinations (a measure requested by a dimension its fact can't reach) are **refused before execution with an explanation and nearest-valid alternatives**, rather than returning a wrong number.

### 3.3 Blending groups & `extended_blending_refs`
- A **blending group** is an explicit, governed assertion that differently-named entities represent the same blend key. `extended_blending_refs` is a label that lets all entities mapped to the same blending group join together even though their names are heterogeneous.
- This is the controlled way to unify fields that *should* blend but don't share a name.

### 3.4 Role-playing dimensions & dates
- Each date can have its own role (e.g. order date, ship date, invoice date), and a table can also map a common **"Date"** used for blending across all date-conformed measures.
- Snapshot handling: declare `snapshot: beginning/ending` on a measure, plus a table-level `snapshot_date: Date` pointing to the date dimension the table is snapped by.

### 3.5 Measure types & aggregation
Aggregation is defined at the model/table level. Strata offers these kinds of measures:
- **Standard** — a simple SQL aggregation query (e.g. `sum(revenue)`).
- **Complex** — a measure formula that references other measures and dimensions.
- **Snapshot** — point-in-time / semi-additive measures that must not be naively summed across time (via `snapshot: beginning/ending` + table snapshot date).
- **LOD (inclusion / exclusion)** — measures that selectively include or exclude dimensions from the group-by or filter; an entire hierarchy can be excluded easily. (This is the Tableau FIXED/EXCLUDE concept lifted into a governed semantic layer — rare among competitors. Powers % of total, share, fixed denominators, etc.)
- **Ad-hoc calculation creator** — users can derive brand-new measures **and dimensions** on the fly through Strata's calculation creator, without engineering.

**One-click measure transforms.** From any measure, users can one-click generate **year-over-year** versions, **moving averages**, and **percent-to-total** calculations.

### 3.6 Performance architecture: aggregate-aware + federated OLAP hot tiers
- **Aggregate-aware:** Strata routes queries to pre-aggregated tables when they can satisfy the request, avoiding base-fact scans.
- **Open OLAP / federation:** additional data sources (ClickHouse, Druid, other fast OLAP DBs, Databricks) can be mapped into the same project. A source/model can be designated a **hot tier** — chosen preferentially.
- **Partition-aware routing:** partition logic makes the semantic model aware of the data range each source holds, so it **routes to the hot tier only when user filters are compatible**, and falls back to the warehouse (e.g. Snowflake) otherwise.
- **One measure definition serves every engine** — no double modeling across sources.
- Net effect: sub-second dashboards/agent responses from hot tiers and aggregate tables, plus reduced load and compute cost on the warehouse of record.

### 3.7 Security
- **Row-level security** with both **masking** and **auto-filtering** of data, built in.

### 3.8 Self-service & dashboarding — "beautiful by default"
- **Strata is the self-service powerhouse — used in addition to, or to replace, existing BI tools.** It is **not** a headless layer behind a BI tool. **Strata cannot and does not sit beneath a BI tool like Power BI/Tableau/Superset; there is no interface between Strata and those tools.** Strata *is* the consumption layer.
- **Convention over configuration, even for design.** Strata's dashboarding philosophy is *beautiful by default*: it deliberately limits flexibility (colors, layout) and gives only minimal options, so output is consistently good-looking without fiddling.
- **Reports & views.** A user creates a **report** made of multiple **views**. Each view can render **auto, full width, half width, or 1/3 width**; the **layout engine handles the rest** of the arrangement.
- **AI-native editor.** AI is sprinkled throughout the view editor to improve usability. Example: in the filter drop zone a user can **type a sentence in natural language instead of searching for a field**, and ask for **AI resolution** to the right field/filter.
- **Instant feedback** as a query/view is built (per-keystroke validation/preview) — something no traditional BI tool does. This same interactive-validation interface is structurally an **agent API** (validate partial query → compatible next steps → structured rejections), which is why Strata suits AI agents as well as humans.

### 3.9 Proven at scale
- The architecture (a version of what's described here) has **run in production at Netflix for 4+ years**, battle-tested for performance at scale. Strata is an independent implementation built from that prior experience, with enhancements. (See "Claims to handle carefully" re: how to phrase this.)

---

## 4. Key differentiators (the thesis)

- **Convention over configuration, end to end.** From the semantic model (freely-named fields in a registry, conformed by consistent naming) to blending (automatic drill-across) to *dashboard design itself* (beautiful-by-default layout engine). The model still exists, but it's expressed in the cheapest medium instead of the most expensive (per-combination views, per-dashboard pixel config).
- **Grain-safe by construction.** Users/agents never need to know grain details; the compiler and validator make it *impossible* to violate them. Default failure mode is a *missed blend* (safe), never a *silent wrong answer* (dangerous).
- **Performance: aggregate-aware + federated multi-engine with partition-aware hot-tier routing.** Routes to pre-aggs and purpose-built OLAP engines, rather than managing rollups inside one tool.
- **Full self-service + dashboarding, not headless.** Strata replaces/augments BI rather than feeding it — one product from warehouse to beautiful dashboard.
- **AI-native throughout** — natural-language field/filter resolution in the editor, structured agent API, grain-safe retrieval.
- **Expressiveness:** five measure types (Standard, Complex, Snapshot, LOD, ad-hoc) plus one-click YoY / moving average / percent-to-total transforms.

---

## 5. Competitive landscape & comparison

Strata spans two categories at once: it is a **semantic/retrieval layer** (vs Snowflake semantic views, dbt Semantic Layer / MetricFlow, Cube) **and** a **self-service + dashboarding product** (vs Looker, Tableau, Power BI, Preset/Superset). It does not integrate with external BI tools — it augments or replaces them.

### 5.1 Capability comparison

| Capability | Strata | Snowflake semantic views | MetricFlow | Cube | Looker |
|---|---|---|---|---|---|
| Cross-fact blending | Automatic (naming + blend groups) | Join-based; same-name dims break the view | Semi-auto via entities | Authored views | Merged results |
| Performance architecture | Aggregate-aware + federated OLAP tiers | Warehouse-native (Snowflake only) | Warehouse-bound | Managed pre-aggregations | PDTs / agg awareness |
| Partition-aware hot-tier routing | Native | No | No | Partial | Partial |
| Warehouse independence | Any engine | Snowflake only | Multi | Multi | Many dialects |
| RLS & masking | Built in | Native, strong | Via warehouse | Built in | Built in |
| Measure expressiveness (LOD + snapshot + complex + ad-hoc) | Leads (5 measure types) | Autopilot modeling; semi-additive native; LOD limited | Partial | Weak | Weak |
| Built-in self-service & dashboards | Yes — beautiful by default | No (needs a BI tool) | No | No (headless) | Yes (full BI) |
| Interactive query-build feedback | Per keystroke + AI-assisted | No | No | No | Partial (Explore UI) |
| External BI integration | None — Strata is the self-service layer | Strong (XMLA → Power BI, Excel) | Growing | Broad | Self-contained |
| Battle-tested at scale | 4+ yrs, Netflix scale | GA 2026, new | Proven | Proven | Proven |

### 5.2 Notes per competitor

- **Snowflake semantic views** (most strategically important; GA for SQL querying early 2026). Strengths: native (already where the data is), strong inherited RLS/masking, fast-growing BI reach (AtScale XMLA), deeply agent-native (Cortex Analyst/Agents), grain introspection via `SHOW SEMANTIC DIMENSIONS FOR METRIC`, AI-assisted "Semantic View Autopilot" modeling. Structural limits vs Strata: **Snowflake-only (no hot-tier federation), no built-in self-service/dashboards, and blending is explicit-relationship-based — two same-named dimensions from different tables break the view** (the exact inverse of Strata, where a shared name = conformed). Supports `NON ADDITIVE BY` (semi-additive) and a narrow window-function exclusion (`PARTITION BY EXCLUDING`).
- **dbt Semantic Layer / MetricFlow.** Closest in spirit on the semantic side — name-based entity linking and aggregate-then-join across models — but requires per-model YAML, is headless (no dashboards), and warehouse-bound. Most likely incumbent to drift toward Strata's modeling approach; durable edge is the *combination* (free-named registry + auto-blend + 5 measure types + federation + agg-awareness + built-in beautiful self-service + AI-native).
- **Cube.** Strong managed pre-aggregation/caching; broad BI/API ecosystem; headless (no native dashboarding). High configuration burden (cubes + views), weak LOD/snapshot expressiveness. Strata also is aggregate-aware *and* federates *and* ships its own consumption layer.
- **Looker.** The closest full-stack analogue (semantic layer + BI). Mature, self-contained, strong security; but LookML configuration fatigue, awkward multi-fact handling (merged results), weak LOD/snapshots, no multi-engine hot-tier federation, and a "configure everything" design philosophy vs Strata's beautiful-by-default.
- **Preset / Superset, Tableau, Power BI** (BI/self-service incumbents). Strata competes for the self-service + dashboarding use case and does **not** connect to them; it is used alongside or in place of them.

### 5.3 The sharpest one-liner vs the key competitor
> In Snowflake, two dimensions with the same name from different tables **break** the semantic view. In Strata, that same shared name **is** the signal that they're conformed and safely blendable. Opposite philosophies — and Strata's is built for messy, multi-domain, multi-engine reality.

---

## 6. Target market / ICP

- Companies with **messy, large warehouses** (many fact domains, inconsistent/partial conformed dimensions) needing governed analytics.
- Organizations **deepening AI/agent adoption** over their data, where query-tier latency and correctness are becoming adoption blockers.
- **Snowflake-centric** shops feeling compute cost and dashboard/agent latency pressure (prime wedge: add a ClickHouse hot tier + aggregate awareness on top of their warehouse — Snowflake stays system of record — and give users a faster, more beautiful self-service experience than their current BI tool).
- Teams wanting **self-service that's correct and beautiful by default**, and to **reduce data-engineering modeling and dashboard-building burden**.

---

## 7. Market position & strategic thesis (strategic opinion)

- **Position:** "The AI-safe, self-service analytics powerhouse" — a single product spanning governed semantic layer + beautiful self-service dashboards, for both humans and agents. Strata replaces or augments the BI tool rather than feeding it.
- **Timing advantage:** the interactive-feedback + NL-resolution UX *is* an agent-ready interface. The 2026 agent moment makes a self-contained, agent-native consumption layer compelling, where a decade of headless-layer-feeding-BI was the norm. The window is real but narrowing as incumbents add agent interfaces.
- **What to stop claiming:** anything Snowflake now does natively (basic governed measures for agents); and any framing that implies Strata plugs into Power BI/Tableau (it does not).
- **What to lean into:** messy multi-source reality + aggregate-aware federation + auto-blend by convention + 5 measure types + beautiful-by-default self-service + AI-native UX.
- **Defensible moat:** federation + the free-named-registry convention model + the full beautiful self-service experience are architecturally hard for a single-warehouse or headless product to copy. Build the moat there, not on closeable feature gaps.

---

## 8. Messaging & positioning guidance

**Hero messages**
- "High-performance, AI-safe self-service analytics for users and agents."
- "Ask broad, cross-domain questions — get fast, correct answers — without a million semantic views."
- "Beautiful dashboards by default. Less burden on data engineers, higher performance for users."

**The single best line (use it)**
> As AI adoption deepens, query-tier latency becomes an adoption problem. 5+ seconds per agent turn quietly kills usage. Strata takes that to sub-second — and lowers warehouse compute at the same time.

**Warehouse-complement framing (accurate version)**
> Strata sits on top of your warehouse (Snowflake stays the system of record) and adds a fast OLAP hot tier plus aggregate awareness. It is your self-service + dashboarding layer — used alongside or in place of your existing BI tool. (Strata does not connect to or sit beneath BI tools like Power BI or Tableau; it replaces that layer.)

**Forward-friendly one-liner**
> Strata is a federated, AI-safe self-service analytics platform that fronts your warehouse with a ClickHouse hot tier and aggregate awareness — sub-second dashboards and agent turns, lower warehouse compute, one measure model across engines, beautiful by default, proven at Netflix scale.

**Proof/credibility:** Netflix-scale, 4+ years in production (as a scale descriptor — see §9).

---

## 9. Claims to handle carefully (read before writing any external copy)

1. **Netflix / prior-employer IP.** Strata is "architecturally similar, built from prior experience, with enhancements." **Get legal counsel** on clean-room independence and prior IP/invention agreements before publishing code or strong claims. Phrase the proof point as a **scale descriptor** ("production-proven at Netflix scale") rather than a claim about a specific employer's internal system. Note Netflix has its own OSS semantic-layer work (e.g. DataJunction) — be ready to articulate how Strata differs. *(Not legal advice.)*
2. **Cost-savings claims ("lower warehouse bill").** Workload-dependent — only true when a meaningful share of traffic is repetitive queries over recent/aggregated data a hot tier or agg table can absorb. Frame as "size the savings against your query patterns," ideally proven live with their query history. Don't promise specific percentages.
3. **"Never get a wrong number" / absolute correctness.** An absolute a technical evaluator will test. Prefer "grain-checked; refuses invalid combinations" / "grain-safe retrieval." Back it with a golden-query correctness suite as the real guarantee.
4. **Competitor capabilities evolve.** Snowflake semantic views (esp. modeling/BI) and MetricFlow are improving quarterly. Re-verify the comparison table before each publish; build positioning on architecture (federation + agg-awareness + convention model + full self-service), not on closeable feature gaps.
5. **Convention quality is a human dependency.** Naming discipline matters: the modeler must give the same concept the same registered name to enable blending, and distinct concepts distinct names to keep them safe. Don't oversell "zero modeling" — it's "modeling by naming," with free choice of names.
6. **No BI integration is intentional, not a gap.** Never imply Strata feeds or embeds into Power BI/Tableau/Superset. Strata is the consumption layer.

---

## 10. Glossary (for consistent copy)

- **Measure:** an aggregated quantity (Strata's term; never "metric"). Types: Standard, Complex, Snapshot, LOD, plus ad-hoc-created.
- **Semantic field registry:** Strata's registry of freely-named dimensions and measures; names are the modeler's choice, optionally derived from columns but not bound to them.
- **Grain:** the level of detail one row of a fact represents (e.g. one call, one order line).
- **Conformed dimension:** a dimension usable consistently across multiple facts (e.g. Date, Country) — in Strata, signaled by a shared registered name.
- **Drill-across:** answering a multi-fact query by aggregating each fact independently to a common grain, then full-outer-joining on conformed dimension keys.
- **Blending group / `extended_blending_refs`:** an explicit mapping that lets differently-named entities be treated as the same blend key.
- **LOD (level of detail) include/exclude:** controlling which dimensions enter a measure's group-by/filter (enables % of total, share, fixed denominators, hierarchy exclusion).
- **Snapshot / semi-additive measure:** a measure that can't be naively summed across time (balances, inventory, headcount); handled via snapshot beginning/ending + table snapshot date.
- **Measure transforms:** one-click YoY, moving average, percent-to-total derived from a base measure.
- **Aggregate-aware:** routing a query to a pre-aggregated table when it can satisfy the request.
- **Hot tier:** a fast OLAP source (ClickHouse, Druid) preferentially used when query filters fall within its partition range.
- **Partition-aware routing:** the layer knows each source's data range and routes to the hot tier only when filters are compatible, else falls back to the warehouse.
- **Compatibility matrix:** derived map of which measures are answerable by which dimensions, used to validate/refuse queries before execution.
- **Report / View:** a report is a collection of views; views render auto / full / half / 1/3 width and are arranged by the layout engine.

---

## 11. Quick facts block (for decks / site footers)

- **Product:** Strata — AI-safe, high-performance self-service analytics platform (governed semantic layer + beautiful-by-default dashboards).
- **Category:** self-service analytics + governed semantic/retrieval layer for dashboards and AI agents.
- **Core differentiators:** freely-named semantic field registry; automatic grain-safe cross-fact blending; aggregate-aware + federated OLAP with partition-aware hot-tier routing; five measure types (Standard, Complex, Snapshot, LOD, ad-hoc) + one-click YoY/moving-avg/percent-to-total; beautiful-by-default dashboards via a layout engine; AI-native editor (NL field/filter resolution); grain-safe agent API.
- **Engines:** Snowflake, ClickHouse, Druid, Databricks (extensible).
- **Stage:** early-stage startup; architecture production-proven at Netflix scale 4+ years.
- **Primary wedge:** add a ClickHouse hot tier + aggregate awareness on top of a Snowflake stack → faster dashboards/agents + lower Snowflake spend, with a more beautiful self-service experience.
- **Deliberate non-goal:** integrating with external BI tools — Strata is the self-service/consumption layer; it augments or replaces them.
