## Strata Semantic Modeling Rules (Must Follow)

These rules are mandatory. AI agents generating Strata YAML must follow them exactly.

### Naming Rules
1. Every field name MUST be unique across the entire semantic layer
2. Field names MUST be stable - once published, do not rename without migration
3. Table names MUST be unique within a datasource
4. Use descriptive, business-friendly names (not database column names)
5. Field names should use Title Case with spaces (e.g., "Total Revenue", "Customer Name")

### Structure Rules
1. Every table MUST define: datasource, name, physical_name, cost, fields
2. Every field MUST define: type, name, data_type, expression
3. Relations are directional and defined separately from tables (in rel.*.yml files)
4. YAML is declarative - key order does not matter, but meaning does
5. One table per tbl.*.yml file
6. Multiple relationships can be in one rel.*.yml file (grouped by domain)

### Relationship Rules
1. many_to_many is NOT supported - use junction/bridge tables instead
2. Cardinality must match actual data: many_to_one, one_to_many, one_to_one
3. allow_measure_expansion should be used carefully (can cause double-counting)
4. Join conditions use `left.column = right.column` syntax
5. The "left" table is the table containing the foreign key
6. Relations are defined on the child table pointing to the parent

### Expression Rules
1. Measures MUST include an aggregation function (sum, count, avg, min, max)
2. Dimensions should NOT include aggregation functions
3. Field references use bracket notation: [Field Name]
4. SQL expressions are adapter-specific (PostgreSQL, Snowflake, etc.)
5. Use `primary_key: true` on the unique identifier dimension

### Cost Rules
1. Costs are relative indicators for query routing, not pricing
2. Lower cost = preferred table when multiple tables can answer a query
3. Dimension tables: typically cost 10
4. Fact tables: typically cost 100
5. Hot tier (fast storage): lower cost
6. Cold tier (archival): higher cost

### File Organization Rules
1. Tables: `tbl.{name}.yml` (e.g., tbl.orders.yml, tbl.customers.yml)
2. Relations: `rel.{domain}.yml` (e.g., rel.sales.yml, rel.inventory.yml)
3. One relation file per domain grouping related joins
4. Do NOT duplicate physical tables across semantic tables
5. Organize models by domain in subdirectories (models/sales/, models/inventory/)

### Data Type Rules
1. Supported data types: string, integer, bigint, decimal, date, date_time, boolean, binary
2. Use decimal for monetary values
3. Use date for dates without time, date_time for timestamps
4. Use bigint for large integer values (counts, IDs)
