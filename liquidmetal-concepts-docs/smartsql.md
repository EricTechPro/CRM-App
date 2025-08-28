# SmartSQL

SmartSQL changes how you interact with databases. It runs regular SQL queries and converts plain English into SQL. It finds sensitive data automatically and tracks your database structure for better AI queries.

## What SmartSQL Provides

**Natural Language to SQL**
Ask questions in plain English and get accurate SQL queries. "Show me all users who joined last month" becomes properly structured SQL that understands your database schema.

**Automatic PII Detection**
Every data modification is analyzed for personal information like emails, names, and phone numbers. PII findings are stored separately and tracked consistently across updates.

**Schema Intelligence**
Your database metadata stays current automatically. SmartSQL learns your table structures and sample data to generate better queries and provide context for AI operations.

**Dual Query Interface**
Execute direct SQL when you know exactly what you want, or use natural language when you need to explore or when SQL syntax isn't convenient.

## How SmartSQL Works

When you ask SmartSQL to "find users who haven't logged in recently," several processes work together:

1. **Query Analysis**: The system examines your request and current database metadata to understand what tables and columns are relevant
2. **SQL Generation**: AI models convert your natural language into proper SQL, using safety tokens to prevent injection attacks
3. **Execution and Processing**: The generated query runs against your database, with results formatted as JSON or CSV
4. **PII Scanning**: If the query modified data, background processes check for personal information and update detection records
5. **Metadata Updates**: Schema changes trigger metadata updates so future queries understand your database structure better

AI models understand your questions and create proper SQL. Safety checks stop malicious prompts while keeping queries flexible.

## Understanding Data Processing

SmartSQL operates through specialized services that handle different aspects of query processing:

**Manager Service**
Coordinates query execution, handles both SQL and natural language inputs, and manages the overall request lifecycle.

**PII Detection Service**

Runs background analysis on data modifications using Hugging Face models to identify personal information across multiple entity types.

**Metadata Service**
Maintains current database schema information, including table structures, column types, and sample data for AI context.

**Queue-Based Communication**
Services communicate through message queues for reliable background processing, ensuring PII detection and metadata updates happen without blocking query responses.

This distributed approach means your queries return quickly while data analysis continues in the background.

## When to Use SmartSQL

### Good Fit

- **Data Exploration**: When you need to ask questions about your data but aren't sure of the exact SQL syntax
- **PII Compliance**: Applications that need to track and monitor personal information across database operations
- **Dynamic Schemas**: Databases where table structures change and you need AI to understand the current layout
- **Mixed Query Needs**: Applications requiring both precise SQL control and flexible natural language access

### Consider Alternatives

- **High-Performance Analytics**: Complex analytical workloads might need specialized database tools
- **Simple CRUD Operations**: Basic create/read/update/delete operations work fine with standard database bindings
- **Real-Time Requirements**: Natural language processing adds latency that might not suit millisecond-critical applications

## Integration Patterns

**Hybrid Query Strategy**
Use direct SQL for known operations and natural language for exploration, data discovery, and user-facing query interfaces.

**PII Compliance Workflow**
SmartSQL detects and tracks personal information as your application processes data. This builds compliance documentation without extra development work.

**Schema Evolution Support**
As your database structure changes, SmartSQL adapts its understanding automatically, keeping AI query generation current with your actual data model.

**Background Processing**
PII detection and metadata updates happen asynchronously, so your application gets query results immediately while compliance scanning continues behind the scenes.

SmartSQL connects precise database control with flexible natural language queries. You get intuitive data access with strong security and compliance features.

## Safety and Security

Query processing includes multiple safety layers. These prevent malicious usage while preserving legitimate flexibility.

**Prompt Injection Protection**
Natural language queries use safety token validation to ensure generated SQL matches the original intent and hasn't been manipulated by embedded prompts.

**SQL Injection Prevention**
Generated queries go through standard parameterization and validation before execution, following established database security practices.

**PII Data Isolation**
Personal information detection results are stored in separate system tables with indexed lookups, keeping sensitive data organized and trackable.

**Authentication Integration**
External API access requires JWT tokens with proper user and organization claims, preventing unauthorized access to database operations.

The system balances security with flexibility. Legitimate queries work smoothly while blocking potential abuse.