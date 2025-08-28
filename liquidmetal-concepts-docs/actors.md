# Actors

## What Are Actors?

Actors are stateful compute units that maintain persistent data and handle requests with unique identity. Each actor instance exists for a specific entity like a user session, shopping cart, or collaborative document.

Traditional serverless functions rebuild context from databases on every request. This causes performance overhead for stateful operations like:

- Shopping carts that track items across page loads
- Collaborative documents with real-time editing
- Game sessions that maintain complex state over time

Actors solve this by keeping state in memory. When requests arrive, they route to the correct actor by ID. That actor already has the full context loaded and ready.

## Core Concepts

**Identity-Based Compute Units**
Every actor has a unique `ActorId` that persists across requests, deployments, and system restarts. You can create deterministic IDs from names ( `actorNamespace.idFromName('user-123')`) or generate unique ones for new entities. Each actor maintains both persistent state through `ActorStorage` and computational context through in-memory processing. A shopping cart actor stores selected items in durable storage while maintaining complex purchase workflow logic in active memory.

**Isolated State and Execution Boundaries**
Each actor runs as a completely isolated instance with its own computational environment and storage namespace. The `ActorState` interface provides controlled access to persistence operations while preventing cross-actor interference. This isolation guarantees that user "123"'s shopping cart cannot access user "456"'s data, even if both use the same actor class. Race conditions are eliminated within each actor through single-threaded execution.

**Deterministic Request Routing**

Actor requests route to specific instances based on unique identifiers. A request for `actorNamespace.get(userActorId)` always reaches the same actor instance, creating a persistent computational endpoint. This deterministic routing enables actors to accumulate context, maintain workflow state, and build complex behaviors over time rather than starting fresh on every invocation.

**Alarm-Based Scheduling and Lifecycle Management**
Actors can schedule future executions using `state.storage.setAlarm()`, enabling time-based operations like session expiration, periodic cleanup, or workflow advancement. The alarm system survives system restarts and redeployments, providing reliable scheduling. Actors can also control their own lifecycle through `blockConcurrencyWhile()` for initialization and `deleteAll()` for cleanup, giving fine-grained control over resource management.

## How It Works

**Lazy Instantiation and Routing**
When you call `actorNamespace.get(userActorId).someMethod()`, the system performs lazy instantiation. If no actor exists for that ID, it creates a new instance using your actor class constructor, passing `ActorState` and environment bindings. If the actor exists, requests route directly to the running instance with all state and context intact. This lazy approach optimizes resource usage - actors only exist when needed.

**Strong Consistency and Single-Threaded Execution**
Each actor instance guarantees strong consistency through single-threaded execution. All methods on a single actor execute sequentially, eliminating race conditions within that actor's scope. You can perform complex multi-step operations on actor state without concurrency concerns. However, communication between different actors requires explicit coordination since they operate independently.

**Integrated Storage and Compute Co-location**
Actor storage ( `state.storage`) provides transactional persistence directly integrated with the compute instance. You can store JavaScript objects with `put()`, retrieve them with `get()`, and implement custom indexing with `list()` operations. Storage operations are atomic within each actor and optimized for low latency since storage co-locates with the compute. This eliminates the network round-trips typical in traditional database-backed applications.

**Durable Alarm System and Time-Based Operations**
The alarm system ( `setAlarm()`, `getAlarm()`, `deleteAlarm()`) provides reliable time-based scheduling that survives system restarts, redeployments, and infrastructure maintenance. An actor can schedule itself to execute at specific Unix timestamps for session cleanup, workflow advancement, or periodic processing. When the alarm fires, the actor receives an alarm event that can trigger complex business logic while maintaining full access to its persistent state.

**Concurrency Control and Lifecycle Management**
Actors provide fine-grained concurrency control through `blockConcurrencyWhile()` for critical initialization sequences and `waitUntil()` for background operation coordination. The `deleteAll()` operation enables controlled actor cleanup and resource reclamation. These primitives let you implement sophisticated lifecycle management while maintaining the strong consistency guarantees that make actors powerful for stateful computation.

## Trade-offs and Considerations

**Single-Actor Consistency vs Multi-Actor Coordination**
Actors guarantee strong consistency within a single instance through single-threaded execution, but coordinating operations across multiple actors requires careful design. If your application needs atomic updates across user accounts, you'll need external coordination mechanisms like **Queues** for event propagation or **Services** for orchestration. Direct inter-actor communication creates tight coupling that undermines the isolation benefits.

**Resource Overhead vs Performance Optimization**
Each actor instance maintains persistent resources and consumes memory even when idle. Co-located storage provides excellent latency but costs more than shared database resources. For frequently-accessed entities with complex state (user sessions, game lobbies, collaborative documents), this overhead delivers significant performance benefits. For rarely-accessed entities, consider using **Services** with **SQL databases** for more cost-effective storage.

**Horizontal Scaling vs Per-Entity Throughput**
Since all requests for a particular `ActorId` route to the same instance, each actor has finite throughput limits. High-frequency operations on popular entities can bottleneck at the single-actor level. However, the actor model scales horizontally - you can have millions of different actors, each handling moderate request volumes. Design your actor boundaries to balance throughput needs with state consistency requirements.

**State Management vs Data Architecture**
Actors excel at maintaining working state, temporal data, and computational context, but they're not primary data repositories. Use actors for active sessions, workflow state, and cached computations while storing historical data in **SQL databases** or **SmartBuckets**. The alarm system enables automatic state transitions between hot actor storage and cold persistent storage.

**Cold Start Latency vs Resource Efficiency**
Inactive actors may be evicted from memory, causing cold start delays when accessed again. The actor constructor runs on first access after eviction, potentially loading state from storage. For latency-critical applications, consider implementing keep-alive patterns through periodic alarm-based activity. For resource efficiency, accept cold start latency as a reasonable trade-off for idle resource reclamation.

**Geographic Distribution and Jurisdiction Control**
Actors support geographic placement through `locationHint` options and regulatory compliance through jurisdiction controls ( `eu`, `fedramp`). This enables data locality optimization and compliance requirements but adds complexity around cross-region coordination. Plan actor placement based on your users' geographic distribution and regulatory requirements.

## Connections

Actors fit naturally into event-driven architectures. They can subscribe to queues, respond to storage events, and trigger observers based on state changes. This makes them powerful coordination points for complex workflows that span multiple system components.

The relationship with services is complementary - services handle public API endpoints and route authenticated requests to appropriate actors. Services provide the stateless, scalable front door while actors maintain the stateful, persistent backend logic.

Database integration follows a specific pattern: actors maintain hot, working state while databases store cold, historical data. A shopping cart actor might keep the current items in memory while persisting completed orders to SQL. This division lets you optimize for both real-time performance and long-term data management.

Actors also connect naturally with SmartMemory for AI applications. An AI agent can use an actor to maintain conversation state and working memory while leveraging SmartMemory for long-term learning and knowledge retention. The actor provides the active intelligence while SmartMemory provides the accumulated wisdom.