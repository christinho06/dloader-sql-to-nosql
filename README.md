# DLoader: Migration of Data from SQL to NoSQL Databases

## Introduction to Data Migration

**Data migration** is the process of transferring data between storage types, formats, or computer systems. It is critical when:
- Upgrading or replacing systems
- Merging databases after acquisitions
- Switching from relational to document-oriented storage for scalability

### Key Differences: SQL vs NoSQL

| Feature | SQL | NoSQL |
|---|---|---|
| Schema | Fixed, predefined | Flexible, dynamic |
| Data model | Tables (rows/columns) | Documents, key-value, graph, column |
| Scaling | Vertical | Horizontal |
| ACID compliance | Full | Eventual consistency (varies) |
| Examples | MySQL, PostgreSQL | MongoDB, Redis, Cassandra |

---

## Overview of DLoader

**DLoader** is a data migration tool designed to facilitate the transition from SQL databases to NoSQL databases. It automates schema transformation and data transfer, reducing manual effort and migration errors.

### Main Features
- Automated schema mapping from relational tables to document collections
- Batch processing for large datasets
- Data validation before and after migration
- Support for multiple SQL sources (MySQL, PostgreSQL, SQLite)
- Target support for MongoDB and other NoSQL stores
- Incremental migration (migrate only changed records)
- Rollback capability on failure

---

## Migration Process with DLoader

### Step 1 — Analyze the SQL Schema
```sql
-- Example SQL schema
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at DATETIME
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product VARCHAR(200),
  amount DECIMAL(10,2)
);
```

### Step 2 — Map to NoSQL Document Structure
```json
{
  "_id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "orders": [
    { "id": 101, "product": "Laptop", "amount": 999.99 }
  ]
}
```

DLoader embeds related records (1-to-many joins) as nested arrays — the standard NoSQL pattern.

### Step 3 — Configure DLoader
```yaml
source:
  type: mysql
  host: localhost
  port: 3306
  database: myapp_db
  user: root
  password: secret

target:
  type: mongodb
  uri: mongodb://localhost:27017/myapp_nosql

mappings:
  - sql_table: users
    nosql_collection: users
    embed:
      - table: orders
        foreign_key: user_id
        as: orders
```

### Step 4 — Run Migration
```bash
dloader migrate --config dloader.yml --batch-size 1000 --validate
```

### Step 5 — Validate Results
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');

async function validate() {
  await client.connect();
  const db = client.db('myapp_nosql');
  const count = await db.collection('users').countDocuments();
  console.log('Migrated users:', count);
  const sample = await db.collection('users').findOne({});
  console.log('Sample document:', JSON.stringify(sample, null, 2));
  await client.close();
}

validate().catch(console.error);
```

---

## Challenges in SQL to NoSQL Migration

1. **Schema flexibility**: NoSQL has no enforced schema — application code must handle validation
2. **Joins vs embedding**: Relational joins must be denormalized into embedded documents or references
3. **Data types**: SQL types don't map 1:1 to BSON (e.g., DECIMAL → Double)
4. **Referential integrity**: NoSQL has no built-in foreign key constraints
5. **Transaction support**: Ensure ACID properties are preserved where needed

---

## Conclusion

DLoader streamlines SQL-to-NoSQL migration through automated schema mapping, batch processing, and validation. The key is understanding the structural shift from normalized relational tables to denormalized document collections optimized for query performance.
