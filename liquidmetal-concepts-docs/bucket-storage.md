# Bucket Storage

## What Is Bucket Storage?

Applications need to handle files. Small projects save files to the local filesystem, but this approach fails with redundancy, global distribution, concurrent access, or scaling beyond a single server.

Files differ from database records. They're often large, infrequently accessed, and served directly to users rather than processed by application logic. A user's profile photo might be viewed thousands of times but updated rarely. A PDF report might be generated once and downloaded many times from different locations.

Bucket storage treats files as discrete objects identified by unique keys. Instead of hierarchical directories that might not reflect usage patterns, you design keys that match your application's logic. A user's profile photo might use key `users/12345/profile.jpg`, while a quarterly report uses `reports/2024/q3/summary.pdf`. The key becomes the addressing mechanism, and the storage system handles distribution, redundancy, and access optimization.

## Core Concepts

**Key-Based Addressing**
Every object in bucket storage has a unique string key that serves as its address. Unlike filesystem paths, keys are arbitrary strings that encode organizational logic for your application. You might include user IDs, dates, content types, or processing stages to efficiently locate and manage your data.

**Object Immutability Patterns**
While bucket storage supports overwriting objects, many applications treat objects as immutable. Instead of updating `user/123/avatar.jpg`, you create `user/123/avatar-2024-03-15.jpg` and update a database record to point to the new version. This pattern provides natural versioning and simplifies caching strategies.

**Content-Type Awareness**
Bucket storage understands MIME types and HTTP semantics. When you store an image, you can specify its content type, and the storage system will serve it with appropriate headers. This enables direct serving to browsers, proper caching behavior, and integration with CDN systems.

**Global Distribution Model**
Objects replicate automatically across geographic regions for redundancy and performance. When a user requests a file, the system serves it from the closest available location without requiring application logic to manage this complexity.

## How It Works

Object storage uses a simple put/get model. When you store an object, you specify its key, content, and optional metadata like content type and caching headers. The storage system handles the actual placement, replication, and indexing automatically.

Retrieval happens through direct HTTP URLs or application code. For public content like images or documents, you generate URLs that browsers access directly. For private content, your application controls access and streams data through your services with authentication and authorization.

The addressing system is flat with no directories or hierarchical structures to manage. Keys that look like paths ( `users/123/documents/contract.pdf`) are strings containing slash characters. You can reorganize your logical structure by changing key patterns without moving actual data.

Metadata handling is built into the storage system. Beyond content type, you can attach custom metadata to objects - creation dates, processing status, owner information, or any other key-value pairs that help your application manage the content lifecycle.

## Trade-offs and Considerations

**Eventual Consistency**
Bucket storage prioritizes availability and partition tolerance over immediate consistency. When you store an object, it may take moments to propagate to all regions. This is usually invisible to users, but applications must account for the possibility that a just-uploaded file might not be immediately available everywhere.

**Key Design Impact**
Key structure has long-term implications for organization and performance. Keys that start with timestamps create hotspots as all new content goes to the same storage partitions. Keys that include user IDs distribute better but make it harder to query for related content. Consider your access patterns when designing key schemas.

**Storage Costs vs Retrieval Costs**
Different storage classes optimize for different usage patterns. Frequently accessed content should use standard storage, while archival content can use cheaper storage classes with higher retrieval costs. Applications must match storage strategy with actual usage patterns.

**Direct Access vs Controlled Access**
Generating direct HTTP URLs for objects enables efficient content delivery but bypasses application-level access controls. You need to decide whether objects are public, private, or require dynamic authorization. This choice affects both security and performance characteristics.

**Size and Processing Limitations**
While bucket storage handles objects from bytes to gigabytes, very large files might need special handling for upload and processing. Applications might need to support chunked uploads, resumable transfers, or background processing workflows for large content.

## Connections

Bucket storage integrates seamlessly with services for upload and download workflows. Services handle user authentication, validate file types and sizes, generate appropriate access URLs, and coordinate with other system components. The stateless nature of services matches well with the stateless nature of object storage.

The relationship with observers enables powerful processing pipelines. When objects are uploaded to buckets, observers can automatically trigger image resizing, document processing, virus scanning, or content analysis without requiring synchronous processing during upload.

Database integration typically involves storing object keys and metadata in SQL while keeping the actual file content in buckets. A blog post record might include a `featured_image_key` column that references an object in bucket storage. This separation optimizes each system for what it does best.

CDN and edge delivery work naturally with bucket storage. Objects can be cached at edge locations worldwide, reducing latency for global users. The HTTP-native design means standard web caching strategies apply directly to stored objects.

For AI-enhanced applications, bucket storage often feeds into SmartBuckets for content analysis and search capabilities. You might store original files in standard buckets for efficient serving while processing them through SmartBuckets for semantic search and intelligent organization.