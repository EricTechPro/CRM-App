# SmartMemory

# SmartMemory Concepts

## Opening Context

Why does memory matter for AI? Most AI interactions are stateless - each conversation starts fresh with no awareness of what happened before. This creates jarring experiences where you repeat yourself endlessly and agents never learn from interactions.

SmartMemory solves the continuity problem. It enables AI agents to remember past conversations, learn from experience, and build knowledge over time. Instead of starting every interaction from scratch, agents can recall what happened yesterday, last week, or last month.

This persistent memory transforms AI from a collection of isolated responses into ongoing relationships where understanding deepens through continued interaction.

## Core Concepts

SmartMemory mirrors human cognitive architecture through four specialized memory systems that operate at different scales and persistence levels:

**Working Memory - Session-Based Active Context**
The immediate conversational state within a single session, implemented as an **Actor** that maintains real-time interaction context. You can organize memories into timelines (like `technical` and `planning`) within the same session. Each memory entry includes content, timeline, agent attribution, and temporal metadata. Working memory supports both exact retrieval ( `getMemory()`) and AI-powered semantic search ( `searchMemory()`) for finding relevant context during active conversations.

**Episodic Memory - Conversation History Archives**

Completed sessions automatically become searchable episodes stored in **SmartBuckets** for long-term retrieval. When you flush working memory, the system generates AI-powered summaries that capture session essence while preserving searchable detail. Sessions can be rehydrated ( `rehydrateSession()`) to restore complete conversational state, or queried selectively for relevant historical context. This enables AI agents to reference "what we discussed last month about the database migration."

**Semantic Memory - Structured Knowledge Documents**
Factual information stored as JSON documents in **SmartBuckets** with vector search capabilities. Unlike episodic memories tied to specific conversations, semantic memories represent timeless knowledge - company policies, technical documentation, learned facts. The system automatically generates embeddings for semantic search, letting agents find relevant knowledge based on meaning rather than exact keywords.

**Procedural Memory - Behavioral Templates and Skills**
Reusable procedures, system prompts, and behavioral patterns stored as key-value pairs accessible across all sessions. This includes system prompts that define agent personality, workflow templates for recurring tasks, and response patterns for consistent behavior. Procedural memory provides the "how" that semantic memory's "what" and episodic memory's "when" cannot capture.

Each memory system addresses different temporal scales: working memory for minutes, episodic memory for sessions spanning hours or days, semantic memory for persistent knowledge, and procedural memory for behavioral consistency across all interactions.

## How It Works

**Actor-Based Working Memory Architecture**
Each SmartMemory session creates a dedicated **Actor** instance that maintains conversational state with strong consistency. The actor persists memory entries with structured metadata including timeline, agent attribution, and temporal information. Timeline organization ( `timeline: 'technical'`) enables parallel conversation threads within the same session. The actor handles both exact lookups for specific memories and AI-powered search using embedded content similarity.

**Session Lifecycle Management**

Sessions begin with `startWorkingMemorySession()`, creating a new actor instance with a unique session ID. Memory entries accumulate through `putMemory()` calls during active conversation. Session termination via `endSession(flush: true)` triggers asynchronous consolidation - the actor summarizes accumulated memories using AI models and stores the complete session as an episodic document. The session actor can then be garbage collected while the episodic record remains searchable.

**Multi-Level Search Intelligence**
Memory search operates at multiple levels. Working memory search ( `searchMemory()`) uses vector similarity against active session content for immediate context retrieval. Episodic search ( `searchEpisodicMemory()`) queries across all historical sessions using AI embeddings stored in **SmartBuckets**. Semantic search ( `searchSemanticMemory()`) finds factual knowledge documents by content similarity. Each search type falls back to text matching if vector search fails, ensuring reliable retrieval.

**State Restoration and Continuity**
Session rehydration ( `rehydrateSession()`) reconstructs complete conversational state from episodic storage back into working memory. This process restores all memory entries, timeline organization, and conversational context, enabling seamless conversation continuation across different time periods. The system tracks rehydration status to handle complex state reconstruction asynchronously.

**Cross-Memory System Coordination**
The four memory types operate independently but share common interfaces. Procedural memory serves behavioral templates to all sessions. Semantic memory provides factual knowledge across conversations. Episodic memory enables historical context retrieval. Working memory coordinates active processing while maintaining session isolation through the actor model. This architecture ensures both immediate responsiveness and long-term learning.

## Trade-offs and Considerations

**Memory Architecture vs Simple State**
SmartMemory provides sophisticated multi-level memory at the cost of complexity. For applications needing conversational continuity, learning behavior, or historical context, the four-memory architecture delivers significant value. However, simple stateless AI interactions or basic caching needs may be over-engineered with SmartMemory. Consider using basic **KV storage** or **Actor** state for simpler persistence requirements.

**Actor Resource Consumption vs Scalability**
Working memory sessions create persistent **Actor** instances that consume resources even when idle. This provides immediate responsiveness and strong consistency but limits scalability compared to stateless alternatives. For applications with thousands of concurrent sessions, consider session consolidation strategies or implement session hibernation for inactive conversations.

**Search Performance vs Memory Volume**
Vector search using AI embeddings scales logarithmically with memory volume, providing excellent performance for semantic retrieval. However, large working memory sessions (500+ entries) take significant time to summarize and flush. Text search fallback becomes slower with massive episodic datasets. Design memory retention policies balancing context richness with search performance.

**Memory Granularity vs Storage Efficiency**

Fine-grained memory entries (individual messages) provide precise context but increase storage overhead and search complexity. Coarse-grained entries (conversation summaries) reduce storage costs but lose contextual detail. The optimal granularity depends on your application's context requirements - customer service benefits from detailed interaction history, while creative assistants may prefer conceptual summaries.

**Cross-Session Learning vs Privacy**
Semantic and procedural memories persist across all sessions, enabling genuine learning and behavioral consistency. However, this creates privacy implications where information learned in one conversation affects others. Implement memory segmentation (user-specific semantic memories) or periodic memory purging for privacy-sensitive applications.

**Rehydration Complexity vs Continuity**
Session rehydration enables seamless conversation resumption but adds complexity around state reconstruction, error handling, and partial restoration. Simple applications may prefer starting fresh conversations rather than managing rehydration workflows. Consider your user experience requirements when deciding between stateless and stateful AI interactions.

## Connections

**Relationship to Actor Model**
SmartMemory uses Raindrop's actor system for session isolation and persistence. Each working memory session runs as an independent actor, ensuring conversations don't interfere with each other while maintaining strong consistency within sessions.

**Integration with AI Models**

Memory search leverages the same AI models powering your conversations. Vector embeddings for semantic search use identical models to your chat completions, creating consistent understanding across memory and generation.

**Complementary Storage Systems**
SmartMemory works alongside other Raindrop storage options. Use SmartBuckets for large document collections, SQL databases for structured application data, and KV stores for configuration. Each serves different needs in the overall architecture.

**Building Agent Ecosystems**
Multiple agents can share semantic and procedural memory while maintaining separate episodic histories. This creates AI teams where agents share knowledge but maintain individual conversation threads.

**Beyond Conversational AI**
While designed for chat experiences, SmartMemory enables any application needing adaptive behavior over time. Learning systems, personalization engines, and context-aware automation all benefit from persistent memory that understands both history and meaning.

SmartMemory transforms stateless AI interactions into ongoing relationships where understanding compounds through continued engagement.