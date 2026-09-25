## Canonical YAML Examples

These are minimal, valid examples for each Strata file type.

### Table Example (tbl.orders.yml)

```yaml
name: Orders
physical_name: orders
datasource: warehouse
cost: 100

fields:
  - type: dimension
    name: Order ID
    data_type: integer
    expression:
      primary_key: true
      sql: order_id

  - type: dimension
    name: Customer ID
    data_type: integer
    expression:
      sql: customer_id

  - type: dimension
    name: Order Date
    data_type: date
    expression:
      sql: order_date

  - type: measure
    name: Order Count
    data_type: integer
    expression:
      sql: count(*)

  - type: measure
    name: Total Revenue
    data_type: decimal
    expression:
      sql: sum(order_total)
```

### Relation Example (rel.sales.yml)

```yaml
datasource: warehouse

orders_customers:
  left: Orders
  right: Customers
  sql: left.customer_id = right.customer_id
  cardinality: many_to_one

orders_products:
  left: Order Items
  right: Products
  sql: left.product_id = right.product_id
  cardinality: many_to_one
```

### Project Example (project.yml)

```yaml
name: My Analytics Project
description: Semantic layer for sales analytics
server: https://app.strata.do
production_branch: main
```

### Datasources Example (datasources.yml)

```yaml
warehouse:
  adapter: postgres
  host: localhost
  port: 5432
  database: analytics
  schema: public
```
