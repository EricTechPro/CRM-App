# SQL Databases

SQL databases in Raindrop provide structured, relational data storage with ACID guarantees for applications that need data consistency, complex queries, and relationships between entities.

## What SQL Databases Provide

**Structured Data Storage**
Tables with defined schemas ensure data consistency and enable powerful queries across related entities.

**ACID Transactions**
Atomicity, Consistency, Isolation, and Durability guarantees ensure data integrity even during complex operations or system failures.

**Powerful Query Language**
SQL enables complex filtering, joining, aggregation, and analysis operations directly in the database.

**Data Relationships**
Foreign keys and constraints maintain referential integrity between related entities like users, orders, and products.

## When to Use SQL Databases

### Good Fit

- **Related Data**: Customer orders, user profiles, product catalogs where entities reference each other
- **Complex Queries**: Reporting, analytics, and multi-table operations
- **Data Integrity**: Financial transactions, inventory management, or other critical data that requires consistency
- **Compliance**: Applications needing audit trails and data validation

### Consider Alternatives

- **Simple Key-Value Data**: User preferences, session data, or cache values work better in KV storage
- **High-Throughput Simple Operations**: Sensor data or logs might be better suited for other storage types
- **Frequently Changing Schema**: Rapidly evolving data structures might benefit from more flexible storage

## Integration Patterns

**Services as Database Clients**
Services handle SQL queries, connection management, and transform database results into API responses.

**Actor State Persistence**
Actors can load initial state from SQL tables and persist changes while maintaining in-memory performance.

**Schema Management**
Migration files manage database schema evolution across development, testing, and production environments.

SQL databases provide the foundation for data-driven applications that need reliability, consistency, and powerful query capabilities.