/**
 * JSON Schemas for the Strata YAML file types, served at
 * /docs/api/schema/<name>.json and listed in /docs/api/docs.json. Ported
 * verbatim from the old developer-docs build plugin; keep in sync with the CLI.
 */
export const schemaNames = ['table', 'relation', 'project', 'datasources', 'migration', 'test'] as const;
export type SchemaName = (typeof schemaNames)[number];

export function docsSchemas(schemaBaseUrl: string): Record<SchemaName, object> {
  // Table Schema - strict validation
  const tableSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/table.json`,
    version: '1.0',
    type: 'object',
    required: ['datasource', 'name', 'physical_name', 'cost', 'fields'],
    additionalProperties: false,
    properties: {
      datasource: {type: 'string'},
      name: {type: 'string'},
      physical_name: {type: 'string'},
      cost: {type: 'integer', minimum: 1},
      snapshot_date: {type: 'string'},
      tags: {type: 'array', items: {type: 'string'}},
      partitions: {
        type: 'array',
        items: {$ref: '#/definitions/partition'},
      },
      imports: {type: 'array', items: {type: 'string'}},
      fields: {
        type: 'array',
        items: {$ref: '#/definitions/field'},
        minItems: 1,
      },
    },
    definitions: {
      partition: {
        type: 'object',
        required: ['dimension', 'predicate', 'filter_value'],
        additionalProperties: false,
        properties: {
          dimension: {type: 'string'},
          predicate: {enum: ['between', 'in_list']},
          filter_value: {type: 'string'},
          filter_value_end: {type: 'string'},
          description: {type: 'string'},
        },
      },
      field: {
        type: 'object',
        required: ['type', 'name', 'data_type', 'expression'],
        additionalProperties: false,
        properties: {
          type: {enum: ['dimension', 'measure']},
          name: {type: 'string'},
          description: {type: 'string'},
          data_type: {
            enum: ['string', 'integer', 'bigint', 'decimal', 'date', 'date_time', 'boolean', 'binary'],
          },
          hidden: {type: 'boolean', default: false},
          display_type: {
            enum: ['default', 'html', 'url', 'email', 'phone_number', 'image'],
            default: 'default',
          },
          format: {
            oneOf: [
              {type: 'string'},
              {
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    enum: ['raw', 'number', 'currency', 'percent', 'date', 'datetime', 'html', 'javascript'],
                  },
                  precision: {type: 'integer'},
                  abbreviate: {type: 'boolean'},
                  unit: {type: 'string'},
                  pattern: {type: 'string'},
                  template: {type: 'string'},
                  function: {type: 'string'},
                },
              },
            ],
          },
          disable_value_listing: {type: 'boolean', default: false},
          value_list_size: {type: 'integer', minimum: 1},
          grains: {type: 'array', items: {type: 'string'}},
          expression: {$ref: '#/definitions/expression'},
        },
      },
      expression: {
        type: 'object',
        required: ['sql'],
        additionalProperties: false,
        properties: {
          sql: {type: 'string'},
          primary_key: {type: 'boolean', default: false},
          lookup: {type: 'boolean', default: false},
          array: {type: 'boolean', default: false},
        },
      },
    },
  };

  // Relation Schema - strict validation
  const relationSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/relation.json`,
    version: '1.0',
    type: 'object',
    required: ['datasource'],
    properties: {
      datasource: {type: 'string'},
    },
    additionalProperties: {
      type: 'object',
      required: ['left', 'right', 'sql', 'cardinality'],
      additionalProperties: false,
      properties: {
        left: {type: 'string'},
        right: {type: 'string'},
        sql: {type: 'string'},
        cardinality: {enum: ['one_to_one', 'one_to_many', 'many_to_one']},
        join: {enum: ['inner', 'left', 'right'], default: 'inner'},
        allow_measure_expansion: {type: 'boolean', default: false},
      },
    },
  };

  // Project Schema - strict validation
  const projectSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/project.json`,
    version: '1.0',
    type: 'object',
    required: ['name', 'server'],
    additionalProperties: false,
    properties: {
      name: {type: 'string'},
      description: {type: 'string'},
      uid: {type: 'string'},
      server: {type: 'string', format: 'uri'},
      production_branch: {type: 'string', default: 'main'},
      git: {type: 'string'},
      project_id: {type: 'integer'},
      environments: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            server: {type: 'string', format: 'uri'},
            api_key: {type: 'string'},
          },
        },
      },
    },
  };

  // Datasources Schema - strict validation
  const datasourcesSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/datasources.json`,
    version: '1.0',
    type: 'object',
    additionalProperties: {
      type: 'object',
      required: ['adapter'],
      properties: {
        adapter: {
          enum: ['postgres', 'snowflake', 'mysql', 'sqlserver', 'athena', 'trino', 'duckdb', 'druid'],
        },
        host: {type: 'string'},
        port: {type: 'integer'},
        database: {type: 'string'},
        schema: {type: 'string'},
        warehouse: {type: 'string'},
        account: {type: 'string'},
        catalog: {type: 'string'},
        region: {type: 'string'},
        workgroup: {type: 'string'},
        s3_output_location: {type: 'string'},
        ssl: {type: 'boolean', default: false},
        tier: {enum: ['hot', 'warm', 'cold'], default: 'hot'},
      },
    },
  };

  // Migration Schema - strict validation
  const migrationSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/migration.json`,
    version: '1.0',
    type: 'object',
    required: ['version', 'operations'],
    additionalProperties: false,
    properties: {
      version: {type: 'string'},
      description: {type: 'string'},
      operations: {
        type: 'array',
        items: {
          type: 'object',
          oneOf: [
            {
              required: ['type', 'from', 'to'],
              properties: {
                type: {const: 'rename_field'},
                from: {type: 'string'},
                to: {type: 'string'},
              },
            },
            {
              required: ['type', 'from', 'to'],
              properties: {
                type: {const: 'rename_table'},
                from: {type: 'string'},
                to: {type: 'string'},
              },
            },
            {
              required: ['type', 'field_a', 'field_b'],
              properties: {
                type: {const: 'swap_fields'},
                field_a: {type: 'string'},
                field_b: {type: 'string'},
              },
            },
          ],
        },
        minItems: 1,
      },
    },
  };

  // Test Schema - strict validation
  const testSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `${schemaBaseUrl}/test.json`,
    version: '1.0',
    type: 'object',
    required: ['name', 'query'],
    additionalProperties: false,
    properties: {
      name: {type: 'string'},
      description: {type: 'string'},
      query: {
        type: 'object',
        required: ['dimensions', 'measures'],
        additionalProperties: false,
        properties: {
          dimensions: {type: 'array', items: {type: 'string'}},
          measures: {type: 'array', items: {type: 'string'}},
          filters: {
            type: 'array',
            items: {
              type: 'object',
              required: ['field', 'operator', 'value'],
              properties: {
                field: {type: 'string'},
                operator: {enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in']},
                value: {},
              },
            },
          },
        },
      },
      assert_sql: {type: 'string'},
      assert_row_count: {type: 'integer', minimum: 0},
    },
  };

  return {
    table: tableSchema,
    relation: relationSchema,
    project: projectSchema,
    datasources: datasourcesSchema,
    migration: migrationSchema,
    test: testSchema,
  };
}
