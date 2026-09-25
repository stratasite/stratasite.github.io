## Common Mistakes to Avoid

### Wrong: One Name for Two Different Concepts
```yaml
# In tbl.calls.yml
- type: dimension
  name: Country  # the caller's country

# In tbl.shipments.yml
- type: dimension
  name: Country  # the ship-to country: WRONG, Strata merges both into one "Country"
```
**Fix:** Different concepts get different names: "Caller Country" and "Ship Country". The same name on two tables is only correct when it is the same concept (e.g. "Total Revenue" on store and catalog sales), in which case the planner picks the table by dimensions and cost.

### Wrong: Many-to-Many Relationship
```yaml
users_roles:
  cardinality: many_to_many  # ERROR: Not supported
```
**Fix:** Create a junction table (user_roles) with two relationships

### Wrong: Measure Without Aggregation
```yaml
- type: measure
  name: Revenue
  expression:
    sql: amount  # ERROR: No aggregation function
```
**Fix:** Use `sql: sum(amount)`

### Wrong: Dimension With Aggregation
```yaml
- type: dimension
  name: Customer Name
  expression:
    sql: max(customer_name)  # ERROR: Dimensions shouldn't aggregate
```
**Fix:** Use `sql: customer_name`

### Wrong: Missing Required Fields
```yaml
name: Orders
physical_name: orders
# ERROR: Missing datasource, cost, and fields
```
**Fix:** Include all required fields: datasource, name, physical_name, cost, fields

### Wrong: Using Web Links in Field References
```yaml
expression:
  sql: [Total Revenue] - [/semantic-model/fields/cost]  # ERROR: URL instead of field name
```
**Fix:** Use field names only: `[Total Revenue] - [Total Cost]`
