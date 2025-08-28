# Queues

Queues in Raindrop provide reliable message passing between application components, enabling asynchronous processing and loose coupling. Instead of direct service calls, components can send messages to queues where dedicated observers process them at optimal speeds.

## What Queues Provide

**Asynchronous Processing**
Decouple message production from consumption, allowing components to work at different speeds without blocking each other.

**Reliable Delivery**
Messages persist until successfully processed, providing natural retry behavior and ensuring work completion even during failures.

**Load Balancing**
Distribute work across multiple observer instances for parallel processing and improved throughput.

**Decoupled Architecture**
Eliminate direct dependencies between components by using message passing instead of direct service calls.

## When to Use Queues

### Good Fit

- **Background Processing**: Email sending, file processing, data analysis that doesn't need immediate completion
- **Event-Driven Workflows**: Multi-step processes where each stage can complete independently
- **Traffic Buffering**: Handle traffic spikes by queuing work for processing at sustainable rates
- **Cross-Component Communication**: Enable loose coupling between services and actors

### Consider Alternatives

- **Immediate Results**: User-facing operations requiring instant responses should use direct service calls
- **Simple State Storage**: Basic data persistence works better with databases or KV storage
- **Scheduled Operations**: Time-based tasks belong in Tasks rather than message-driven processing

## Integration Patterns

**Producer-Consumer Model**
Services and actors produce messages while observers consume them, creating clear separation between work generation and execution.

**Workflow Orchestration**
Chain multiple processing steps by having observers send messages to subsequent queues, building complex workflows.

**Event Sourcing**
Capture all system changes as events in queues, enabling audit trails and system state reconstruction.

**Load Distribution**
Multiple observer instances can process messages from the same queue, automatically distributing work for parallel processing.

Queues excel at building resilient, scalable systems where components communicate through reliable message passing rather than direct coupling.