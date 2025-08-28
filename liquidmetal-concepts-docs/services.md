# Services

Services in Raindrop provide stateless, HTTP-based compute units that handle API endpoints, webhooks, and request-response patterns. Each service specializes in specific responsibilities and can communicate with other services through bindings or public endpoints.

## What Services Provide

**Stateless Request Handling**
Each HTTP request is processed independently without maintaining state between requests, enabling horizontal scaling and simple deployment patterns.

**Specialized Responsibilities**
Services focus on specific domains like user authentication, file processing, or data validation, creating clear architectural boundaries.

**Service Bindings**
Direct communication between internal services bypasses public internet routing for faster, more secure inter-service calls.

**HTTP Integration**
Native support for web standards including routing, middleware, and response formatting for API development.

## When to Use Services

### Good Fit

- **API Endpoints**: REST APIs, GraphQL endpoints, and webhook handlers that process HTTP requests
- **Request-Response Patterns**: Operations that receive input, process it, and return results immediately
- **Stateless Operations**: Data transformations, validations, and computations that don't require persistent state
- **Integration Points**: External API clients, payment processing, and third-party service integrations

### Consider Alternatives

- **Stateful Operations**: User sessions, shopping carts, or workflows that need persistent state work better with Actors
- **Background Processing**: Long-running tasks or asynchronous work should use Queues and Observers
- **Scheduled Operations**: Time-based maintenance and periodic tasks belong in Tasks

## Integration Patterns

**Database Access**
Services read from and write to shared databases, making them ideal for CRUD operations and complex queries across multiple entities.

**Event-Driven Architecture**
Services can publish messages to queues and trigger observers, enabling loose coupling between components through asynchronous communication.

**Microservice Architecture**
Multiple services can be developed, deployed, and scaled independently while communicating through bindings or HTTP calls.

**Public Endpoints**
Services with public domains serve as entry points for external clients, mobile apps, and browser-based applications.

Services excel at handling discrete, well-defined operations that can be processed independently and scaled based on demand.