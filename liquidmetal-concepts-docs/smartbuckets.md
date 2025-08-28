# SmartBuckets

## What are SmartBuckets?

SmartBuckets provide object storage that automatically processes your files with AI during upload. Your data becomes immediately ready for AI applications, agents, human consumption, and RAG pipelines.

SmartBuckets store files like a traditional bucket, then automatically read and understand every page, image, and table. This processing makes all information instantly searchable and usable. Both humans and AI agents can interact with your data through specialized AI endpoints.

## Understanding AI Decomposition

When you upload a file to a SmartBucket, it triggers AI decomposition. This process transforms raw files into AI-enhanced resources. Here's what happens when you upload a PDF:

AI Layer

AI model 1

AI model 2

AI model 3

PDF Input

Text

Images

Tables

Metadata

Datastore

Datastore

Datastore

The decomposition process works in several stages:

1. First, the system identifies and extracts different types of content from your file - text, images, tables, metadata and more.
2. Each component is then processed through specialized AI models designed for that specific type of content
3. The enhanced data is stored in optimized datastores, maintaining relationships between different components
4. All of this processed information becomes immediately available for AI queries

### AI models and AI data stores

When you upload data to a SmartBucket, our AI pipeline analyzes it and stores the results in multiple specialized systems including vector stores, graph databases, and relationship stores.

The processing pipeline includes several analysis models that:

- Detect PII (Personal Identifiable Information)
- Screen for harmful content (coming soon)
- Extract relationships between data
- Identify topics and themes
- Generate metadata for improved searchability
- Transcribe audio
- Describe images

While the specific implementation details of our AI models are proprietary, these automated processes ensure your data is thoroughly analyzed and indexed for advanced querying capabilities.

## Supported Data Types and Processing

While you can store any file type, SmartBuckets provide AI enhancement for specific formats:

**Images**

- `image/png`
- `image/jpg`

**Audio**

- `audio/webm`
- `audio/mpeg`
- `audio/wav`
- `audio/mp4`

**Documents**

- `text/plain`
- `application/pdf`

This focused support provides detailed analysis of your content. For regular file storage needs, we recommend using standard Raindrop buckets, as SmartBuckets' pricing is optimized for AI-enhanced storage rather than basic file storage.

## Managing Data

SmartBuckets provide SDKs and APIs for data management, making it familiar for developers while adding powerful AI capabilities. When you add data to a SmartBucket, it automatically triggers the AI enhancement pipeline, preparing your content for advanced search and retrieval.

### Adding Data

When you upload files to a SmartBucket, several processes occur:

1. The file is stored securely in the underlying storage system
2. The AI decomposition pipeline analyzes and processes the content
3. The extracted information is indexed for search and retrieval

You can add data to a SmartBucket through the [API, CLI, and SDK](https://docs.liquidmetal.ai/sdk/examples/object-storage).

### Removing Data

When you delete data from a SmartBucket, the system:

1. Removes the original file from storage
2. Cleans up all associated AI-enhanced data
3. Updates indexes and search capabilities accordingly

You can remove data from a SmartBucket through the [API, CLI, and SDK](https://docs.liquidmetal.ai/sdk/examples/object-storage).

## Query Types and Search Capabilities

SmartBuckets offer multiple search mechanisms, each designed for specific use cases and user needs.

### Natural Language Search

Natural language search accepts simple English queries instead of complex search syntax. Describe what you're looking for in plain language, and the system finds relevant results.

For example, instead of constructing a complex boolean query, you might ask: "Find all documents about climate change that include graphs of temperature data." The system understands the semantic meaning of your request and searches across both textual content and visual elements to find relevant matches.

General search expands beyond simple keyword matches. You can use natural language queries that span multiple types of content. For example, imagine a law firm that needs to find specific case files. They could search:

"Find documents with photos of property damage and text about insurance fraud"

This query demonstrates the search capabilities. It searches both images and text simultaneously, understands plain English requests, and finds related content across documents.

The system supports complex nested queries for example:

- "Find documents containing financial reports and images of signatures"
- "Find documents with employee photos where the person is wearing a blue uniform and the text mentions 'safety violations'"
- "Find contracts containing both company logos and signatures where the document text mentions 'confidentiality'"
- "Find documents about company policies that contain PII specifically emails and names"
- "Find audio files in which people discuss data policies"

Natural language search is available through the [API, CLI, and SDK](https://docs.liquidmetal.ai/sdk/examples/query).

### Chunk Search for AI Integration

Chunk search is specifically designed for AI applications and RAG pipelines. This specialized search function:

- Analyzes input queries for semantic understanding
- Returns the 20 most relevant text chunks from your data
- Ranks results based on relevance to the query
- Optimizes output format for LLM consumption

Chunk search finds relevant content and returns the exact paragraphs that answer your question. The system returns these text chunks ranked by relevance, ready for AI applications.

Chunk search is available through the [API, CLI, and SDK](https://docs.liquidmetal.ai/sdk/examples/query).

### Document Query

Document Query lets you have AI-powered conversations about your stored documents. You can ask questions about any part of a document - text, images, tables, or metadata - and get relevant answers based on the document's content.

Document Query integrates directly with large language models. Every query you make is processed by an LLM that has full context of your document, including all the enhanced data extracted by SmartBuckets' AI layer. This means you can ask complex questions, request specific analyses, or extract structured data with natural language commands.

For implementation details, refer to our [API documentation](https://docs.liquidmetal.ai/sdk/examples/query) or [SDK examples](https://docs.liquidmetal.ai/sdk/examples/query/).

## Advanced Search Capabilities

SmartBuckets provide several specialized search features enabled by expert AI models run on your content during upload:

Content Analysis:

- Document content search with semantic understanding
- Image content analysis and recognition
- Audio transcription search
- Cross-modal query support

Security Features:

- PII (Personal Identifiable Information) detection
- Access logging and tracking (coming soon)
- Sensitive data identification (coming soon)

### Personal Identifiable Information (PII)

SmartBuckets can detect the following types of personal identifiable information (PII):

- Account numbers
- Building numbers
- City names
- Credit card numbers
- Dates of birth
- Driver's license numbers
- Email addresses
- Given names (first names)
- ID card numbers

- Passwords
- Social security numbers
- Street addresses
- Surnames (last names)
- Tax identification numbers
- Telephone numbers
- Usernames
- ZIP codes

PII detection can be incorporated into your queries using the search endpoint.

Example search queries for PII:

- "Find documents containing personal information"
- "Find all documents that do not contain PII"
- "Find PDF documents that contain emails and social security numbers"

## Pricing and Token Usage

SmartBucket operations use token-based pricing determined by query complexity and type. SmartBuckets use a unified flat-rate token system where input and output tokens cost the same. Token consumption depends on underlying AI agent operations, not final output size or format.

### Core Query Types and Token Usage

#### Search Operations

Search operations utilize an advanced AI agent to process queries and analyze data including derived metadata. Token consumption scales with query complexity, particularly with the number of sub-questions or conditions in a query.

Base token consumption:

- Base search query: ~2,750 tokens
- Additional sub-question: ~1,100 tokens per question

Examples of token consumption:

- "Give me all my PDFs" - uses approximately 2,750 tokens
- "Give me all my PDFs without pictures of cats" - uses approximately 3,850 tokens (2,750 + 1,100)
- "Give me all my PDFs without pictures of cats, that do not contain PII" - uses approximately 4,950 tokens (2,750 + 1,100 + 1,100)

#### Chunk Search Operations

Chunk search operations follow a simpler token model with consistent token usage:

- Each chunk search request: ~900 tokens
- Token consumption remains constant regardless of result size

#### Document query

Document query operations scale with both input document size and query complexity:

- Base cost per document query: ~1000 tokens
- Document processing: ~800 tokens per page of text
- Query response generation: Varies based on requested output format and length

Token breakdown for a typical document operation:

- Base cost: 1,000 tokens
- Document processing: 4,000 tokens (5 pages × 800 tokens)
- Summary generation: ~1,000 tokens

Total: ~6,000 tokens