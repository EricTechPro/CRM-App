# Annotations

## Opening Context

Where should configuration live? Most applications scatter metadata across dozens of places: environment variables, configuration files, database tables, external configuration services, documentation wikis, deployment scripts. This fragmentation creates a persistent problem - when you need to understand how a system is configured, you have to check multiple sources, often with inconsistent or outdated information.

Consider deploying a feature flag change. You might update an environment variable, modify a configuration file, update documentation, and notify your team through multiple channels. If something goes wrong, you need to reverse all these changes across different systems. What if there was a single source of truth that kept all these pieces together?

Annotations solve this by creating a metadata layer that stays connected to your application's logical structure. Instead of managing configuration separately from your code, annotations let you attach metadata directly to the entities that need it - applications, modules, components, or individual features. This creates a cohesive view where operational knowledge stays connected to the systems it describes.

## Core Concepts

**Machine-Readable Names (MRNs)**
Every annotation has a precise, hierarchical address that identifies exactly what it describes. An address like `app/myapp/v1.2.0/auth-service/rate-limits/premium-users` immediately tells you this metadata applies to rate limiting configuration for premium users in the auth service of myapp version 1.2.0. This precision eliminates ambiguity about what each piece of metadata describes.

**Hierarchical Organization**
Metadata naturally follows your application's structure. Application-level settings apply broadly, while component-specific configuration affects only relevant parts. This hierarchy means you can set global defaults at the application level and override them for specific modules or components as needed.

**Versioned State Management**
Every change to annotations creates a new revision with complete history. This isn't just about rollback capabilities - it's about understanding how your system configuration evolved over time. You can see when certain decisions were made, why they were changed, and trace configuration issues back to specific changes.

**Flexible Content Types**
Annotations store any type of metadata: structured JSON for configuration, plain text for documentation, binary data for certificates, or complex objects for behavioral specifications. The type system ensures you get back the same type of data you stored, with proper validation and schema enforcement where needed.

## How It Works

Annotation storage follows a path-based addressing system where each level of the hierarchy represents a more specific scope. When you create an annotation, you specify its complete path through the application structure. The system automatically manages the hierarchical relationships and provides efficient access patterns for different scopes.

Revision management happens automatically. Every modification creates a new revision while preserving the complete history. This includes not just the data changes, but metadata about when the change was made, what triggered it, and how it relates to previous versions. The system can efficiently store and retrieve any historical revision.

The retrieval system supports both specific path lookups and hierarchical queries. You can ask for the exact annotation at a specific path, or query for all annotations within a scope. The system understands inheritance patterns, so you can request effective configuration for a component and get the combination of global, module, and component-specific settings.

Access control and permissions integrate with the application's security model. Different components and users can have different levels of access to various annotation scopes. This enables secure delegation where teams can manage configuration for their components without accessing system-wide settings.

## Trade-offs and Considerations

**Consistency vs Performance**
Annotations prioritize consistency and correctness over raw performance. Reading annotations involves potential database queries and permission checks, making them unsuitable for high-frequency operations. They work best for configuration that changes infrequently and doesn't need millisecond access times.

**Schema Flexibility vs Validation**
The flexible content model means annotations can store arbitrary data, but this flexibility can lead to inconsistencies if not managed carefully. Teams need to establish conventions about data structure and validation to prevent configuration drift and maintain system reliability.

**Centralization vs Decentralization**
While centralized metadata storage provides consistency, it can become a bottleneck for teams that need to manage their own configuration independently. The hierarchical permissions model helps, but organizations need to balance central governance with team autonomy.

**Version Management Overhead**
Complete revision history provides valuable audit trails but consumes storage and adds complexity to management operations. Long-running applications might accumulate substantial revision history that needs occasional cleanup or archival.

**Scope Creep Risk**
The flexibility of annotations can tempt teams to store operational data that belongs in other systems. Annotations work best for metadata and configuration, not for business data or high-volume operational information.

## Connections

Annotations integrate naturally with the deployment pipeline, providing version-specific metadata that travels with your application code. This creates a coherent view where configuration changes are tracked alongside code changes, making it easier to understand how system behavior evolves.

The relationship with services enables runtime configuration that can change without redeployment. Services can check annotations at startup or periodically to adjust behavior based on operational requirements. This supports patterns like feature flags, rate limiting adjustments, or external service endpoints that need to change based on environment or operational conditions.

Actors can use annotations to store persistent behavioral configuration. Unlike actor state, which is runtime-specific and ephemeral, annotations provide persistent configuration that defines how actors should behave across restarts and deployments. This separation keeps operational concerns distinct from business logic.

Cross-component coordination becomes possible when multiple system elements reference the same annotation scopes. Service discovery, shared configuration, and integration points can all use annotations to maintain consistent understanding across different parts of your application architecture.

The connection to monitoring and observability tools provides rich context about configuration changes. When system behavior changes, you can correlate it with annotation modifications to understand whether operational changes contributed to performance or reliability issues.