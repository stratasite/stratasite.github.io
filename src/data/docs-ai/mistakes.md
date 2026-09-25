## Common Mistakes to Avoid

### Wrong: Duplicate Field Names
```yaml
# In tbl.orders.yml
- type: measure
  name: Total Revenue  # ERROR: "Total Revenue" already exists in another table
```
**Fix:** Use unique names like "Order Revenue" or "Store Revenue"

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
