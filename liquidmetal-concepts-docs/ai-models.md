# AI Models

## What Are AI Models?

AI models add intelligence to applications. Traditional software processes data according to rigid rules. AI models understand, analyze, and create content.

An uploaded image becomes "a golden retriever playing in a park" instead of just pixels. A customer support request becomes an opportunity for personalized assistance based on the user's emotional state and specific needs.

AI models work with text, images, audio, and video. Modern AI infrastructure makes these capabilities as easy to integrate as database queries. You don't need to understand transformer architectures or GPU clusters. You need to know which model to use for which task and how to integrate it into your application.

## Core Concepts

**Unified Access Pattern**
Every AI model in Raindrop uses the same interface: `env.AI.run()`. Whether you're generating text with `deepseek-r1`, analyzing images with `llava-1.5-7b`, transcribing audio with `whisper-large-v3-turbo`, or creating embeddings with `bge-large-en`, the pattern remains consistent. This unified approach lets you swap models, experiment with different capabilities, and compose multiple AI operations without learning provider-specific APIs.

**Provider Abstraction and Model Router**
Raindrop's model router provides a unified interface that abstracts away provider complexity. Models can be hosted on integrated platform infrastructure ( `llama-3.1-8b-instruct`) or external providers ( `deepseek-r1`, `llama-3.3-70b`). The router handles authentication, routing, and response formatting automatically. This means `llama-3.3-70b` works identically whether it runs on platform infrastructure or external providers.

**Capability-Based Model Selection**
Models are organized by capabilities rather than providers: `chat` models for conversations, `vision` models for image understanding, `embeddings` models for semantic search, `audio` models for speech processing. A model like `llama-4-scout-17b` supports both `chat` and `vision`, while `whisper-large-v3` focuses purely on `audio` transcription. This capability mapping helps you choose the right intelligence for each task.

**Type Safety and Schema Validation**
Each model defines precise input and output types through TypeScript interfaces. Text models expect `messages` arrays with role-based conversation structure. Vision models accept image data alongside text prompts. Embedding models process raw text and return numerical vectors. This type safety prevents integration errors and makes model capabilities explicit in your code.

**Composable Intelligence Workflows**
Real intelligence emerges from combining models. A customer service system might use `whisper-large-v3` for speech recognition, `deepseek-r1` for complex reasoning about the customer's issue, `bge-large-en` for retrieving relevant knowledge, and text generation to craft empathetic responses. Each model contributes specialized understanding to create sophisticated AI behaviors.

## How It Works

**Request Routing Architecture**
When you call `env.AI.run('deepseek-r1', inputs)`, the system first consults the model catalog to determine routing. Models like `llama-3.1-8b-instruct` route to integrated platform infrastructure, while `deepseek-r1` routes through external providers. The model router handles authentication, request formatting, and response processing automatically. This abstraction means you write the same code regardless of where the model actually runs.

**Input Transformation and Validation**
Different model types require different input structures. Chat models expect OpenAI-compatible message arrays with role, content, and optional image attachments. Embedding models process raw text strings or arrays. Audio models handle file uploads with optional language hints. The system validates inputs against model schemas before transmission, catching type mismatches early in development.

**Intelligent Load Balancing and Fallbacks**
The model router implements probabilistic routing for external models, distributing load across multiple providers when available. If a preferred provider is unavailable, requests automatically fall back to alternative implementations. For platform models, the system leverages built-in geographic distribution and auto-scaling to handle demand spikes.

**Response Processing and Type Casting**
Responses undergo automatic processing based on model type. Chat models return structured completions with usage metadata. Embedding models return numerical vectors with dimensional information. Audio models provide transcriptions with confidence scores. The system maintains type safety throughout, ensuring your TypeScript code receives properly typed responses.

**Streaming and Async Processing**

Models support real-time streaming for conversational experiences ( `stream: true`) and async batch processing for high-throughput scenarios ( `queueRequest: true`). Streaming enables token-by-token response delivery for chat interfaces. Batch processing queues requests for efficient bulk operations. The unified interface handles both patterns seamlessly.

## Trade-offs and Considerations

**Performance vs Resource Usage**
Model size directly impacts both capability and resource consumption. `deepseek-r1` (671B parameters) provides state-of-the-art reasoning but consumes significant compute resources. `llama-3.1-8b-instruct` offers excellent performance per cost for most tasks. `gemma-2b` provides basic capabilities with minimal overhead. Choose based on your performance requirements and budget constraints.

**Context Length vs Processing Speed**
Models offer different context windows that affect both capability and latency. `llama-4-scout-17b` supports 128K tokens for analyzing entire documents, while `llama-3.2-3b-instruct` handles 8K tokens for faster conversational responses. `bge-m3` embeddings support 8K input tokens compared to `bge-small-en`'s 512-token limit. Longer contexts enable richer understanding but increase processing time and costs.

**Specialized vs General Intelligence**
Specialized models excel in focused domains. `deepseek-math-7b` outperforms general models on mathematical reasoning. `qwen-coder-32b` generates better code than general chat models. `whisper-large-v3` transcribes speech more accurately than multimodal models. However, specialized models cannot handle tasks outside their training domain, requiring multiple models for comprehensive applications.

**Provider Diversity vs Simplicity**
Using multiple providers through the model router provides redundancy and access to cutting-edge models like `kimi-k2` or `deepseek-r1`. However, this creates dependencies on external services with varying reliability, pricing, and geographic availability. Platform-hosted models like `llama-3.1-70b-instruct` offer predictable performance but may not match the latest external models.

**Streaming vs Batch Processing**
Real-time streaming ( `stream: true`) enables responsive user experiences but requires persistent connections and careful error handling. Batch processing ( `queueRequest: true`) optimizes throughput for bulk operations but adds complexity around result retrieval and status monitoring. Choose based on your user experience requirements.

**Data Locality and Privacy**
Platform-hosted models process data within the integrated platform infrastructure with geographic data residence. External providers may process data across different jurisdictions with varying privacy policies. For sensitive applications, consider using platform models exclusively or implementing additional data encryption for external provider calls.

## Connections

**Storage System Integration**
AI models and storage systems create powerful data processing pipelines. **SmartBuckets** automatically process uploaded documents using embedding models like `bge-large-en`, enabling semantic search across your content. **Vector indexes** store embeddings from models for fast similarity search. Regular **buckets** store processed audio files and other AI-generated assets. The intelligence layer transforms raw storage into searchable, analyzable insights.

**Queue-Driven AI Workflows** **Queues** enable asynchronous AI processing at scale. Upload events trigger document analysis jobs that use `llama-4-scout-17b` for vision understanding or `whisper-large-v3` for audio transcription. **Observers** monitor completion events to chain AI operations - document analysis triggers summary generation, which triggers email notifications. This decoupled architecture handles AI workloads efficiently without blocking user interactions.

**Database-Backed Intelligence** **SQL databases** store structured data while AI models extract semantic meaning. A customer support ticket lives in SQL while `deepseek-r1` generates sentiment analysis, category classification, and response suggestions stored in separate columns. **SmartSQL** can automatically run AI analysis on database changes, keeping insights synchronized with your core data.

**Stateful AI through Actors** **Actors** enable persistent AI behavior across interactions. A conversation actor maintains dialog state while calling `llama-3.3-70b` for each response, preserving context that traditional stateless AI calls lose. **SmartMemory** actors store episodic, semantic, and procedural memories, creating AI agents that learn and adapt over time through accumulated interactions.

**Service Orchestration Patterns** **Services** coordinate complex AI workflows, handling input validation, model selection, and response formatting. A document analysis service might use `llama-4-scout-17b` for visual understanding, `bge-large-en` for text embeddings, and `deepseek-math-7b` for quantitative analysis, presenting unified results to clients. Services abstract AI complexity while providing reliable, scalable endpoints.

**Multi-Modal AI Pipelines**
Real applications compose multiple AI capabilities. A customer service system uses `whisper-large-v3-turbo` for speech transcription, `bge-large-en` for knowledge retrieval from documentation, `deepseek-r1` for reasoning about complex issues, and text-to-speech for audio responses. Each model contributes specialized intelligence while the overall system delivers sophisticated, human-like assistance.